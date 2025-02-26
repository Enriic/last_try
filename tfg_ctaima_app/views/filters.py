# tfg_ctaima_app/views/filters.py

from django_filters import rest_framework as filters
from ..models import Document, Validation, Resource, Company

class DocumentFilter(filters.FilterSet):
    id__in = filters.BaseInFilter(field_name='id', lookup_expr='in')

    class Meta:
        model = Document
        fields = ['id__in']


class ValidationFilter(filters.FilterSet):
    document_type = filters.CharFilter(field_name='document__document_type', lookup_expr='exact')
    document_id = filters.CharFilter(field_name='document', lookup_expr='exact')
    validation_id = filters.CharFilter(field_name='id', lookup_expr='exact')
    start_date = filters.DateTimeFilter(field_name='timestamp', lookup_expr='gte')
    end_date = filters.DateTimeFilter(field_name='timestamp', lookup_expr='lte')
    resource_id = filters.CharFilter(field_name='document__resource', lookup_expr='exact')
    company_id = filters.CharFilter(field_name='document__company', lookup_expr='exact')
    status = filters.CharFilter(field_name='status', lookup_expr='exact')
    user_id = filters.CharFilter(field_name='user', lookup_expr='exact')

    class Meta:
        model = Validation
        fields = []

class ResourceFilter(filters.FilterSet):
    id__in = filters.BaseInFilter(field_name='id', lookup_expr='in')
    company__in = filters.BaseInFilter(field_name='company', lookup_expr='in')
    resource_type__in = filters.BaseInFilter(field_name='resource_type', lookup_expr='in')

    class Meta:
        model = Resource
        fields = ['id__in']

class CompanyFilter(filters.FilterSet):
    id__in = filters.BaseInFilter(field_name='id', lookup_expr='in')
    company_id__in = filters.BaseInFilter(field_name='company_id', lookup_expr='in')
    company_name__in = filters.BaseInFilter(field_name='company_name', lookup_expr='in')

    class Meta:
        model = Company
        fields = ['id__in']