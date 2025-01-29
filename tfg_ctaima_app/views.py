from rest_framework import viewsets, status
from rest_framework import filters as rest_framework_filters
from django.contrib.auth.decorators import login_required
from rest_framework.response import Response
from rest_framework.decorators import action
from django.contrib.auth.models import User  # Importar el modelo User de Django
from .models import Company, Resource, Vehicle, Employee, DocumentType, Document, Validation, Log, EventType
from .serializers import UserSerializer,CompanySerializer, ResourceSerializer, VehicleSerializer, EmployeeSerializer, DocumentTypeSerializer, DocumentSerializer, ValidationSerializer, LogSerializer
from tfg_ctaima_app.constants import MOCK_DOCUMENT_URLS
import random
from django.contrib.auth import authenticate, login, logout
from rest_framework.response import Response
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework import status
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from .models import Log, EventType
from rest_framework.permissions import AllowAny
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from rest_framework.permissions import IsAdminUser
from django.http import JsonResponse
from django_filters.rest_framework import DjangoFilterBackend, FilterSet, filters
from rest_framework.filters import OrderingFilter
from rest_framework.pagination import PageNumberPagination
from django.db.models.functions import Concat
from django.db.models import Value, CharField, Q

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10  # Default number of items per page
    page_size_query_param = 'page_size'  # Allow clients to set page size
    max_page_size = 100  # Maximum limit for page size

@ensure_csrf_cookie
@api_view(['GET'])
@permission_classes([AllowAny])
def get_csrf_token(request):
    return JsonResponse({'detail': 'CSRF cookie set'})

@api_view(['POST'])
@permission_classes([AllowAny])  # Permitir acceso a cualquiera
def login_view(request):

    # Recibir username y password del cuerpo de la solicitud
    username = request.data.get('username')
    password = request.data.get('password')

    # Verificar que se haya proporcionado nombre de usuario y contraseña
    if not username or not password:
        return Response({'error': 'Debe proporcionar un nombre de usuario y contraseña.'}, status=status.HTTP_400_BAD_REQUEST)

    # Autenticar el usuario con las credenciales proporcionadas
    user = authenticate(request, username=username, password=password)
    print("User:",user)

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


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    logout(request)
    return Response({'message': 'Sesión cerrada correctamente.'}, status=status.HTTP_200_OK)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    # Custom action to get the current user, detail=False means it's a list endpoint ex: /users/current
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def current(self, request):
        serializer = self.serializer_class(request.user)
        user = request.user
        roles = []
        if user.is_superuser:
            roles.append('admin')
        if user.is_staff:
            roles.append('staff')
        if user.is_active:
            roles.append('active')
        print("User:",request.user)
        request_data = serializer.data
        request_data.pop('password', None)
        request_data['roles'] = roles
        return Response(request_data)
    
    # @csrf_exempt  # Desactiva la protección CSRF para esta vista
    @permission_classes([IsAdminUser])
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
            try:
                validate_password(serializer.validated_data['password'], user)
            except ValidationError as e:
                return Response({'password': e.messages}, status=status.HTTP_400_BAD_REQUEST)
                
            user.save()

             # Crear el log de creación de usuario
            Log.objects.create(
                user=request.user,  # Usuario administrador que crea el usuario
                event=EventType.CREATE_USER,
                details=f"User '{user.username}' has been created."
            )

            # No incluir la contraseña en la respuesta
            response_data = serializer.data
            response_data.pop('password', None)

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


    @permission_classes([IsAuthenticated])
    def partial_update(self, request, pk=None):
        # Permitir que los usuarios actualicen su propio perfil
        user = self.get_object()
        if request.user == user or request.user.is_staff:
            serializer = self.serializer_class(user, data=request.data, partial=True)
            if serializer.is_valid():
                if 'password' in serializer.validated_data:
                    user.set_password(serializer.validated_data['password'])
                    # Validar la nueva contraseña
                    try:
                        validate_password(serializer.validated_data['password'], user)
                    except ValidationError as e:
                        return Response({'password': e.messages}, status=status.HTTP_400_BAD_REQUEST)
                serializer.save()

                # Crear un log de actualización de usuario
                Log.objects.create(
                    user=request.user,
                    event=EventType.UPDATE_USER,
                    details=f"User '{serializer.instance.username}' has been updated."
                )

                # No incluir la contraseña en la respuesta
                response_data = serializer.data
                response_data.pop('password', None)

                return Response(response_data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'detail': 'No autorizado.'}, status=status.HTTP_401_UNAUTHORIZED)

    # Custom action to get all documents from a specific user, detail=True means it's a detail endpoint ex: /users/{userId}/documents
    @permission_classes([IsAuthenticated])
    @action(detail=True, methods=['get'], url_path='documents')
    def documents(self, request, pk=None):
        """Get all documents for a specific user"""
        user = self.get_object()
        documents = Document.objects.filter(user=user)
        serializer = DocumentSerializer(documents, many=True)
        return Response(serializer.data)

    # Custom action to get all validations from a specific user, detail=True means it's a detail endpoint ex: /users/{userId}/validations
    @permission_classes([IsAuthenticated])
    @action(detail=True, methods=['get'], url_path='validations')
    def validations(self, request, pk=None):
        """Get all validations for a specific user"""
        user = self.get_object()
        validations = Validation.objects.filter(user=user)
        serializer = ValidationSerializer(validations, many=True)
        return Response(serializer.data)


class DocumentFilter(FilterSet):
    id__in = filters.BaseInFilter(field_name='id', lookup_expr='in')
    # name = filters.CharFilter(field_name='name', lookup_expr='icontains')
    # resource_id = filters.CharFilter(field_name='resource', lookup_expr='exact')

    class Meta:
        model = Document
        fields = ['id__in']

class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer

    filter_backends = [rest_framework_filters.SearchFilter, rest_framework_filters.OrderingFilter]
    search_fields = ['name', 'id']  # Add other fields as needed
    ordering_fields = ['timestamp', 'name', 'id']
    ordering = ['-timestamp', '-id']

    pagination_class = StandardResultsSetPagination

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        data['url'] = random.choice(MOCK_DOCUMENT_URLS)  # Select a random document URL from mock data
        serializer = self.serializer_class(data=data)
        print("User creating document:",request.user)
        print("Data:",data)
        if serializer.is_valid():
            serializer.save()
            print("request resource ID:",request.data['resource'])
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


class ValidationFilter(FilterSet):
    document_type = filters.CharFilter(field_name='document__document_type', lookup_expr='exact')  # Filtra por ID del tipo de documento
    document_id = filters.CharFilter(field_name='document', lookup_expr='exact')  # Filtra por ID del documento
    validation_id = filters.CharFilter(field_name='id', lookup_expr='exact')  # Filtra por ID de la validación
    start_date = filters.DateTimeFilter(field_name='timestamp', lookup_expr='gte')  # Fecha de inicio (sin cambios)
    end_date = filters.DateTimeFilter(field_name='timestamp', lookup_expr='lte')  # Fecha de fin (sin cambios)
    resource_id = filters.CharFilter(field_name='document__resource', lookup_expr='exact')  # Filtra por ID del recurso
    company_id = filters.CharFilter(field_name='document__resource__company', lookup_expr='exact')  # Filtra por ID de la compañía
    status = filters.CharFilter(field_name='status', lookup_expr='exact')  # Filtra por estado (sin cambios)
    user_id = filters.CharFilter(field_name='user', lookup_expr='exact')  # Filtra por ID de usuario

    class Meta:
        model = Validation
        fields = []



class ValidationViewSet(viewsets.ModelViewSet):
    queryset = Validation.objects.all().select_related('document__document_type', 'user')
    serializer_class = ValidationSerializer
    pagination_class = StandardResultsSetPagination
    # Agregar los backends de filtrado
    filter_backends = [DjangoFilterBackend, OrderingFilter]

    # Especificar la clase de filtro personalizada
    filterset_class = ValidationFilter

    # Opcional: permitir ordenar por ciertos campos
    ordering_fields = ['timestamp', 'id']
    ordering = ['-timestamp', '-id']

    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            # Crear un log cuando se crea una nueva validación
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
            # Crear un log cuando se actualiza una validación
            Log.objects.create(
                user=request.user,
                event=EventType.UPDATE_VALIDATION,
                details=f"Validation with uuid '{serializer.instance.id}', for document '{serializer.instance.document.name}' has been updated."
            )
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], url_path='search') 
    def search(self, request):
    # Verificamos si el usuario hizo una solicitud GET
        query = request.GET.get('query', '')
        if query is not None and query != '':
            # Buscar validaciones cuyo ID contenga el texto de búsqueda
            validations = Validation.objects.filter(id__icontains=query)
            serializer = self.get_serializer(validations, many=True)
            return Response(serializer.data)
        else:
            return Response({'error': 'No se proporcionó un término de búsqueda.'}, status=400)

    @action(detail=False, methods=['get'], url_path='allValidations')
    def get_all(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


    @action(detail=True, methods=['get'], url_path='logs')
    def logs(self, request, pk=None):
        """Obtener todos los logs para una validación específica"""
        validation = self.get_object()
        logs = Log.objects.filter(details__icontains=f"'{validation.id}'")
        serializer = LogSerializer(logs, many=True)
        return Response(serializer.data)


class DocumentTypeViewSet(viewsets.ModelViewSet):
    queryset = DocumentType.objects.all()
    serializer_class = DocumentTypeSerializer
    pagination_class = StandardResultsSetPagination

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

    @action(detail=True, methods=['get'], url_path='fields')
    def get_fields(self, request, document_type_id=None):
        """
        Endpoint para obtener las fields asociadas a un DocumentType.
        Devuelve los fields_to_validate y fields_to_extract en el formato especificado.
        """
        # Obtener el DocumentType
        document_type = get_object_or_404(DocumentType, id=document_type_id)

        # Obtener los fields_to_validate
        fields_to_validate = FieldToValidate.objects.filter(document_types=document_type)
        fields_to_validate_data = [
            {
                "id": field.id,
                "name": field.name,
                "description": field.description,
                "value": field.value if field.value is not None else "",  # Asignar valor vacío si no existe
            }
            for field in fields_to_validate
        ]

        # Obtener los fields_to_extract
        fields_to_extract = FieldToExtract.objects.filter(document_types=document_type)
        fields_to_extract_data = [
            {
                "id": field.id,
                "name": field.name,
                "description": field.description,
                "value": field.value if field.value is not None else "",  # Asignar valor vacío si no existe
            }
            for field in fields_to_extract
        ]

        # Organizar los datos en la respuesta final
        response_data = {
            "fields_to_validate": fields_to_validate_data,
            "fields_to_extract": fields_to_extract_data,
        }

        print("Response data:",response_data)

        return Response(response_data)

# ViewSet para Company
class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    pagination_class = StandardResultsSetPagination

    filter_backends = [rest_framework_filters.SearchFilter, rest_framework_filters.OrderingFilter]

    search_fields = ['company_name', 'company_id']  # Add other fields as needed
    ordering_fields = ['company_name', 'company_id']
    ordering = ['company_name', 'company_id']

class ResourceFilter(FilterSet):
    id__in = filters.BaseInFilter(field_name='id', lookup_expr='in')
    # name = filters.CharFilter(field_name='name', lookup_expr='icontains')
    # resource_id = filters.CharFilter(field_name='resource', lookup_expr='exact')

    class Meta:
        model = Resource
        fields = ['id__in']

# ViewSet para Resource
class ResourceViewSet(viewsets.ModelViewSet):
    queryset = Resource.objects.select_related('company')
    serializer_class = ResourceSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = ResourceFilter
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search', None)

        if search:

            # Anotamos full_name para empleados
            employee_qs = Resource.objects.filter(resource_type='employee').annotate(
                full_name=Concat('employee__first_name', Value(' '), 'employee__last_name', output_field=CharField())
            )

            # Filtramos empleados
            employee_qs = employee_qs.filter(
                Q(full_name__icontains=search) |
                Q(employee__first_name__icontains=search) |
                Q(employee__last_name__icontains=search) |
                Q(employee__worker_id__icontains=search)
            )

            # Filtramos vehículos
            vehicle_qs = Resource.objects.filter(resource_type='vehicle').filter(
                Q(vehicle__name__icontains=search) |
                Q(vehicle__registration_id__icontains=search)
            )

            # Combinamos las consultas
            resources = (employee_qs | vehicle_qs).select_related('employee', 'vehicle').distinct()

            return resources
        else:
            return queryset

# ViewSet para Vehicle
class VehicleViewSet(viewsets.ModelViewSet):
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer


# ViewSet para Employee
class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer


class LogViewSet(viewsets.ModelViewSet):
    queryset = Log.objects.all()
    serializer_class = LogSerializer

    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



