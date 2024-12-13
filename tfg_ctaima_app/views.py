from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from .models import Users, DocumentType, Document, Validation, Log, EventType
from .serializers import UsersSerializer, DocumentTypeSerializer, DocumentSerializer, ValidationSerializer, LogSerializer
from tfg_ctaima_app.constants import MOCK_DOCUMENT_URLS
from .models import EventType
import random


class UsersViewSet(viewsets.ModelViewSet):
    queryset = Users.objects.all()
    serializer_class = UsersSerializer

    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def documents(self, request, pk=None):
        """Get all documents for a specific user"""
        user = self.get_object()
        documents = Document.objects.filter(user=user)
        serializer = DocumentSerializer(documents, many=True)
        return Response(serializer.data)

class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        data['url'] = random.choice(MOCK_DOCUMENT_URLS) # Select a random document URL from mock data
        serializer = self.serializer_class(data=data)
        
        if serializer.is_valid():
            serializer.save()
            # Create a log when a new document is created
            Log.objects.create(
                user=request.user,
                event=EventType.CREATE_DOCUMENT,
                details=f"Document '{serializer.instance.name}' created."
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def validations(self, request, pk=None):
        """Get all validations for a specific document"""
        document = self.get_object()
        validations = Validation.objects.filter(document=document)
        serializer = ValidationSerializer(validations, many=True)
        return Response(serializer.data)

class ValidationViewSet(viewsets.ModelViewSet):
    queryset = Validation.objects.all()
    serializer_class = ValidationSerializer

    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            # Create a log when a new validation is created
            Log.objects.create(
                user=request.user,
                event=EventType.CREATE_VALIDATION,
                details=f"Validation for document '{serializer.instance.document.name}' created."
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DocumentTypeViewSet(viewsets.ModelViewSet):
    queryset = DocumentType.objects.all()
    serializer_class = DocumentTypeSerializer

    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            Log.objects.create(
                user=request.user,
                event=EventType.CREATE_DOCUMENT_TYPE,
                details=f"Document type '{serializer.instance.name}' created."
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def documents(self, request, pk=None):
        """Get all documents for a specific document type"""
        document_type = self.get_object()
        documents = Document.objects.filter(document_type=document_type)
        serializer = DocumentSerializer(documents, many=True)
        return Response(serializer.data)

class LogViewSet(viewsets.ModelViewSet):
    queryset = Log.objects.all()
    serializer_class = LogSerializer
    
    def get_queryset(self):
        """Allow filtering logs by document"""
        queryset = Log.objects.all()
        document_id = self.request.query_params.get('document_id', None)
        if document_id is not None:
            queryset = queryset.filter(document_id=document_id)
        return queryset

def actualizar_estado_tarea(tarea, nuevo_estado):
    if nuevo_estado in Estado._value2member_map_:
        tarea.estado = nuevo_estado
        tarea.save()
    else:
        raise ValueError("Estado inválido")
