# # tfg_ctaima_app/views/document_views.py

import os
import json
import logging
from django.conf import settings
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.http import StreamingHttpResponse, JsonResponse

from rest_framework import viewsets, status, filters as rest_framework_filters
from rest_framework.decorators import action, permission_classes, api_view
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from azure.storage.blob import BlobClient, BlobSasPermissions

from ..models import Document, Validation, Log, EventType, Resource
from ..serializers import DocumentSerializer, ValidationSerializer, LogSerializer
from .filters import DocumentFilter
from .pagination import StandardResultsSetPagination
from ..utils import upload_to_blob_storage, calculate_file_hash, generate_sas_token
from .decorators import log_event
from ..renderers import NoOpRenderer  # Asegúrate de la ruta correcta

logger = logging.getLogger(__name__)

class DocumentRetrieveView(APIView):
    permission_classes = [IsAuthenticated]
    renderer_classes = [NoOpRenderer]  # Utilizamos nuestro renderizador que acepta cualquier media

    def get(self, request, pk):
        try:
            document = Document.objects.get(pk=pk)
            _, ext = os.path.splitext(document.name)
            blob_name = f"{settings.ENVIRONMENT}/{document.file_hash}{ext}"

            sas_token = generate_sas_token(blob_name, BlobSasPermissions(read=True))


            blob_client = BlobClient(
                account_url=f"https://{settings.AZURE_ACCOUNT_NAME}.blob.core.windows.net",
                container_name=settings.AZURE_CONTAINER,
                blob_name=f"{blob_name}",
                credential=f'{sas_token}'
            )

            stream = blob_client.download_blob()

            response = StreamingHttpResponse(
                streaming_content=stream.chunks(),
                content_type='application/octet-stream'
            )
            response['Content-Length'] = stream.size
            response['Content-Disposition'] = f'attachment; filename="{document.name}"'
            logger.info(f"User {request.user.username} downloaded document {document.name}")
            return response

        except Document.DoesNotExist:
            logger.warning(f"Document with id {pk} not found.")
            return Response({"error": "Documento no encontrado."}, status=404)
        except Exception as e:
            logger.error(f"Error al descargar el documento {pk}: {str(e)}")
            return Response({"error": f"Error al descargar el documento: {str(e)}"}, status=500)


class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all().select_related('document_type', 'user', 'resource', 'company').order_by('-timestamp')
    serializer_class = DocumentSerializer
    filter_backends = [rest_framework_filters.SearchFilter, rest_framework_filters.OrderingFilter]
    search_fields = ['name', 'id']
    ordering_fields = ['timestamp', 'name', 'id']
    ordering = ['-timestamp', '-id']
    filterset_class = DocumentFilter
    pagination_class = StandardResultsSetPagination
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action == 'create':
            self.permission_classes = [IsAdminUser]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(DocumentViewSet, self).get_permissions()

    @log_event(EventType.CREATE_DOCUMENT)
    @transaction.atomic
    def create(self, request, *args, **kwargs):
        uploaded_file = request.FILES.get('file')
        if not uploaded_file:
            logger.error(f"File not provided in the upload attempt by {request.user.username}.")
            return Response({"error": "File is required"}, status=status.HTTP_400_BAD_REQUEST)

        file_hash = calculate_file_hash(uploaded_file)
        filename = uploaded_file.name
        _, ext = os.path.splitext(filename)
        blob_name = f"{settings.ENVIRONMENT}/{file_hash}{ext}"

        existing_document = Document.objects.filter(file_hash=file_hash).first()
        if existing_document:
            serializer = self.get_serializer(existing_document)
            response_data = {
                'detail': 'A document with the same content already exists.',
                'document': serializer.data
            }
            logger.info(f"Duplicate document upload attempt by {request.user.username}: {filename}")
            return Response(response_data, status=status.HTTP_409_CONFLICT)

        try:
            blob_url = upload_to_blob_storage(uploaded_file, blob_name)
        except Exception as e:
            logger.error(f"Error uploading file: {str(e)}")
            return Response({"error": f"Error uploading file: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Primero, aseguramos que 'associated_entity' sea una lista.
        associated_entities_json = request.data.get('associated_entities', None)
        print('associated_entities_json:', associated_entities_json)
        associated_entities = json.loads(associated_entities_json)
        if not associated_entities:
            associated_entities = ['resource']
        elif isinstance(associated_entities, str):
            # Si solo se envía un string, lo convertimos a lista.
            associated_entities = [associated_entities]

        data = {
            'document_type': request.data.get('document_type'),
            'url': blob_url,
            'name': filename,
            'file_hash': file_hash,
            'user': request.user.id
        }

        # Si se requiere la compañía, la asignamos desde el request
        if 'company' in associated_entities:
            company_value = request.data.get('company')
            if company_value:
                data['company'] = company_value

        # Si se requiere el recurso, lo buscamos y asignamos
        if 'resource' in associated_entities:
            resource_id = request.data.get('resource')
            # No deberia pasar nunca, ya que al crear el documento el campo company es obligatorio
            if resource_id:
                resource = get_object_or_404(Resource, pk=resource_id)
                data['resource'] = resource.id
               


        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        document = serializer.save()
        logger.info(f"Document '{document.name}' created by {request.user.username}")
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'], url_path='validations', permission_classes=[IsAuthenticated])
    def validations(self, request, pk=None):
        document = self.get_object()
        validations = Validation.objects.filter(document=document).select_related('user')
        serializer = ValidationSerializer(validations, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], url_path='logs', permission_classes=[IsAuthenticated])
    def logs(self, request, pk=None):
        document = self.get_object()
        logs = Log.objects.filter(details__icontains=f"'{document.id}'").select_related('user')
        serializer = LogSerializer(logs, many=True)
        return Response(serializer.data)
