# app1/views/document_type_views.py

import logging
from rest_framework import viewsets, status
from rest_framework.decorators import action, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response

from ..models import DocumentType, Document, Log, EventType
from ..serializers import DocumentTypeSerializer, DocumentSerializer
from .decorators import log_event
from .pagination import StandardResultsSetPagination

logger = logging.getLogger(__name__)

class DocumentTypeViewSet(viewsets.ModelViewSet):
    queryset = DocumentType.objects.all()
    serializer_class = DocumentTypeSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsAdminUser]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(DocumentTypeViewSet, self).get_permissions()

    @log_event(EventType.CREATE_DOCUMENT_TYPE)
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        document_type = serializer.save()
        logger.info(f"Tipo de documento '{document_type.name}' creado por '{request.user.username}'.")
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @log_event(EventType.UPDATE_DOCUMENT_TYPE)
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @log_event(EventType.DELETE_DOCUMENT_TYPE)
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        logger.info(f"Tipo de documento '{instance.name}' eliminado por '{request.user.username}'.")
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['get'], url_path='documents', permission_classes=[IsAuthenticated])
    def documents(self, request, pk=None):
        document_type = self.get_object()
        documents = Document.objects.filter(document_type=document_type).select_related('user', 'resource', 'company')
        serializer = DocumentSerializer(documents, many=True)
        logger.info(f"Usuario '{request.user.username}' obtuvo los documentos para el tipo '{document_type.name}'.")
        return Response(serializer.data)
