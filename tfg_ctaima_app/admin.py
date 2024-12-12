from django.contrib import admin
from .models import Document, DocumentType, Log, Validation

@admin.register(DocumentType)
class DocumentTypeAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'description']
    search_fields = ['name', 'description']

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'document_type', 'user', 'timestamp']
    readonly_fields = ['id', 'timestamp']
    search_fields = ['name', 'document_type__name']
    list_filter = ['document_type', 'timestamp']

@admin.register(Validation)
class ValidationAdmin(admin.ModelAdmin):
    list_display = ['id', 'document', 'user', 'status', 'timestamp']
    readonly_fields = ['id', 'timestamp']
    list_filter = ['status', 'timestamp']
    search_fields = ['document__name', 'user__username']

@admin.register(Log)
class LogAdmin(admin.ModelAdmin):
    list_display = ['timestamp', 'user', 'event']
    readonly_fields = ['timestamp']
    list_filter = ['timestamp', 'user']
    search_fields = ['event', 'details', 'user__username']
