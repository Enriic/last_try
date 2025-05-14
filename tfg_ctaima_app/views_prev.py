# from rest_framework import viewsets, status, filters as rest_framework_filters
# from rest_framework.response import Response
# from rest_framework.decorators import action, api_view, permission_classes
# from rest_framework.authentication import SessionAuthentication, BasicAuthentication
# from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
# from rest_framework.pagination import PageNumberPagination
# from rest_framework.views import APIView
# from rest_framework.filters import OrderingFilter
# from django_filters.rest_framework import DjangoFilterBackend, FilterSet, filters

# from django.contrib.auth import authenticate, login, logout
# from django.contrib.auth.models import User
# from django.contrib.auth.decorators import login_required
# from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
# from django.conf import settings
# from django.http import StreamingHttpResponse, JsonResponse

# from django.db.models.functions import Concat
# from django.db.models import Value, CharField, Q

# import os
# import json
# import pickle
# import random
# import re
# import requests

# from .models import (
#     Company, Resource, Vehicle, Employee, DocumentType, Document, Validation, Log, EventType
# )
# from .serializers import (
#     UserSerializer, CompanySerializer, ResourceSerializer, VehicleSerializer,
#     EmployeeSerializer, DocumentTypeSerializer, DocumentSerializer, ValidationSerializer, LogSerializer
# )
# from .utils import (
#     upload_to_blob_storage, calculate_file_hash, generate_sas_token, clean_filename,
#     truncate_filename, transform_validation_details, MAX_FILENAME_LENGTH, update_info, get_param_name
# )
# from tfg_ctaima_app.constants import MOCK_DOCUMENT_URLS

# from azure.storage.blob import BlobSasPermissions, BlobClient


# class StandardResultsSetPagination(PageNumberPagination):
#     page_size = 10  # Default number of items per page
#     page_size_query_param = 'page_size'  # Allow clients to set page size
#     max_page_size = 100  # Maximum limit for page size

    

# @ensure_csrf_cookie
# @api_view(['GET'])
# @permission_classes([AllowAny])
# def get_csrf_token(request):
#     return JsonResponse({'detail': 'CSRF cookie set'})

# @api_view(['POST'])
# @permission_classes([AllowAny])  # Permitir acceso a cualquiera
# def login_view(request):

#     # Recibir username y password del cuerpo de la solicitud
#     username = request.data.get('username')
#     password = request.data.get('password')

#     # Verificar que se haya proporcionado nombre de usuario y contraseña
#     if not username or not password:
#         return Response({'error': 'Debe proporcionar un nombre de usuario y contraseña.'}, status=status.HTTP_400_BAD_REQUEST)

#     # Autenticar el usuario con las credenciales proporcionadas
#     user = authenticate(request, username=username, password=password)
#     print("User:",user)

#     # Si las credenciales son correctas, iniciar sesión y crear log
#     if user is not None:
#         login(request, user)  # Establecer la sesión con cookies automáticamente
#         Log.objects.create(
#             user=request.user,
#             event=EventType.LOGIN,
#             details=f'User {user.username} logged in successfully.'
#         )
#         return Response({'message': f'Bienvenido {user.username}!'}, status=status.HTTP_200_OK)

#     # Si las credenciales no son correctas
#     return Response({'error': 'Credenciales inválidas.'}, status=status.HTTP_401_UNAUTHORIZED)


# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def logout_view(request):
#     logout(request)
#     return Response({'message': 'Sesión cerrada correctamente.'}, status=status.HTTP_200_OK)

# class UserViewSet(viewsets.ModelViewSet):
#     queryset = User.objects.all()
#     serializer_class = UserSerializer

#     # Custom action to get the current user, detail=False means it's a list endpoint ex: /users/current
#     @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
#     def current(self, request):
#         serializer = self.serializer_class(request.user)
#         user = request.user
#         roles = []
#         if user.is_superuser:
#             roles.append('admin')
#         if user.is_staff:
#             roles.append('staff')
#         if user.is_active:
#             roles.append('active')
#         print("User:",request.user)
#         request_data = serializer.data
#         request_data.pop('password', None)
#         request_data['roles'] = roles
#         return Response(request_data)
    
#     # @csrf_exempt  # Desactiva la protección CSRF para esta vista
#     @permission_classes([IsAdminUser])
#     def create(self, request):
#         serializer = self.serializer_class(data=request.data)
#         if serializer.is_valid():
#             user = User(
#                 username=serializer.validated_data['username'],
#                 email=serializer.validated_data['email'],
#                 first_name=serializer.validated_data['first_name'],
#                 last_name=serializer.validated_data['last_name'],
#                 is_staff=serializer.validated_data.get('is_staff', False),
#                 is_superuser=serializer.validated_data.get('is_superuser', False)
#             )
#             user.set_password(serializer.validated_data['password'])  # Cifrar la contraseña
#             try:
#                 validate_password(serializer.validated_data['password'], user)
#             except ValidationError as e:
#                 return Response({'password': e.messages}, status=status.HTTP_400_BAD_REQUEST)
                
#             user.save()

#              # Crear el log de creación de usuario
#             Log.objects.create(
#                 user=request.user,  # Usuario administrador que crea el usuario
#                 event=EventType.CREATE_USER,
#                 details=f"User '{user.username}' has been created."
#             )

#             # No incluir la contraseña en la respuesta
#             response_data = serializer.data
#             response_data.pop('password', None)

#             return Response(serializer.data, status=status.HTTP_201_CREATED)

#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


#     @permission_classes([IsAuthenticated])
#     def partial_update(self, request, pk=None):
#         # Permitir que los usuarios actualicen su propio perfil
#         user = self.get_object()
#         if request.user == user or request.user.is_staff:
#             serializer = self.serializer_class(user, data=request.data, partial=True)
#             if serializer.is_valid():
#                 if 'password' in serializer.validated_data:
#                     user.set_password(serializer.validated_data['password'])
#                     # Validar la nueva contraseña
#                     try:
#                         validate_password(serializer.validated_data['password'], user)
#                     except ValidationError as e:
#                         return Response({'password': e.messages}, status=status.HTTP_400_BAD_REQUEST)
#                 serializer.save()

#                 # Crear un log de actualización de usuario
#                 Log.objects.create(
#                     user=request.user,
#                     event=EventType.UPDATE_USER,
#                     details=f"User '{serializer.instance.username}' has been updated."
#                 )

#                 # No incluir la contraseña en la respuesta
#                 response_data = serializer.data
#                 response_data.pop('password', None)

#                 return Response(response_data)
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#         else:
#             return Response({'detail': 'No autorizado.'}, status=status.HTTP_401_UNAUTHORIZED)

#     # Custom action to get all documents from a specific user, detail=True means it's a detail endpoint ex: /users/{userId}/documents
#     @permission_classes([IsAuthenticated])
#     @action(detail=True, methods=['get'], url_path='documents')
#     def documents(self, request, pk=None):
#         """Get all documents for a specific user"""
#         user = self.get_object()
#         documents = Document.objects.filter(user=user)
#         serializer = DocumentSerializer(documents, many=True)
#         return Response(serializer.data)

#     # Custom action to get all validations from a specific user, detail=True means it's a detail endpoint ex: /users/{userId}/validations
#     @permission_classes([IsAuthenticated])
#     @action(detail=True, methods=['get'], url_path='validations')
#     def validations(self, request, pk=None):
#         """Get all validations for a specific user"""
#         user = self.get_object()
#         validations = Validation.objects.filter(user=user)
#         serializer = ValidationSerializer(validations, many=True)
#         return Response(serializer.data)


# class DocumentFilter(FilterSet):
#     id__in = filters.BaseInFilter(field_name='id', lookup_expr='in')
#     # name = filters.CharFilter(field_name='name', lookup_expr='icontains')
#     # resource_id = filters.CharFilter(field_name='resource', lookup_expr='exact')

#     class Meta:
#         model = Document
#         fields = ['id__in']


# class DocumentRetrieveView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request, pk):
#         try:
#             # Obtener el documento
#             print("Looking for document:",pk)
#             document = Document.objects.get(pk=pk)
#             print("Document found:",document.name)
#             _, ext = os.path.splitext(document.name)
#             print("Extension:",ext)
#             blob_name = f"{document.file_hash}{ext}"
#             print("Looking for blob:",document.file_hash)

#             # Crear el BlobClient
#             blob_client = BlobClient(
#                 account_url=f"https://{settings.AZURE_ACCOUNT_NAME}.blob.core.windows.net",
#                 container_name=settings.AZURE_CONTAINER,
#                 blob_name=blob_name,
#                 credential=settings.AZURE_ACCOUNT_KEY
#             )

#             stream = blob_client.download_blob()

#             print(f"Downloading file: {document.name}")

#             # Crear la respuesta de streaming para descarga
#             response = StreamingHttpResponse(
#                 streaming_content=stream.chunks(),
#                 content_type='application/octet-stream'
#             )
#             response['Content-Length'] = stream.size
#             response['Content-Disposition'] = f'attachment; filename="{document.name}"'

#             return response

#         except Document.DoesNotExist:
#             return Response({"error": "Documento no encontrado."}, status=status.HTTP_404_NOT_FOUND)
#         except Exception as e:
#             return Response({"error": f"Error al descargar el documento: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class DocumentViewSet(viewsets.ModelViewSet):
#     queryset = Document.objects.all()
#     serializer_class = DocumentSerializer

#     filter_backends = [rest_framework_filters.SearchFilter, rest_framework_filters.OrderingFilter]
#     search_fields = ['name', 'id']  # Add other fields as needed
#     ordering_fields = ['timestamp', 'name', 'id']
#     ordering = ['-timestamp', '-id']

#     pagination_class = StandardResultsSetPagination

#     def create(self, request, *args, **kwargs):
#         uploaded_file = request.FILES.get('file')
#         if not uploaded_file:
#             return Response({"error": "File is required"}, status=status.HTTP_400_BAD_REQUEST)

#         # Calcular el hash del archivo
#         file_hash = calculate_file_hash(uploaded_file)
#         filename = uploaded_file.name
#         print('File Hash:',file_hash)
#         # Obtener la extensión del archivo
#         _, ext = os.path.splitext(filename)
#         # Construir el blob_name usando solo el hash y la extensión
#         blob_name = f"{file_hash}{ext}"

#         # Verificar si ya existe un documento con el mismo hash
#         existing_document = Document.objects.filter(file_hash=file_hash).first()
#         if existing_document:
#             serializer = self.get_serializer(existing_document)
#             # No adjuntar el SAS Token a la URL
#             # return Response(serializer.data, status=status.HTTP_200_OK)
#             response_data = {
#                 'detail': 'A document with the same content already exists.',
#                 'document': serializer.data
#             }
#             return Response(response_data, status=status.HTTP_409_CONFLICT)

#         # Subir el archivo utilizando el SAS Token INTERNAMENTE en el backend
#         try:
#             blob_url = upload_to_blob_storage(uploaded_file, blob_name)

#         except Exception as e:
#             return Response({"error": f"Error uploading file: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


#         print("File Hash obtained", file_hash)
#         # Almacenar y devolver en la respuesta la URL sin el SAS Token
#         associated_entity = request.data.get('associated_entity', 'resource')

#         if associated_entity == 'company':
#             data = {
#                 'document_type': request.data.get('document_type'),
#                 'company': request.data.get('company'),
#                 'url': blob_url,
#                 'name': filename,
#                 'file_hash': file_hash,
#             }
#         else:
#             resource_id = request.data.get('resource')
#             try:
#                 # Obtener el recurso
#                 resource = Resource.objects.get(pk=resource_id)
#                 print("company_id:",resource.company_id)
#             except Resource.DoesNotExist:
#                 return Response({"error": "Resource not found."}, status=status.HTTP_400_BAD_REQUEST)

#             data = {
#                 'document_type': request.data.get('document_type'),
#                 'resource': request.data.get('resource'),
#                 'company': resource.company_id,
#                 'url': blob_url,
#                 'name': filename,
#                 'file_hash': file_hash,
#             }

#         serializer = self.get_serializer(data=data)
#         serializer.is_valid(raise_exception=True)
#         serializer.save(user=request.user)

#         Log.objects.create(
#             user=request.user,
#             event=EventType.CREATE_DOCUMENT,
#             details=f"Document '{serializer.instance.name}' created."
#         )

#         return Response(serializer.data, status=status.HTTP_201_CREATED)

#     # Custom action to get all validations for a specific document, detail=True means it's a detail endpoint ex: {id}/validations
#     @action(detail=True, methods=['get'], url_path='validations')
#     def validations(self, request, pk=None):
#         """Get all validations for a specific document"""
#         document = self.get_object()
#         validations = Validation.objects.filter(document=document)
#         serializer = ValidationSerializer(validations, many=True)
#         return Response(serializer.data)

#     # Custom action to get all logs for a specific document, detail=True means it's a detail endpoint ex: {id}/logs
#     @action(detail=True, methods=['get'], url_path='logs')
#     def logs(self, request, pk=None):
#         """Get all logs for a specific document"""
#         document = self.get_object()
#         logs = Log.objects.filter(document=document)
#         serializer = LogSerializer(logs, many=True)
#         return Response(serializer.data)


# class ValidationFilter(FilterSet):
#     document_type = filters.CharFilter(field_name='document__document_type', lookup_expr='exact')  # Filtra por ID del tipo de documento
#     document_id = filters.CharFilter(field_name='document', lookup_expr='exact')  # Filtra por ID del documento
#     validation_id = filters.CharFilter(field_name='id', lookup_expr='exact')  # Filtra por ID de la validación
#     start_date = filters.DateTimeFilter(field_name='timestamp', lookup_expr='gte')  # Fecha de inicio (sin cambios)
#     end_date = filters.DateTimeFilter(field_name='timestamp', lookup_expr='lte')  # Fecha de fin (sin cambios)
#     resource_id = filters.CharFilter(field_name='document__resource', lookup_expr='exact')  # Filtra por ID del recurso
#     company_id = filters.CharFilter(field_name='document__company', lookup_expr='exact')  # Filtra por ID de la compañía
#     status = filters.CharFilter(field_name='status', lookup_expr='exact')  # Filtra por estado (sin cambios)
#     user_id = filters.CharFilter(field_name='user', lookup_expr='exact')  # Filtra por ID de usuario

#     class Meta:
#         model = Validation
#         fields = []



# class ValidationViewSet(viewsets.ModelViewSet):
#     queryset = Validation.objects.all().select_related('document__document_type', 'user')
#     serializer_class = ValidationSerializer
#     pagination_class = StandardResultsSetPagination
#     # Agregar los backends de filtrado
#     filter_backends = [DjangoFilterBackend, OrderingFilter]

#     # Especificar la clase de filtro personalizada
#     filterset_class = ValidationFilter

#     # Opcional: permitir ordenar por ciertos campos
#     ordering_fields = ['timestamp', 'id']
#     ordering = ['-timestamp', '-id']

#     def create(self, request):
#         serializer = self.serializer_class(data=request.data)
#         validation_details = request.data['validation_details']
#         print("Validation details:",validation_details)

#         request_validation_details = transform_validation_details(validation_details)
#         # print("Request validation details:",request_validation_details)
#         document = Document.objects.get(id=request.data['document'])

#         _, ext = os.path.splitext(document.name)
#         doc_name = document.file_hash + ext

#         sas_token = generate_sas_token(doc_name, BlobSasPermissions(read=True, write=False, delete=False))

#         req_params = {
#             "fields_to_validate": request_validation_details['fields_to_validate'],
#             "fields_to_extract": request_validation_details['fields_to_extract'],
#             "account_url": f"https://{settings.AZURE_ACCOUNT_NAME}.blob.core.windows.net",
#             "container_name": settings.AZURE_CONTAINER,
#             "doc_name": doc_name,
#             "sas_token": sas_token,
#             "document_type": get_param_name(document.document_type.id),
#             "sign": False,
#             "tfg": True,
#             "uuid": "dasdbahhdjaj",
#             "pattern_validation": {
#                 "value": [""],
#                 "description": "",
#                 "threshold": 100
#             }
#         }

#         print("Request validations:",req_params)

#         validation_endpoint = settings.QA_VALIDATION_ENDPOINT
#         headers = {
#             "Ocp-Apim-Subscription-Key": f'{settings.QA_OCP_APIM_VALIDATION_SUBSCRIPTION_KEY}',
#             "Content-Type": "application/json"
#         }
#         try:
#             response = requests.post(validation_endpoint, json=req_params, headers=headers)
#             response.raise_for_status()
#             validation_result = response.json()
#             print("Validation result:", validation_result)

#         except requests.exceptions.RequestException as e:
#             return Response({"error": f"Error during validation request: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#             # Actualizar la plantilla con los datos extraidos:
#             # Aseguramos que validation_details es un dict
#         if isinstance(validation_details, str):
#             try:
#                 validation_details = json.loads(validation_details)
#             except json.JSONDecodeError:
#                 return Response({"error": "validation_details no es un JSON válido."}, status=400)
#         elif not isinstance(validation_details, dict):
#             return Response({"error": "validation_details debe ser un objeto JSON."}, status=400)

#         try:
#             # Actualizar la información
#             plantilla_actualizada = update_info(validation_result, validation_details)
#             print("Plantilla actualizada:",plantilla_actualizada)
#         except TypeError as e:
#             return Response({"error": str(e)}, status=400)
                        
#         #Here we'll make the call to the validation endpoint
        
#         if serializer.is_valid():
#             instance = serializer.save()  # Guardamos la instancia en la BD

#             # Aquí actualizamos los campos en la base de datos con los datos de plantilla_actualizada
#             instance.validation_details = plantilla_actualizada  # Guardamos como JSON si es necesario
            
#             if (validation_result['result'] == 'OK'):
#                 instance.status = 'success'
#             elif (validation_result['result'] == 'KO'):
#                 instance.status = 'failure'
#             else:
#                 instance.status = 'pending'

#             instance.save() 
#             # Crear un log cuando se crea una nueva validación
#             Log.objects.create(
#                 user=request.user,
#                 event=EventType.CREATE_VALIDATION,
#                 details=f"Validation with uuid '{serializer.instance.id}', for document '{serializer.instance.document.name}' has been created."
#             )
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     def partial_update(self, request, pk=None):
#         validation = self.get_object()
#         serializer = self.serializer_class(validation, data=request.data, partial=True)
#         if serializer.is_valid():
#             serializer.save()
#             # Crear un log cuando se actualiza una validación
#             Log.objects.create(
#                 user=request.user,
#                 event=EventType.UPDATE_VALIDATION,
#                 details=f"Validation with uuid '{serializer.instance.id}', for document '{serializer.instance.document.name}' has been updated."
#             )
#             return Response(serializer.data)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     @action(detail=False, methods=['get'], url_path='search') 
#     def search(self, request):
#     # Verificamos si el usuario hizo una solicitud GET
#         query = request.GET.get('query', '')
#         if query is not None and query != '':
#             # Buscar validaciones cuyo ID contenga el texto de búsqueda
#             validations = Validation.objects.filter(id__icontains=query)
#             serializer = self.get_serializer(validations, many=True)
#             return Response(serializer.data)
#         else:
#             return Response({'error': 'No se proporcionó un término de búsqueda.'}, status=400)

#     @action(detail=False, methods=['get'], url_path='allValidations')
#     def get_all(self, request):
#         queryset = self.filter_queryset(self.get_queryset())
#         serializer = self.serializer_class(queryset, many=True)
#         return Response(serializer.data, status=status.HTTP_200_OK)


#     @action(detail=True, methods=['get'], url_path='logs')
#     def logs(self, request, pk=None):
#         """Obtener todos los logs para una validación específica"""
#         validation = self.get_object()
#         logs = Log.objects.filter(details__icontains=f"'{validation.id}'")
#         serializer = LogSerializer(logs, many=True)
#         return Response(serializer.data)


# class DocumentTypeViewSet(viewsets.ModelViewSet):
#     queryset = DocumentType.objects.all()
#     serializer_class = DocumentTypeSerializer
#     pagination_class = StandardResultsSetPagination

#     def create(self, request):
#         serializer = self.serializer_class(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             Log.objects.create(
#                 user=request.user,
#                 event=EventType.CREATE_DOCUMENT_TYPE,
#                 details=f"Document type '{serializer.instance.name}' created."
#             )
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     @action(detail=True, methods=['get'])
#     def documents(self, request, pk=None):
#         """Get all documents for a specific document type"""
#         document_type = self.get_object()
#         documents = Document.objects.filter(document_type=document_type)
#         serializer = DocumentSerializer(documents, many=True)
#         return Response(serializer.data)

#     @action(detail=True, methods=['get'], url_path='fields')
#     def get_fields(self, request, document_type_id=None):
#         """
#         Endpoint para obtener las fields asociadas a un DocumentType.
#         Devuelve los fields_to_validate y fields_to_extract en el formato especificado.
#         """
#         # Obtener el DocumentType
#         document_type = get_object_or_404(DocumentType, id=document_type_id)

#         # Obtener los fields_to_validate
#         fields_to_validate = FieldToValidate.objects.filter(document_types=document_type)
#         fields_to_validate_data = [
#             {
#                 "id": field.id,
#                 "name": field.name,
#                 "description": field.description,
#                 "value": field.value if field.value is not None else "",  # Asignar valor vacío si no existe
#             }
#             for field in fields_to_validate
#         ]

#         # Obtener los fields_to_extract
#         fields_to_extract = FieldToExtract.objects.filter(document_types=document_type)
#         fields_to_extract_data = [
#             {
#                 "id": field.id,
#                 "name": field.name,
#                 "description": field.description,
#                 "value": field.value if field.value is not None else "",  # Asignar valor vacío si no existe
#             }
#             for field in fields_to_extract
#         ]

#         # Organizar los datos en la respuesta final
#         response_data = {
#             "fields_to_validate": fields_to_validate_data,
#             "fields_to_extract": fields_to_extract_data,
#         }

#         print("Response data:",response_data)

#         return Response(response_data)

# # ViewSet para Company
# class CompanyViewSet(viewsets.ModelViewSet):
#     queryset = Company.objects.all()
#     serializer_class = CompanySerializer
#     pagination_class = StandardResultsSetPagination

#     filter_backends = [rest_framework_filters.SearchFilter, rest_framework_filters.OrderingFilter]

#     search_fields = ['company_name', 'company_id']  # Add other fields as needed
#     ordering_fields = ['company_name', 'company_id']
#     ordering = ['company_name', 'company_id']

# class ResourceFilter(FilterSet):
#     id__in = filters.BaseInFilter(field_name='id', lookup_expr='in')
#     # name = filters.CharFilter(field_name='name', lookup_expr='icontains')
#     # resource_id = filters.CharFilter(field_name='resource', lookup_expr='exact')

#     class Meta:
#         model = Resource
#         fields = ['id__in']

# # ViewSet para Resource
# class ResourceViewSet(viewsets.ModelViewSet):
#     queryset = Resource.objects.select_related('company')
#     serializer_class = ResourceSerializer
#     filter_backends = [DjangoFilterBackend]
#     filterset_class = ResourceFilter
#     pagination_class = StandardResultsSetPagination

#     def get_queryset(self):
#         queryset = super().get_queryset()
#         search = self.request.query_params.get('search', None)

#         if search:

#             # Anotamos full_name para empleados
#             employee_qs = Resource.objects.filter(resource_type='employee').annotate(
#                 full_name=Concat('employee__first_name', Value(' '), 'employee__last_name', output_field=CharField())
#             )

#             # Filtramos empleados
#             employee_qs = employee_qs.filter(
#                 Q(full_name__icontains=search) |
#                 Q(employee__first_name__icontains=search) |
#                 Q(employee__last_name__icontains=search) |
#                 Q(employee__worker_id__icontains=search)
#             )

#             # Filtramos vehículos
#             vehicle_qs = Resource.objects.filter(resource_type='vehicle').filter(
#                 Q(vehicle__name__icontains=search) |
#                 Q(vehicle__registration_id__icontains=search)
#             )

#             # Combinamos las consultas
#             resources = (employee_qs | vehicle_qs).select_related('employee', 'vehicle').distinct()

#             return resources
#         else:
#             return queryset

# # ViewSet para Vehicle
# class VehicleViewSet(viewsets.ModelViewSet):
#     queryset = Vehicle.objects.all()
#     serializer_class = VehicleSerializer


# # ViewSet para Employee
# class EmployeeViewSet(viewsets.ModelViewSet):
#     queryset = Employee.objects.all()
#     serializer_class = EmployeeSerializer


# class LogViewSet(viewsets.ModelViewSet):
#     queryset = Log.objects.all()
#     serializer_class = LogSerializer

#     def create(self, request):
#         serializer = self.serializer_class(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



