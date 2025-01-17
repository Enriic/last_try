from django.contrib import admin
from django.contrib.auth.models import User  # Importar el modelo User de Django
from django.contrib.auth.admin import UserAdmin  # Importar el administrador del modelo User de Django
from .models import Document, DocumentType, Log, Validation, Company, Resource, Vehicle, Employee, FieldToExtract, FieldToValidate

# Comentamos el registro del modelo de usuario personalizado existente
# @admin.register(Users)
# class UsersAdmin(admin.ModelAdmin):
#     list_display = ['id', 'name', 'email', 'role', 'created_at', 'updated_at']
#     search_fields = ['name', 'email', 'role']
#     list_filter = ['role', 'created_at', 'updated_at']

# Eliminar la línea que intenta registrar el modelo User de Django
# admin.site.register(User, UserAdmin)

@admin.register(DocumentType)
class DocumentTypeAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'description']
    search_fields = ['name', 'description']

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'document_type','resource', 'user', 'timestamp']
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

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ['id', 'company_id', 'company_name', 'industry', 'email', 'location', 'phone', 'language', 'timestamp']
    search_fields = ['company_name', 'industry', 'email', 'location', 'phone', 'language']
    list_filter = ['industry', 'timestamp']

@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ['id', 'resource_type', 'company', 'timestamp']


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'registration_id', 'manufacturer', 'model', 'weight']


@admin.register(Employee)  
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ['id', 'first_name', 'last_name', 'email', 'phone', 'country', 'worker_id']

@admin.register(FieldToExtract)
class FieldToExtractAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'description']

@admin.register(FieldToValidate)
class FieldToValidateAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'description', 'treshold']



