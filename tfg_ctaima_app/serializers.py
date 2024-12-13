from rest_framework import serializers
from .models import Users, DocumentType, Document, Validation, Log

class UsersSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = ['id', 'name', 'password', 'email', 'role', 'created_at', 'updated_at']

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
