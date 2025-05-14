from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User  # Importar el modelo User de Django
import uuid
from enum import Enum
from django.contrib.postgres.fields import ArrayField

class EventType(Enum):
    CREATE_DOCUMENT = 'CREATE_DOCUMENT'
    CREATE_VALIDATION = 'CREATE_VALIDATION'
    UPDATE_VALIDATION = 'UPDATE_VALIDATION'
    DELETE_VALIDATION = 'DELETE_VALIDATION'
    CREATE_DOCUMENT_TYPE = 'CREATE_DOCUMENT_TYPE'
    DELETE_DOCUMENT = 'DELETE_DOCUMENT'
    EDIT_DOCUMENT = 'EDIT_DOCUMENT'
    EDIT_DOCUMENT_TYPE = 'EDIT_DOCUMENT_TYPE'
    DELETE_DOCUMENT_TYPE = 'DELETE_DOCUMENT_TYPE'
    UPDATE_DOCUMENT_TYPE = 'UPDATE_DOCUMENT_TYPE'
    LOGIN = 'LOGIN',
    LOGOUT = 'LOGOUT',
    CREATE_USER = 'CREATE_USER'
    UPDATE_USER = 'UPDATE_USER'
    DELETE_USER = 'DELETE_USER'
    CREATE_COMPANY = 'CREATE_COMPANY'
    UPDATE_COMPANY = 'UPDATE_COMPANY'
    DELETE_COMPANY = 'DELETE_COMPANY'
    CREATE_RESOURCE = 'CREATE_RESOURCE'
    UPDATE_RESOURCE = 'UPDATE_RESOURCE'
    DELETE_RESOURCE = 'DELETE_RESOURCE'
    CREATE_FIELD_TO_VALIDATE = 'CREATE_FIELD_TO_VALIDATE'
    UPDATE_FIELD_TO_VALIDATE = 'UPDATE_FIELD_TO_VALIDATE'
    DELETE_FIELD_TO_VALIDATE = 'DELETE_FIELD_TO_VALIDATE'
    CREATE_FIELD_TO_EXTRACT = 'CREATE_FIELD_TO_EXTRACT'
    UPDATE_FIELD_TO_EXTRACT = 'UPDATE_FIELD_TO_EXTRACT'
    DELETE_FIELD_TO_EXTRACT = 'DELETE_FIELD_TO_EXTRACT'
    CREATE_LOG = 'CREATE_LOG'
    DELETE_LOG = 'DELETE_LOG'
    UPDATE_LOG = 'UPDATE_LOG'
    CREATE_EMPLOYEE = 'CREATE_EMPLOYEE'
    UPDATE_EMPLOYEE = 'UPDATE_EMPLOYEE'
    DELETE_EMPLOYEE = 'DELETE_EMPLOYEE'
    CREATE_VEHICLE = 'CREATE_VEHICLE'
    UPDATE_VEHICLE = 'UPDATE_VEHICLE'
    DELETE_VEHICLE = 'DELETE_VEHICLE'
    


def default_document_type():
    return DocumentType.objects.get_or_create(name="Default")[0].id

def default_resource():
    return Resource.objects.get_or_create(resource_type='employee')[0].id

class Company(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company_id = models.CharField(max_length=50, unique=True)
    company_name = models.CharField(max_length=255)
    industry = models.CharField(max_length=255, blank=True, null=True)
    email = models.EmailField(null=True, blank=True, unique=True)
    location = models.CharField(max_length=255)
    phone = models.CharField(max_length=20, null=True, blank=True)
    language = models.CharField(max_length=50, null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['company_name', 'company_id']  # Define el orden por defecto
        verbose_name = "Company"
        verbose_name_plural = "Companies"

    def __str__(self):
        return self.company_name

# Modelo para Resource (Puede ser un Employee o un Vehicle)
class Resource(models.Model):
    type_choices = (
        ('employee', 'Employee'),
        ('vehicle', 'Vehicle'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    resource_type = models.CharField(max_length=50, choices=type_choices, default='employee')
    #company = models.ForeignKey(Company, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['id', 'timestamp']  # Define el orden por defecto
        verbose_name = "Resource"
        verbose_name_plural = "Resources"
        abstract = False  # No es una clase abstracta, por lo que Django creará una tabla para esta clase.

class Vehicle(Resource):
    name = models.CharField(max_length=255)
    registration_id = models.CharField(max_length=50)
    manufacturer = models.CharField(max_length=100, blank=True, null=True)
    model = models.CharField(max_length=100, blank=True, null=True)
    weight = models.FloatField(blank=True, null=True)

    def __str__(self):
        return self.name


class Employee(Resource):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=25, blank=True, null=True)
    country = models.CharField(max_length=100)
    worker_id = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class AssociatedEntity(models.TextChoices):
    RESOURCE = 'resource', 'Resource'
    COMPANY = 'company', 'Company'


class DocumentType(models.Model):
    id = models.AutoField(primary_key=True, unique=True)
    name = models.CharField(max_length=100, unique=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)  # Usar el modelo User de Django
    description = models.TextField(blank=True, null=True)
    api_doc_type_text = models.CharField(max_length=50, default='')
    sign = models.BooleanField(default=False)
    pattern_validation = models.JSONField(blank=True, null=True)
    pattern_invalidation = models.JSONField(blank=True, null=True)

    associated_entities = ArrayField(
        models.CharField(max_length=50, choices=AssociatedEntity.choices),
        default=list,
        blank=True
    )

    class Meta:
        ordering = ['id', 'name']  # Define el orden por defecto
        verbose_name = "Document Type"
        verbose_name_plural = "Document Types"

    def __str__(self):
        return self.name

class FieldToValidate(models.Model):
    id = models.AutoField(primary_key=True, unique=True)
    name = models.CharField(max_length=100,null=False)
    description = models.TextField(blank=True, null=True)
    expected_value = models.CharField(max_length=100,null=True,blank=True, default='')
    treshold = models.FloatField(blank=True, null=True, default=80)
    document_types = models.ManyToManyField(DocumentType, related_name="fields_to_validate")  # Relación many-to-many

    def __str__(self):
        return self.name

class FieldToExtract(models.Model):
    id = models.AutoField(primary_key=True, unique=True)
    name = models.CharField(max_length=100,null=False)
    description = models.TextField(blank=True, null=True)
    document_types = models.ManyToManyField(DocumentType, related_name="fields_to_extract")  # Relación many-to-many

    def __str__(self):
        return self.name

class Document(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, null=True, blank=True)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)  # Usar el modelo User de Django
    document_type = models.ForeignKey(DocumentType, on_delete=models.SET_DEFAULT, default=default_document_type)
    name = models.CharField(max_length=255)
    url = models.URLField(max_length=500)
    timestamp = models.DateTimeField(default=timezone.now)
    file_hash = models.CharField(max_length=500, unique=True, blank=True, null=True)

    def __str__(self):
        return f"{self.name} - {self.document_type.name}"


class Validation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    STATUS_CHOICES = [
        ('pending', 'Pending'), # General status , # Validation field status
        ('success', 'Success'),
        ('failure', 'Failure'),
    ]

    document = models.ForeignKey(Document, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)  # Usar el modelo User de Django
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    validation_details = models.JSONField()  
    justification = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Validation for {self.document.name} - Status: {self.status}"

class Log(models.Model):
    id = models.AutoField(primary_key=True, unique=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)  # Usar el modelo User de Django
    event = models.CharField(max_length=255)
    details = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Log {self.timestamp}: {self.event}"


