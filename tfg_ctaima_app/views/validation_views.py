# app1/views/validation_views.py

import logging
import json
import requests
import os

from django.conf import settings
from django.shortcuts import get_object_or_404
from django.db import transaction
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, status, filters as rest_framework_filters
from rest_framework.decorators import action, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .decorators import log_event
from ..models import Validation, Document, Log, EventType
from ..serializers import ValidationSerializer, LogSerializer
from .filters import ValidationFilter
from .pagination import StandardResultsSetPagination
from ..utils import transform_validation_details, generate_sas_token, update_info, process_api_response, transform_fields

from azure.storage.blob import BlobSasPermissions

logger = logging.getLogger(__name__)

class ValidationViewSet(viewsets.ModelViewSet):
    queryset = Validation.objects.all().select_related('document__document_type', 'user').order_by('-timestamp')
    serializer_class = ValidationSerializer
    filter_backends = [rest_framework_filters.OrderingFilter, DjangoFilterBackend]
    filterset_class = ValidationFilter
    ordering_fields = ['timestamp', 'id']
    ordering = ['-timestamp', '-id']
    pagination_class = StandardResultsSetPagination
    permission_classes = [IsAuthenticated]

    @log_event(EventType.CREATE_VALIDATION)
    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        validation_details = request.data.get('validation_details')
        logger.debug(f"Detalles de validación recibidos: {validation_details}")
        print(f"Validation Details: {validation_details}")

        try:
            request_validation_details = transform_validation_details(validation_details)
            document = get_object_or_404(Document, id=request.data['document'])
            _, ext = os.path.splitext(document.name)
            doc_name = f"{settings.ENVIRONMENT}/{document.file_hash}{ext}"
            sas_token = generate_sas_token(doc_name, BlobSasPermissions(read=True, write=False, delete=False))

            req_params = {
                "fields_to_validate": request_validation_details['fields_to_validate'],
                "fields_to_extract": request_validation_details['fields_to_extract'],
                "account_url": f"https://{settings.AZURE_ACCOUNT_NAME}.blob.core.windows.net",
                "container_name": settings.AZURE_CONTAINER,
                "doc_name": doc_name,
                "sas_token": sas_token,
                "document_type": document.document_type.api_doc_type_text,
                "sign": document.document_type.sign,
                "tfg": True,
                "uuid": "dasdbahhdjaj",
                "pattern_validation": document.document_type.pattern_validation,
            }

            if document.document_type.pattern_invalidation is not None:
                req_params["pattern_invalidation"] = document.document_type.pattern_invalidation
            if document.document_type.id == 4:
                req_params["sign"] = True

            logger.debug(f"Parámetros de validación enviados al endpoint: {req_params}")
            print(req_params)

            response = requests.post(
                settings.VALIDATION_ENDPOINT,
                json=req_params,
                headers={
                    "Ocp-Apim-Subscription-Key": settings.OCP_APIM_VALIDATION_SUBSCRIPTION_KEY,
                    "Content-Type": "application/json"
                }
            )

            template = {
                "fields_to_validate": request_validation_details['fields_to_validate'],
                "fields_to_extract": request_validation_details['fields_to_extract'],
            }

            response.raise_for_status()
            validation_result = response.json()

            print(f"Validation Result: {validation_result}")

            updated_template = process_api_response(validation_result, template)
            # print(f"updated_template KKKK: {updated_template}")
            # logger.info(f"Resultado de la validación: {validation_result}")

        except requests.exceptions.RequestException as e:
            logger.error(f"Error durante la solicitud de validación: {str(e)}")
            return Response({"error": f"Error during validation request: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # if isinstance(validation_details, str):
        #     try:
        #         validation_details = json.loads(validation_details)
        #     except json.JSONDecodeError:
        #         logger.error("validation_details no es un JSON válido.")
        #         return Response({"error": "validation_details no es un JSON válido."}, status=status.HTTP_400_BAD_REQUEST)
        # elif not isinstance(validation_details, dict):
        #     logger.error("validation_details debe ser un objeto JSON.")
        #     return Response({"error": "validation_details debe ser un objeto JSON."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # plantilla_actualizada = update_info(validation_result, validation_details)
            new_fields_transformed = transform_fields(updated_template)
            # print(f"\n\n new_fields_transformed NEW NEW NEW: {new_fields_transformed}")
            # logger.debug(f"Plantilla actualizada: {plantilla_actualizada}")
        except TypeError as e:
            logger.error(f"Error al actualizar la plantilla: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        # if validation_result.get('result') == 'OK':
        #     status_validation = 'success'
        # elif validation_result.get('result') == 'KO':
        #     justificacion = validation_result.get('justification')
        #     status_validation = 'failure'
        # else:
        #     status_validation = 'pending'

        # serializer.save(
        #     validation_details=new_fields_transformed,
        #     # validation_details=plantilla_actualizada,
        #     status=status_validation
        # )

        result = validation_result.get("result")
        status_validation = (
            "success" if result == "OK" else
            "failure" if result == "KO" else
            "pending"
        )

        extra_fields = {"justification": validation_result.get("justificacion")} if result == "KO" else {}

        serializer.save(
            validation_details=new_fields_transformed,
            status=status_validation,
            **extra_fields
        )

        logger.info(f"Validación '{serializer.instance.id}' creada para el documento '{serializer.instance.document.name}'.")
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @log_event(EventType.UPDATE_VALIDATION)
    def partial_update(self, request, pk=None):
        validation = self.get_object()
        serializer = self.get_serializer(validation, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        logger.info(f"Validación '{serializer.instance.id}' actualizada por '{request.user.username}'.")
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='search', permission_classes=[IsAuthenticated])
    def search(self, request):
        query = request.GET.get('query', '')
        if query:
            validations = Validation.objects.filter(id__icontains=query).select_related('document', 'user')
            serializer = self.get_serializer(validations, many=True)
            logger.info(f"Usuario '{request.user.username}' buscó validaciones con query '{query}'.")
            return Response(serializer.data)
        logger.warning("Solicitud de búsqueda sin término proporcionado.")
        return Response({'error': 'No se proporcionó un término de búsqueda.'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], url_path='allValidations', permission_classes=[IsAuthenticated])
    def get_all(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        logger.info(f"Usuario '{request.user.username}' obtuvo todas las validaciones filtradas.")
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'], url_path='logs', permission_classes=[IsAuthenticated])
    def logs(self, request, pk=None):
        validation = self.get_object()
        logs = Log.objects.filter(details__icontains=f"'{validation.id}'").select_related('user')
        from ..serializers import LogSerializer
        serializer = LogSerializer(logs, many=True)
        logger.info(f"Usuario '{request.user.username}' obtuvo los logs para la validación '{validation.id}'.")
        return Response(serializer.data)
