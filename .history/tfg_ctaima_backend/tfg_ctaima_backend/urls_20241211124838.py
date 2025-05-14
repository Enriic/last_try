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
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from tfg_ctaima_backend-app.views import UserViewSet, TipoDocumentoViewSet, DocumentoViewSet, ValidacionViewSet, LogViewSet

# Crear un enrutador para las vistas
router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'tipodocumentos', TipoDocumentoViewSet)
router.register(r'documentos', DocumentoViewSet)
router.register(r'validaciones', ValidacionViewSet)
router.register(r'logs', LogViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('admin/', admin.site.urls)
]
