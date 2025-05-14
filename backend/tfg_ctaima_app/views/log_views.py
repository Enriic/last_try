# app1/views/log_views.py

import logging
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response

from ..models import Log, EventType
from ..serializers import LogSerializer
from .decorators import log_event

logger = logging.getLogger(__name__)

class LogViewSet(viewsets.ModelViewSet):
    queryset = Log.objects.all().select_related('user')
    serializer_class = LogSerializer
    permission_classes = [IsAdminUser]
    pagination_class = None

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        log_entry = serializer.save()
        logger.info(f"Log creado: {log_entry.details} por '{log_entry.user.username}'.")
        return Response(serializer.data, status=status.HTTP_201_CREATED)
