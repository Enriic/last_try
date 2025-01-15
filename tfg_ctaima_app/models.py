from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User  # Importar el modelo User de Django
import uuid
from enum import Enum

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
    LOGIN = 'LOGIN'
    CREATE_USER = 'CREATE_USER'
    UPDATE_USER = 'UPDATE_USER'
    DELETE_USER = 'DELETE_USER'


def default_document_type():
    return DocumentType.objects.get_or_create(name="Default")[0].id

def default_resource():
    return Resource.objects.get_or_create(resource_type='employee')[0].id

class Company(models.Model):
    type_choices = (
        ('customer', 'Customer'),
        ('supplier', 'Supplier'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tax_id = models.CharField(max_length=50, unique=True)
    type = models.CharField(max_length=50, choices=type_choices, default='customer')
    company_name = models.CharField(max_length=255)
    industry = models.CharField(max_length=255)
    email = models.EmailField()
    location = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    language = models.CharField(max_length=50)
    timestamp = models.DateTimeField(auto_now_add=True)

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
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        abstract = False  # No es una clase abstracta, por lo que Django creará una tabla para esta clase.

class Vehicle(Resource):
    
    name = models.CharField(max_length=255)
    registration_id = models.CharField(max_length=50)
    manufacturer = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    weight = models.FloatField()

    def __str__(self):
        return self.name


class Employee(Resource):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    country = models.CharField(max_length=100)
    number_id = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class DocumentType(models.Model):
    id = models.AutoField(primary_key=True, unique=True)
    name = models.CharField(max_length=100, unique=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)  # Usar el modelo User de Django
    description = models.TextField(blank=True, null=True)
    fields = models.JSONField(default=list)  # Example: [{'name': 'ID', 'type': 'Number'}, {'name': 'Name', 'type': 'Text'}]

    def __str__(self):
        return self.name

class Document(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)  # Usar el modelo User de Django
    document_type = models.ForeignKey(DocumentType, on_delete=models.SET_DEFAULT, default=default_document_type)
    name = models.CharField(max_length=255)
    url = models.URLField()
    timestamp = models.DateTimeField(default=timezone.now)

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
    validation_details = models.JSONField()  # Stores validation details
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


