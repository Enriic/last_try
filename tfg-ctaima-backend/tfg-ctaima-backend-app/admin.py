from django.contrib import admin
from .models import User, TipoDocumento, Documento, Validacion, Log

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'email', 'timestamp_created', 'timestamp_updated')
    search_fields = ('name', 'email')
    readonly_fields = ('timestamp_created', 'timestamp_updated')

@admin.register(TipoDocumento)
class TipoDocumentoAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre', 'descripcion')
    search_fields = ('nombre',)

@admin.register(Documento)
class DocumentoAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre', 'usuario', 'tipo_documento', 'url', 'timestamp')
    list_filter = ('tipo_documento', 'usuario')
    search_fields = ('nombre',)
    readonly_fields = ('timestamp',)

@admin.register(Validacion)
class ValidacionAdmin(admin.ModelAdmin):
    list_display = ('id', 'documento', 'usuario', 'estado', 'timestamp')
    list_filter = ('estado', 'usuario', 'documento')
    readonly_fields = ('timestamp',)

@admin.register(Log)
class LogAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'evento', 'detalle', 'timestamp')
    list_filter = ('usuario', 'evento')
    search_fields = ('evento', 'detalle')
    readonly_fields = ('timestamp',)
