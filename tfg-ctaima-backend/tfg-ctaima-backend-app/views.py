from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from .models import User, TipoDocumento, Documento, Validacion, Log
from .serializers import UserSerializer, TipoDocumentoSerializer, DocumentoSerializer, ValidacionSerializer, LogSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    @action(detail=False, methods=['post'])
    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def documentos(self, request, pk=None):
        """Obtener todos los documentos de un usuario específico"""
        user = self.get_object()
        documentos = Documento.objects.filter(user=user)
        serializer = DocumentoSerializer(documentos, many=True)
        return Response(serializer.data)

class DocumentoViewSet(viewsets.ModelViewSet):
    queryset = Documento.objects.all()
    serializer_class = DocumentoSerializer

@action(detail=False, methods=['post'])
    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            # Crear un log cuando se crea un nuevo documento
            Log.objects.create(
                documento=serializer.instance,
                accion="CREAR",
                usuario=request.user
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def validaciones(self, request, pk=None):
        """Obtener todas las validaciones de un documento específico"""
        documento = self.get_object()
        validaciones = Validacion.objects.filter(documento=documento)
        serializer = ValidacionSerializer(validaciones, many=True)
        return Response(serializer.data)

class ValidacionViewSet(viewsets.ModelViewSet):
    queryset = Validacion.objects.all()
    serializer_class = ValidacionSerializer

    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            # Crear un log cuando se crea una nueva validación
            Log.objects.create(
                documento=serializer.instance.documento,
                accion="VALIDAR",
                usuario=request.user
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TipoDocumentoViewSet(viewsets.ModelViewSet):
    queryset = TipoDocumento.objects.all()
    serializer_class = TipoDocumentoSerializer

    @action(detail=True, methods=['get'])
    def documentos(self, request, pk=None):
        """Obtener todos los documentos de un tipo específico"""
        tipo = self.get_object()
        documentos = Documento.objects.filter(tipo_documento=tipo)
        serializer = DocumentoSerializer(documentos, many=True)
        return Response(serializer.data)

class LogViewSet(viewsets.ModelViewSet):
    queryset = Log.objects.all()
    serializer_class = LogSerializer
    
    def get_queryset(self):
        """Permite filtrar logs por documento"""
        queryset = Log.objects.all()
        documento_id = self.request.query_params.get('documento_id', None)
        if documento_id is not None:
            queryset = queryset.filter(documento_id=documento_id)
        return queryset
