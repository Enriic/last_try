from rest_framework import serializers
from django.contrib.auth.models import User  # Importar el modelo User de Django
from .models import Company, Resource, Vehicle, Employee, DocumentType, Document, Validation, Log

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'email', 'first_name', 'last_name', 'date_joined', 'is_staff', 'is_superuser', 'is_active']

# Serializer para Company
class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ['id', 'tax_id', 'company_name', 'industry', 'email', 'location', 'phone', 'language', 'timestamp']


class ResourceSerializer(serializers.ModelSerializer):
    company_info = CompanySerializer(source='company', read_only=True)
    resource_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Resource
        fields = ['id', 'resource_type', 'company', 'company_info', 'resource_details','timestamp']


    def get_resource_details(self, obj):
        """Returns specific details of the resource (Vehicle or Employee)."""
        if hasattr(obj, 'vehicle'):
            return VehicleDetailsSerializer(obj.vehicle, context=self.context).data
        elif hasattr(obj, 'employee'):
            return EmployeeDetailsSerializer(obj.employee, context=self.context).data
        else:
            return None


# Simple serializer for vehicle-specific fields
class VehicleDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = [
            'name', 'registration_id', 'manufacturer', 'model', 'weight'
        ]


# Simple serializer for employee-specific fields
class EmployeeDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = [
            'first_name', 'last_name', 'email', 'phone', 'country', 'number_id'
        ]


# Serializer for Vehicle, includes fields from BaseResourceSerializer and Vehicle
class VehicleSerializer(ResourceSerializer):
    class Meta(ResourceSerializer.Meta):
        model = Vehicle
        fields = ResourceSerializer.Meta.fields + [
            'name', 'registration_id', 'manufacturer', 'model', 'weight'
        ]


# Serializer for Employee, includes fields from BaseResourceSerializer and Employee
class EmployeeSerializer(ResourceSerializer):
    class Meta(ResourceSerializer.Meta):
        model = Employee
        fields =ResourceSerializer.Meta.fields + [
            'first_name', 'last_name', 'email', 'phone', 'country', 'number_id'
        ]


class DocumentTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentType
        fields = ['id','user', 'name', 'description', 'fields']
        

class DocumentSerializer(serializers.ModelSerializer):
    document_type_info = DocumentTypeSerializer(source='document_type', read_only=True)
    resource_info = ResourceSerializer(source='resource', read_only=True)

    class Meta:
        model = Document
        fields = ['id', 'user','resource', 'resource_info', 'document_type', 'document_type_info', 'name', 'url', 'timestamp']

class ValidationSerializer(serializers.ModelSerializer):
    document_info = DocumentSerializer(source='document', read_only=True)
    class Meta:
        model = Validation
        fields = ['id', 'document', 'user', 'status', 'validation_details', 'document_info', 'timestamp']

class LogSerializer(serializers.ModelSerializer):
    class Meta:
        model = Log
        fields = ['id', 'user', 'event', 'details', 'timestamp']
