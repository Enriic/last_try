# app1/views/resource_views.py

import logging
from django.db.models import Q, Value, CharField
from django.db.models.functions import Concat
from django_filters.rest_framework import DjangoFilterBackend

from rest_framework import viewsets, status, filters as rest_framework_filters
from rest_framework.decorators import action, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response

from ..models import Resource, Employee, Vehicle, Log, EventType
from ..serializers import ResourceSerializer, EmployeeSerializer, VehicleSerializer
from .filters import ResourceFilter
from .pagination import StandardResultsSetPagination
from .decorators import log_event

logger = logging.getLogger(__name__)

class ResourceViewSet(viewsets.ModelViewSet):
    queryset = Resource.objects.select_related('employee', 'vehicle').all().order_by('-timestamp')
    serializer_class = ResourceSerializer
    filter_backends = [rest_framework_filters.SearchFilter, rest_framework_filters.OrderingFilter]
    filterset_class = ResourceFilter
    pagination_class = StandardResultsSetPagination
    ordering_fields = ['timestamp']

    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsAdminUser]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(ResourceViewSet, self).get_permissions()

    @log_event(EventType.CREATE_RESOURCE)
    def create(self, request, *args, **kwargs):
        resource_type = request.data.get('resource_type')
        
        if resource_type.lower() == 'employee':
            serializer = EmployeeSerializer(data=request.data)
        elif resource_type.lower() == 'vehicle':
            serializer = VehicleSerializer(data=request.data)
        else:
            return Response({'error': 'Invalid resource type'}, status=status.HTTP_400_BAD_REQUEST)

        serializer.is_valid(raise_exception=True)
        resource = serializer.save()
        logger.info(f"Recurso ({resource_type}) creado por '{request.user.username}'.")
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @log_event(EventType.UPDATE_RESOURCE)
    def update(self, request, *args, **kwargs):
        print(request.data)
        return super().update(request, *args, **kwargs)
  

    @log_event(EventType.DELETE_RESOURCE)
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        logger.info(f"Recurso eliminado por '{request.user.username}'.")
        return Response(status=status.HTTP_204_NO_CONTENT)

    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search', None)
        if search:
            employee_qs = Resource.objects.filter(resource_type='employee').annotate(
                full_name=Concat('employee__first_name', Value(' '), 'employee__last_name', output_field=CharField())
            ).filter(
                Q(full_name__icontains=search) |
                Q(employee__first_name__icontains=search) |
                Q(employee__last_name__icontains=search) |
                Q(employee__worker_id__icontains=search)
            )
            vehicle_qs = Resource.objects.filter(resource_type='vehicle').filter(
                Q(vehicle__name__icontains=search) |
                Q(vehicle__registration_id__icontains=search)
            )
            resources = (employee_qs | vehicle_qs).select_related('employee', 'vehicle').distinct()
            logger.debug(f"Búsqueda de recursos con término '{search}'.")
            return resources
        return queryset

    @action(detail=False, methods=['get'], url_path='search', permission_classes=[IsAuthenticated])
    def search_resources(self, request):
        query = request.GET.get('query', '')
        if query:
            resources = self.get_queryset().filter(
                Q(name__icontains=query) |
                Q(id__icontains=query)
            )
            serializer = self.get_serializer(resources, many=True)
            logger.info(f"Usuario '{request.user.username}' buscó recursos con query '{query}'.")
            return Response(serializer.data)
        logger.warning("Solicitud de búsqueda de recursos sin término proporcionado.")
        return Response({'error': 'No se proporcionó un término de búsqueda.'}, status=status.HTTP_400_BAD_REQUEST)

class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all().order_by('-timestamp')
    # queryset = Employee.objects.select_related('company').all().order_by('-timestamp')

    filter_backends = [rest_framework_filters.SearchFilter, rest_framework_filters.OrderingFilter]
    search_fields = ['first_name', 'last_name','worker_id']
    serializer_class = EmployeeSerializer
    ordering_fields = ['timestamp']
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    # def get_serializer_class(self):
    #     if self.action in ['list', 'retrieve']:
    #         return EmployeeSerializer  # Usa el serializer con los detalles anidados para lectura
    #     return EmployeeWriteSerializer  # Para create/update, usa el serializer plano

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsAdminUser]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(EmployeeViewSet, self).get_permissions()

    @log_event(EventType.CREATE_EMPLOYEE)
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        employee = serializer.save()
        logger.info(f"Empleado '{employee.first_name} {employee.last_name}' creado por '{request.user.username}'.")
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @log_event(EventType.UPDATE_EMPLOYEE)
    def update(self, request, *args, **kwargs):
        print(request.data)
        return super().update(request, *args, **kwargs)

    @log_event(EventType.DELETE_EMPLOYEE)
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        logger.info(f"Empleado '{instance.first_name} {instance.last_name}' eliminado por '{request.user.username}'.")
        return Response(status=status.HTTP_204_NO_CONTENT)

class VehicleViewSet(viewsets.ModelViewSet):
    # queryset = Vehicle.objects.select_related('company').all()
    queryset = Vehicle.objects.all()

    serializer_class = VehicleSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsAdminUser]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(VehicleViewSet, self).get_permissions()

    @log_event(EventType.CREATE_VEHICLE)
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        vehicle = serializer.save()
        logger.info(f"Vehículo '{vehicle.name}' creado por '{request.user.username}'.")
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @log_event(EventType.UPDATE_VEHICLE)
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @log_event(EventType.DELETE_VEHICLE)
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        logger.info(f"Vehículo '{instance.name}' eliminado por '{request.user.username}'.")
        return Response(status=status.HTTP_204_NO_CONTENT)
