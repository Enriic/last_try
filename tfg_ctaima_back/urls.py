"""
URL configuration for tfg_ctaima_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

"""
Endpoints disponibles:

API Endpoints (prefijo: /api/):
    - /api/users/                    # CRUD de usuarios
    - /api/documentTypes/           # CRUD de tipos de documentos
    - /api/documents/               # CRUD de documentos
    - /api/validations/            # CRUD de validaciones
    - /api/logs/                    # CRUD de logs

Admin Endpoint:
    - /admin/                       # Panel de administración de Django
"""

from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from tfg_ctaima_app.views.document_views import DocumentViewSet, DocumentRetrieveView
from tfg_ctaima_app.views.document_type_views import DocumentTypeViewSet
from tfg_ctaima_app.views.auth_views import login_view, logout_view, get_csrf_token
from tfg_ctaima_app.views.user_views import UserViewSet
from tfg_ctaima_app.views.company_views import CompanyViewSet
from tfg_ctaima_app.views.resource_views import ResourceViewSet, EmployeeViewSet, VehicleViewSet
from tfg_ctaima_app.views.validation_views import ValidationViewSet
from tfg_ctaima_app.views.log_views import LogViewSet

# Crear un enrutador para las vistas
router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'documentTypes', DocumentTypeViewSet)
router.register(r'document', DocumentViewSet)
router.register(r'validation', ValidationViewSet, basename='validation')
router.register(r'companies', CompanyViewSet)
router.register(r'resources', ResourceViewSet)
router.register(r'vehicles', VehicleViewSet)
router.register(r'employees', EmployeeViewSet)
router.register(r'logs', LogViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('admin/', admin.site.urls),
    path('login/', login_view),
    path('logout/', logout_view), 
    path('get_csrf_token/', get_csrf_token),
    path('api/documents/<uuid:pk>/', DocumentRetrieveView.as_view(), name='document-detail'),
]
