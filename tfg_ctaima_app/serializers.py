from rest_framework import serializers
from .models import User, DocumentType, Document, Validation, Log

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'password', 'email', 'timestamp_created', 'timestamp_updated']

class DocumentTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentType
        fields = ['id', 'name', 'description', 'fields']

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ['id', 'user', 'document_type', 'name', 'url', 'timestamp']

class ValidationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Validation
        fields = ['id', 'document', 'user', 'status', 'validation_details', 'timestamp']

class LogSerializer(serializers.ModelSerializer):
    class Meta:
        model = Log
        fields = ['user', 'event', 'details', 'timestamp']
