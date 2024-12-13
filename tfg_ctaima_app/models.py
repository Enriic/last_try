from django.db import models
from django.contrib.auth.models import Users
import uuid
from enum import Enum

class EventType(Enum):
    CREATE_DOCUMENT = 'CREATE_DOCUMENT'
    CREATE_VALIDATION = 'CREATE_VALIDATION'
    EDIT_VALIDATION = 'EDIT_VALIDATION'
    DELETE_VALIDATION = 'DELETE_VALIDATION'
    CREATE_DOCUMENT_TYPE = 'CREATE_DOCUMENT_TYPE'
    DELETE_DOCUMENT = 'DELETE_DOCUMENT'
    EDIT_DOCUMENT = 'EDIT_DOCUMENT'
    EDIT_DOCUMENT_TYPE = 'EDIT_DOCUMENT_TYPE'
    DELETE_DOCUMENT_TYPE = 'DELETE_DOCUMENT_TYPE'

def default_document_type():
    return DocumentType.objects.get_or_create(name="Default")[0].id

class Users(models.Model):
    id = models.AutoField(primary_key=True, unique=True)
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    role = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class DocumentType(models.Model):
    id = models.AutoField(primary_key=True, unique=True)
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    fields = models.JSONField(default=list)  # Example: [{'name': 'ID', 'type': 'Number'}, {'name': 'Name', 'type': 'Text'}]

    def __str__(self):
        return self.name

class Document(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(Users, on_delete=models.SET_NULL, null=True)
    document_type = models.ForeignKey(DocumentType, on_delete=models.SET_DEFAULT, default=default_document_type)
    name = models.CharField(max_length=255)
    url = models.URLField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.document_type.name}"

class Validation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('success', 'Success'),
        ('failure', 'Failure'),
    ]

    document = models.ForeignKey(Document, on_delete=models.CASCADE)
    user = models.ForeignKey(Users, on_delete=models.SET_NULL, null=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    validation_details = models.JSONField()  # Stores validation details
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Validation for {self.document.name} - Status: {self.status}"

class Log(models.Model):
    user = models.ForeignKey(Users, on_delete=models.SET_NULL, null=True, blank=True)
    event = models.CharField(max_length=255)
    details = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Log {self.timestamp}: {self.event}"


