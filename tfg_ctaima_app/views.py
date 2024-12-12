from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from .models import User, DocumentType, Document, Validation, Log
from .serializers import UserSerializer, DocumentTypeSerializer, DocumentSerializer, ValidationSerializer, LogSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    
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
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            # Create a log when a new document is created
            Log.objects.create(
                user=request.user,
                event="CREATE",
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
                event="VALIDATE",
                details=f"Validation for document '{serializer.instance.document.name}' created."
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DocumentTypeViewSet(viewsets.ModelViewSet):
    queryset = DocumentType.objects.all()
    serializer_class = DocumentTypeSerializer

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
