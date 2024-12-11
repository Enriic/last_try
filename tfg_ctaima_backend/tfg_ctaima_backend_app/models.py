from django.db import models
from django.contrib.auth.models import User
import uuid

def default_tipo_documento():
    return TipoDocumento.objects.get_or_create(nombre="Predeterminado")[0].id

class User(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    password = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    timestamp_created = models.DateTimeField(auto_now_add=True)
    timestamp_updated = models.DateTimeField(auto_now=True)

class TipoDocumento(models.Model):
    id = models.AutoField(primary_key=True, unique=True)
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True, null=True)
    #Usamos un JSONField para almacenar los campos del tipo de documento, 
    # ej: [{'nombre': 'DNI', 'Tipo': 'Numero'},
    # {'nombre': 'Nombre', 'Tipo': 'Texto'}
    campos = models.JSONField(default=list) 

    def __str__(self):
        return self.nombre

# class Campo(models.Model):
#     id = models.AutoField(primary_key=True, unique=True)
#     nombre = models.CharField(max_length=100)
#     descripcion = models.TextField(blank=True, null=True)
#     tipo_documento = models.ForeignKey(TipoDocumento, related_name='campos', on_delete=models.CASCADE)

#     def __str__(self):
#         return f"{self.nombre} ({self.tipo_documento.nombre})"

class Documento(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    usuario = models.ForeignKey(User, on_delete=models.SET_DEFAULT, default='DeletedUser')
    tipo_documento = models.ForeignKey(TipoDocumento, on_delete=models.SET_DEFAULT, default=default_tipo_documento)
    nombre = models.CharField(max_length=255)
    url = models.URLField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nombre} - {self.tipo_documento.nombre}"

class Validacion(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ESTADOS = [
        ('pendiente', 'Pendiente'),
        ('exito', 'Éxito'),
        ('fallo', 'Fallo'),
    ]

    documento = models.ForeignKey(Documento, on_delete=models.CASCADE)
    usuario = models.ForeignKey(User, on_delete=models.SET_DEFAULT, default='DeletedUser')
    estado = models.CharField(max_length=10, choices=ESTADOS, default='pendiente')
    resultado_json = models.JSONField()  # Almacena los detalles de la validación
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Validación de {self.documento.nombre} - Estado: {self.estado}"

class Log(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.SET_DEFAULT, default='DeletedUser', blank=True)
    evento = models.CharField(max_length=255)
    detalle = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Log {self.timestamp}: {self.evento}"
