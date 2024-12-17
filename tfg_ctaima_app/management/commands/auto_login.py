from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.contrib.sessions.backends.db import SessionStore

class Command(BaseCommand):
    help = 'Crea una sesión automáticamente para un usuario existente'

    def handle(self, *args, **options):
        User = get_user_model()
        try:
            # Seleccionar el usuario (superusuario por ejemplo)
            user = User.objects.get(username='superuser')  # Reemplaza 'admin' con tu nombre de usuario

            # Crear sesión
            session = SessionStore()
            session['user_id'] = user.id
            session.create()

            self.stdout.write(self.style.SUCCESS(
                f'Sesión iniciada automáticamente para el usuario: {user.username}'
            ))
            self.stdout.write(f'Session Key: {session.session_key}')

        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(
                "El usuario 'superuser' no existe. No se pudo crear la sesión."
            ))
