# app1/views/company_views.py

import logging

from rest_framework import viewsets, status, filters as rest_framework_filters
from rest_framework.decorators import action, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response

from ..models import Company, Document, Log, EventType
from ..serializers import CompanySerializer, DocumentSerializer

from .filters import CompanyFilter
from .decorators import log_event
from .pagination import StandardResultsSetPagination

logger = logging.getLogger(__name__)

class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all().order_by('-timestamp')
    serializer_class = CompanySerializer
    filter_backends = [rest_framework_filters.SearchFilter, rest_framework_filters.OrderingFilter]
    search_fields = ['company_name', 'company_id']
    filterset_class = CompanyFilter
    ordering_fields = ['timestamp']
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsAdminUser]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(CompanyViewSet, self).get_permissions()

    @log_event(EventType.CREATE_COMPANY)
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        company = serializer.save()
        logger.info(f"Compañía '{company.company_name}' creada por '{request.user.username}'.")
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @log_event(EventType.UPDATE_COMPANY)
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @log_event(EventType.DELETE_COMPANY)
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        logger.info(f"Compañía '{instance.company_name}' eliminada por '{request.user.username}'.")
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['get'], url_path='documents', permission_classes=[IsAuthenticated])
    def documents(self, request, pk=None):
        company = self.get_object()
        documents = Document.objects.filter(company=company).select_related('document_type', 'user', 'resource')
        serializer = DocumentSerializer(documents, many=True)
        logger.info(f"Usuario '{request.user.username}' obtuvo los documentos para la compañía '{company.company_name}'.")
        return Response(serializer.data)
