from rest_framework import serializers
from .models import User, TipoDocumento, Documento, Validacion, Log

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'password', 'email', 'timestamp_created', 'timestamp_updated']

class TipoDocumentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoDocumento
        fields = ['id', 'nombre', 'descripcion', 'campos']

class DocumentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Documento
        fields = ['id', 'usuario', 'tipo_documento', 'nombre', 'url', 'timestamp']

class ValidacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Validacion
        fields = ['id', 'documento', 'usuario', 'estado', 'resultado_json', 'timestamp']

class LogSerializer(serializers.ModelSerializer):
    class Meta:
        model = Log
        fields = ['usuario', 'evento', 'detalle', 'timestamp']
