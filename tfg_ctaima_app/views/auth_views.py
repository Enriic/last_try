# app1/views/auth_views.py

import logging
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from ..models import Log, EventType
from ..serializers import UserSerializer  # Asegúrate de que el serializer esté correctamente importado

# Configuración del logger
logger = logging.getLogger(__name__)

@ensure_csrf_cookie
@api_view(['GET'])
@permission_classes([AllowAny])
def get_csrf_token(request):
    """
    Vista para establecer la cookie CSRF.
    """
    logger.info("CSRF cookie solicitado.")
    return JsonResponse({'detail': 'CSRF cookie set'})


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    Vista para manejar el login de usuarios.
    """
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        logger.warning("Intento de inicio de sesión sin credenciales.")
        return Response(
            {'error': 'Debe proporcionar un nombre de usuario y contraseña.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        Log.objects.create(
            user=request.user,
            event=EventType.LOGIN,
            details=f'User {user.username} logged in successfully.'
        )
        logger.info(f"Usuario '{user.username}' inició sesión exitosamente.")
        return Response({'message': f'Bienvenido {user.username}!'}, status=status.HTTP_200_OK)

    logger.warning(f"Intento de inicio de sesión fallido para el usuario '{username}'.")
    return Response({'error': 'Credenciales inválidas.'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    Vista para manejar el logout de usuarios.
    """
    Log.objects.create(
        user=request.user,
        event=EventType.LOGOUT,
        details='User logged out successfully.'
    )
    logger.info(f"Usuario '{request.user.username}' cerró sesión.")

    logout(request)

    return Response({'message': 'Sesión cerrada correctamente.'}, status=status.HTTP_200_OK)