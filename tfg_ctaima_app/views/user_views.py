# app1/views/user_views.py

import logging
from django.contrib.auth.models import User
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response

from ..models import Log, EventType
from ..serializers import UserSerializer, ValidationSerializer
from .decorators import log_event

logger = logging.getLogger(__name__)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_permissions(self):
        if self.action in ['create']:
            self.permission_classes = [IsAdminUser]
        elif self.action in ['current']:
            self.permission_classes = [IsAuthenticated]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(UserViewSet, self).get_permissions()

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def current(self, request):
        serializer = self.get_serializer(request.user)
        user = request.user
        roles = []
        if user.is_superuser:
            roles.append('admin')
        if user.is_staff:
            roles.append('staff')
        if user.is_active:
            roles.append('active')
        user_data = serializer.data.copy()
        user_data.pop('password', None)
        user_data['roles'] = roles
        logger.info(f"Usuario '{user.username}' obtuvo su información actual.")
        return Response(user_data)

    @log_event(EventType.CREATE_USER)
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        serializer_data = serializer.data.copy()
        serializer_data.pop('password', None)
        logger.info(f"Usuario '{user.username}' creado por '{request.user.username}'.")
        return Response(serializer_data, status=status.HTTP_201_CREATED)

    @log_event(EventType.UPDATE_USER)
    def partial_update(self, request, pk=None):
        user = self.get_object()
        if request.user == user or request.user.is_staff:
            serializer = self.get_serializer(user, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            if 'password' in serializer.validated_data:
                # La lógica de set_password y validación ya se realiza en el serializer.
                pass
            serializer.save()
            serializer_data = serializer.data.copy()
            serializer_data.pop('password', None)
            logger.info(f"Usuario '{user.username}' actualizado por '{request.user.username}'.")
            return Response(serializer_data)
        else:
            logger.warning(f"Usuario '{request.user.username}' no autorizado para actualizar el perfil de '{user.username}'.")
            return Response({'detail': 'No autorizado.'}, status=status.HTTP_401_UNAUTHORIZED)

    @action(detail=True, methods=['get'], url_path='documents', permission_classes=[IsAuthenticated])
    def documents(self, request, pk=None):
        user = self.get_object()
        documents = user.document_set.select_related('document_type', 'resource', 'company').all()
        # Se asume que se desea serializar los documentos con el serializer correspondiente.
        # Si tienes un DocumentSerializer importado en este módulo, se podría usar:
        from ..serializers import DocumentSerializer
        serializer = DocumentSerializer(documents, many=True)
        logger.info(f"Usuario '{request.user.username}' obtuvo los documentos de '{user.username}'.")
        return Response(serializer.data)

    @action(detail=True, methods=['get'], url_path='validations', permission_classes=[IsAuthenticated])
    def validations(self, request, pk=None):
        user = self.get_object()
        from ..serializers import ValidationSerializer
        validations = Validation.objects.filter(user=user).select_related('document')
        serializer = ValidationSerializer(validations, many=True)
        logger.info(f"Usuario '{request.user.username}' obtuvo las validaciones de '{user.username}'.")
        return Response(serializer.data)
