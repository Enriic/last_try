from django.contrib import admin
from .models import User, TipoDocumento, Documento, Validacion, Log

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('id', 'username', 'email')
    search_fields = ('username', 'email')

@admin.register(TipoDocumento)
class TipoDocumentoAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre')
    search_fields = ('nombre',)

@admin.register(Documento)
class DocumentoAdmin(admin.ModelAdmin):
    list_display = ('id', 'titulo', 'user', 'tipo_documento', 'fecha_creacion')
    list_filter = ('tipo_documento', 'user')
    search_fields = ('titulo',)

@admin.register(Validacion)
class ValidacionAdmin(admin.ModelAdmin):
    list_display = ('id', 'documento', 'fecha_validacion')
    list_filter = ('documento',)

@admin.register(Log)
class LogAdmin(admin.ModelAdmin):
    list_display = ('id', 'documento', 'accion', 'usuario', 'fecha')
    list_filter = ('accion', 'usuario')
    search_fields = ('documento__titulo',)
