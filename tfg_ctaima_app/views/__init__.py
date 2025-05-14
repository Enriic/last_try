# tfg_ctaima_app/views/__init__.py

from .document_views import DocumentViewSet, DocumentRetrieveView
from .document_type_views import DocumentTypeViewSet
from .auth_views import login_view, logout_view, get_csrf_token
from .user_views import UserViewSet
from .company_views import CompanyViewSet
from .resource_views import ResourceViewSet, EmployeeViewSet, VehicleViewSet
from .validation_views import ValidationViewSet
from .log_views import LogViewSet

# Puedes agregar otros imports de vistas según sea necesario