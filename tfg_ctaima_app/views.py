from rest_framework import viewsets, status
from django.contrib.auth.decorators import login_required
from rest_framework.response import Response
from rest_framework.decorators import action
from django.contrib.auth.models import User  # Importar el modelo User de Django
from .models import DocumentType, Document, Validation, Log, EventType
from .serializers import UserSerializer, DocumentTypeSerializer, DocumentSerializer, ValidationSerializer, LogSerializer
from tfg_ctaima_app.constants import MOCK_DOCUMENT_URLS
import random
from django.contrib.auth import authenticate, login
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.permissions import IsAuthenticated

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from .models import Log, EventType

@api_view(['POST'])
def login_view(request):
    # Recibir username y password del cuerpo de la solicitud
    username = request.data.get('username')
    password = request.data.get('password')

    # Verificar que se haya proporcionado nombre de usuario y contraseña
    if not username or not password:
        return Response({'error': 'Debe proporcionar un nombre de usuario y contraseña.'}, status=status.HTTP_400_BAD_REQUEST)

    # Autenticar el usuario con las credenciales proporcionadas
    user = authenticate(request, username=username, password=password)

    # Si las credenciales son correctas, iniciar sesión y crear log
    if user is not None:
        login(request, user)  # Establecer la sesión con cookies automáticamente
        Log.objects.create(
            user=request.user,
            event=EventType.LOGIN,
            details=f'User {user.username} logged in successfully.'
        )
        return Response({'message': f'Bienvenido {user.username}!'}, status=status.HTTP_200_OK)

    # Si las credenciales no son correctas
    return Response({'error': 'Credenciales inválidas.'}, status=status.HTTP_401_UNAUTHORIZED)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer


    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            user = User(
                username=serializer.validated_data['username'],
                email=serializer.validated_data['email'],
                first_name=serializer.validated_data['first_name'],
                last_name=serializer.validated_data['last_name'],
                is_staff=serializer.validated_data.get('is_staff', False),
                is_superuser=serializer.validated_data.get('is_superuser', False)
            )
            user.set_password(serializer.validated_data['password'])  # Cifrar la contraseña
            user.save()

            user = authenticate(username=user.username, password=serializer.validated_data['password'])
            if user is not None:
                login(request, user)  # Inicia la sesión y gestiona cookies automáticamente

                Log.objects.create(
                user=request.user,
                event=EventType.CREATE_USER,
                details=f"Document '{serializer.instance.name}' created."
            )

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


    def partial_update(self, request, pk=None):
        user = self.get_object()
        serializer = self.serializer_class(user, data=request.data, partial=True)
        if serializer.is_valid():
            if 'password' in serializer.validated_data:
                user.set_password(serializer.validated_data['password'])
            if 'is_staff' in serializer.validated_data:
                user.is_staff = serializer.validated_data['is_staff']
            if 'is_superuser' in serializer.validated_data:
                user.is_superuser = serializer.validated_data['is_superuser']
            serializer.save()

            Log.objects.create(
                user=request.user,
                event=EventType.UPDATE_USER,
                details=f"Document '{serializer.instance.name}' created."
            )

            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # Custom action to get all documents from a specific user, detail=True means it's a detail endpoint ex: /user/{userId}/documents
    @action(detail=True, methods=['get'], url_path='documents')
    def documents(self, request, pk=None):
        """Get all documents for a specific user"""
        user = self.get_object()
        documents = Document.objects.filter(user=user)
        serializer = DocumentSerializer(documents, many=True)
        return Response(serializer.data)

    # Custom action to get all validations from a specific user, detail=True means it's a detail endpoint ex: /user/{userId}/validations
    @action(detail=True, methods=['get'], url_path='validations')
    def validations(self, request, pk=None):
        """Get all validations for a specific user"""
        user = self.get_object()
        validations = Validation.objects.filter(user=user)
        serializer = ValidationSerializer(validations, many=True)
        return Response(serializer.data)


class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    
    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        data['url'] = random.choice(MOCK_DOCUMENT_URLS)  # Select a random document URL from mock data
        serializer = self.serializer_class(data=data)
        print("User creating document:",request.user)

        if serializer.is_valid():
            serializer.save()
            # Create a log when a new document is created
            Log.objects.create(
                user=request.user,
                event=EventType.CREATE_DOCUMENT,
                details=f"Document '{serializer.instance.name}' created."
            )

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # Custom action to get all validations for a specific document, detail=True means it's a detail endpoint ex: {id}/validations
    @action(detail=True, methods=['get'], url_path='validations')
    def validations(self, request, pk=None):
        """Get all validations for a specific document"""
        document = self.get_object()
        validations = Validation.objects.filter(document=document)
        serializer = ValidationSerializer(validations, many=True)
        return Response(serializer.data)

    # Custom action to get all logs for a specific document, detail=True means it's a detail endpoint ex: {id}/logs
    @action(detail=True, methods=['get'], url_path='logs')
    def logs(self, request, pk=None):
        """Get all logs for a specific document"""
        document = self.get_object()
        logs = Log.objects.filter(document=document)
        serializer = LogSerializer(logs, many=True)
        return Response(serializer.data)


class ValidationViewSet(viewsets.ModelViewSet):
    queryset = Validation.objects.all()
    serializer_class = ValidationSerializer
    
    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            # Create a log when a new validation is created
            Log.objects.create(
                user=request.user,
                event=EventType.CREATE_VALIDATION,
                details=f"Validation with uuid '{serializer.instance.id}', for document '{serializer.instance.document.name}' has been created."
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, pk=None):
        validation = self.get_object()
        serializer = self.serializer_class(validation, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            # Create a log when a validation is updated
            Log.objects.create(
                user=request.user,
                event=EventType.UPDATE_VALIDATION,
                details=f"Validation with uuid '{serializer.instance.id}', for document '{serializer.instance.document.name}' has been updated."
            )
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # Custom action to get all logs for a specific validation, detail=True means it's a detail endpoint ex: validation/{id}/logs (not very useful)
    @action(detail=True, methods=['get'], url_path='logs')
    def logs(self, request, pk=None):
        """Get all logs for a specific validation"""
        validation = self.get_object()
        logs = Log.objects.filter(details__icontains=f"'{validation.id}'")
        serializer = LogSerializer(logs, many=True)
        return Response(serializer.data)


class DocumentTypeViewSet(viewsets.ModelViewSet):
    queryset = DocumentType.objects.all()
    serializer_class = DocumentTypeSerializer

    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            Log.objects.create(
                user=request.user,
                event=EventType.CREATE_DOCUMENT_TYPE,
                details=f"Document type '{serializer.instance.name}' created."
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def documents(self, request, pk=None):
        """Get all documents for a specific document type"""
        document_type = self.get_object()
        documents = Document.objects.filter(document_type=document_type)
        serializer = DocumentSerializer(documents, many=True)
        return Response(serializer.data)

class LogViewSet(viewsets.ModelViewSet):
    queryset = Log.objects.all()
    serializer_class = LogSerializer

    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



