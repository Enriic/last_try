from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import (
    Company, Resource, Vehicle, Employee, DocumentType,
    FieldToValidate, FieldToExtract, Document, Validation, Log
)
from .utils import calculate_file_hash  # Función que calcula el hash del archivo


# ------------------------------------------------------------------
# USER SERIALIZER
# Se incorpora la lógica de validación y cifrado de contraseñas
# en los métodos create() y update(), de modo que la vista ya no
# tenga que encargarse de ello.
# ------------------------------------------------------------------
class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'password', 'email',
            'first_name', 'last_name', 'date_joined',
            'is_staff', 'is_superuser', 'is_active'
        ]
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            try:
                validate_password(password, user)
            except ValidationError as e:
                raise serializers.ValidationError({'password': e.messages})
            user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        # Actualizar los demás campos
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            try:
                validate_password(password, instance)
            except ValidationError as e:
                raise serializers.ValidationError({'password': e.messages})
            instance.set_password(password)
        instance.save()
        return instance


# ------------------------------------------------------------------
# COMPANY SERIALIZER
# ------------------------------------------------------------------
class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = [
            'id', 'company_id', 'company_name', 'industry',
            'email', 'location', 'phone', 'language', 'timestamp'
        ]


# ------------------------------------------------------------------
# RESOURCE Y SUBTIPOS
# Se utiliza un método get_resource_details para determinar,
# según el tipo de recurso, qué información adicional devolver.
# ------------------------------------------------------------------
class VehicleDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = ['name', 'registration_id', 'manufacturer', 'model', 'weight']

class EmployeeDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = ['first_name', 'last_name', 'email', 'phone', 'country', 'worker_id']

class ResourceSerializer(serializers.ModelSerializer):
    resource_details = serializers.SerializerMethodField()

    class Meta:
        model = Resource
        fields = ['id', 'resource_type', 'resource_details', 'timestamp']
        # fields = ['id', 'resource_type', 'company', 'resource_details', 'timestamp']


    def get_resource_details(self, obj):
        """
        Retorna detalles específicos del recurso según su tipo.
        Se asume que el objeto hijo (Vehicle o Employee) está accesible
        mediante el atributo cuyo nombre coincide con el valor de resource_type.
        """
        serializer_mapping = {
            'vehicle': VehicleDetailsSerializer,
            'employee': EmployeeDetailsSerializer
        }
        # Se obtiene el objeto hijo (por ejemplo, obj.vehicle o obj.employee)
        child_instance = getattr(obj, obj.resource_type, None)
        if child_instance:
            serializer_class = serializer_mapping.get(obj.resource_type)
            return serializer_class(child_instance, context=self.context).data
        return None

class VehicleSerializer(ResourceSerializer):
    class Meta(ResourceSerializer.Meta):
        model = Vehicle
        fields = ResourceSerializer.Meta.fields + ['name', 'registration_id', 'manufacturer', 'model', 'weight']

class EmployeeSerializer(ResourceSerializer):
    class Meta(ResourceSerializer.Meta):
        model = Employee
        fields = ResourceSerializer.Meta.fields + ['first_name', 'last_name', 'email', 'phone', 'country', 'worker_id']


# ------------------------------------------------------------------
# DOCUMENT TYPE Y CAMPOS RELACIONADOS
# Se emplea un método auxiliar _serialize_fields para evitar duplicación
# en la transformación de los campos asociados.
# ------------------------------------------------------------------
class FieldToValidateOutputSerializer(serializers.ModelSerializer):
    class Meta:
        model = FieldToValidate
        fields = ['id', 'name', 'expected_value', 'description']

class FieldToExtractOutputSerializer(serializers.ModelSerializer):
    class Meta:
        model = FieldToExtract
        fields = ['id', 'name', 'description']

class DocumentTypeSerializer(serializers.ModelSerializer):
    fields_to_validate = serializers.SerializerMethodField()
    fields_to_extract = serializers.SerializerMethodField()

    class Meta:
        model = DocumentType
        fields = [
            'id', 'user', 'name', 'description', 'sign', 'api_doc_type_text',
            'fields_to_validate', 'fields_to_extract', 'associated_entities'
        ]

    def _serialize_fields(self, queryset, serializer_class):
        serializer = serializer_class(queryset, many=True)
        return [
            {
                'id': item['id'],
                'name': item['name'],
                'description': item['description'],
                'value': item.get('value', None)
            }
            for item in serializer.data
        ]

    def get_fields_to_validate(self, obj):
        return self._serialize_fields(obj.fields_to_validate.all(), FieldToValidateOutputSerializer)

    def get_fields_to_extract(self, obj):
        return self._serialize_fields(obj.fields_to_extract.all(), FieldToExtractOutputSerializer)


# ------------------------------------------------------------------
# DOCUMENT SERIALIZER
# Se ha trasladado, en la medida de lo posible, la transformación
# de datos al serializer. Aquí se calcula el hash del archivo (si se
# envía) para asignarlo al campo file_hash. La subida a Azure se
# deja a un servicio externo o a la vista.
# ------------------------------------------------------------------
class DocumentSerializer(serializers.ModelSerializer):
    file = serializers.FileField(
        write_only=True,
        required=False,
        help_text="Campo temporal no vinculado al modelo"
    )

    class Meta:
        model = Document
        fields = [
            'id', 'user', 'resource', 'company', 'document_type',
            'name', 'url', 'timestamp', 'file', 'file_hash'
        ]

    def create(self, validated_data):
        uploaded_file = validated_data.pop('file', None)
        if uploaded_file:
            # Se calcula el hash del archivo usando la función utilitaria.
            file_hash = calculate_file_hash(uploaded_file)
            validated_data['file_hash'] = file_hash
            # Nota: La subida real del archivo (por ejemplo, a Azure Blob Storage)
            # debe realizarse en la vista o en un servicio externo, ya que involucra I/O.
        return super().create(validated_data)


# ------------------------------------------------------------------
# VALIDATION SERIALIZER
# La mayor parte de la lógica compleja (como llamadas a APIs externas)
# se mantiene en la vista, pero este serializer se encarga de presentar
# los datos ya transformados.
# ------------------------------------------------------------------
class ValidationSerializer(serializers.ModelSerializer):
    document_name = serializers.CharField(source='document.name', read_only=True)
    document_type_name = serializers.CharField(source='document.document_type.name', read_only=True)
    resource_id = serializers.UUIDField(source='document.resource.id', read_only=True)
    company = serializers.UUIDField(source='document.company', read_only=True)
    document_type = DocumentTypeSerializer(source='document.document_type', read_only=True)

    class Meta:
        model = Validation
        fields = [
            'id', 'document', 'document_name', 'resource_id', 'company',
            'document_type_name', 'document_type', 'user', 'status', 'justification', 
            'validation_details', 'timestamp'
        ]



# ------------------------------------------------------------------
# LOG SERIALIZER
# ------------------------------------------------------------------
class LogSerializer(serializers.ModelSerializer):
    class Meta:
        model = Log
        fields = ['id', 'user', 'event', 'details', 'timestamp']
