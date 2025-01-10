from rest_framework import serializers
from django.contrib.auth.models import User  # Importar el modelo User de Django
from .models import DocumentType, Document, Validation, Log

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'email', 'first_name', 'last_name', 'date_joined', 'is_staff', 'is_superuser', 'is_active']

class DocumentTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentType
        fields = ['id','user', 'name', 'description', 'fields']

class DocumentSerializer(serializers.ModelSerializer):
    document_type_info = DocumentTypeSerializer(source='document_type', read_only=True)
    class Meta:
        model = Document
        fields = ['id', 'user', 'document_type_info', 'name', 'url', 'timestamp']

class ValidationSerializer(serializers.ModelSerializer):
    document_info = DocumentSerializer(source='document', read_only=True)
    class Meta:
        model = Validation
        fields = ['id', 'document', 'user', 'status', 'validation_details', 'document_info', 'timestamp']

class LogSerializer(serializers.ModelSerializer):
    class Meta:
        model = Log
        fields = ['id', 'user', 'event', 'details', 'timestamp']
