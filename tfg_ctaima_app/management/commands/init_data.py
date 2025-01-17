from django.core.management.base import BaseCommand
from tfg_ctaima_app.models import Company, Resource, Vehicle, Employee, Document, Validation, DocumentType, FieldToValidate, FieldToExtract
import random
import uuid

# Funciones auxiliares
def random_string(length):
    return ''.join(random.choices('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', k=length))

def random_tax_id():
    parts = [
        random_string(random.randint(2, 4)),  # Letras o números
        str(random.randint(100000, 999999)),  # Números
        random_string(random.randint(2, 4))   # Letras o números
    ]
    return ''.join(parts)

def random_email(name):
    domains = ['example.com', 'test.com', 'company.com']
    return f"{name.lower()}@{random.choice(domains)}"

def random_phone():
    return f"+{random.randint(1, 99)}-{random.randint(100, 999)}-{random.randint(1000000, 9999999)}"

def random_location():
    return random.choice(['New York, USA', 'Madrid, Spain', 'Tokyo, Japan', 'Berlin, Germany'])

def random_language():
    return random.choice(['English', 'Spanish', 'Japanese', 'German', 'French'])

# Crear Company (Customer/Supplier)
def create_companies():
    companies = []
    for _ in range(10):  # Crear 10 registros
        company = Company.objects.create(
            type='customer',  # En este caso, solo clientes
            tax_id=random_tax_id(),
            company_name=f"Company {random_string(5)}",
            industry=random.choice(['Technology', 'Automotive', 'Retail', 'Healthcare']),
            email=random_email(f"info{random_string(3)}"),
            location=random_location(),
            phone=random_phone(),
            language=random_language(),
        )
        companies.append(company)
    print("Companies creados.")
    return companies

# Crear Resource (Vehicle y Employee)
def create_resources(companies):
    for _ in range(5):  # Crear 5 empleados
        company = random.choice(companies)
        Employee.objects.create(
            company=company,  # Asociar con una empresa
            first_name=random.choice(['John', 'Jane', 'Alex', 'Maria', 'Chris']),
            last_name=random.choice(['Smith', 'Johnson', 'Lee', 'Brown', 'Garcia']),
            email=random_email(random_string(5)),
            phone=random_phone(),
            country=random.choice(['USA', 'Spain', 'Japan', 'Germany']),
            number_id=random_string(10),
        )

    for _ in range(5):  # Crear 5 vehículos
        company = random.choice(companies)
        Vehicle.objects.create(
            company=company,  # Asociar con una empresa
            name=f"Vehicle {random_string(4)}",
            registration_id=random_string(8),
            manufacturer=random.choice(['Toyota', 'Ford', 'BMW', 'Tesla']),
            model=random.choice(['Model S', 'Model X', 'Series 3', 'Corolla']),
            weight=random.uniform(1000, 5000),
        )
    print("Resources creados.")

# Crear Documentos asociados a Recursos
def create_documents():
    resources = Resource.objects.all()
    document_type, _ = DocumentType.objects.get_or_create(name="Información de la company") 

    for resource in resources:
        for _ in range(3):  # Cada recurso tendrá 3 documentos
            Document.objects.create(
                resource=resource,
                document_type=document_type,
                name=f"Document {random_string(6)}",
                url=f"http://example.com/{random_string(8)}.pdf",
            )
    print("Documentos creados.")

from tfg_ctaima_app.models import DocumentType, FieldToValidate

def create_field_to_validate():
    try:
        # Obtener varios DocumentTypes (hardcoded), por ejemplo "ID Card" y "Passport"
        document_type_1 = DocumentType.objects.get(id=2)  # Usamos ID 2 como ejemplo
        document_type_2 = DocumentType.objects.get(id=3)  # Usamos ID 3 como ejemplo
        # Crear el FieldToValidate
        field_to_validate_1 = FieldToValidate.objects.create(
            name="worker_id",  # Nombre del campo
            description="DNI, NIE, permiso de residencia, pasaporte u otro similar",  # Descripción del campo
            treshold=80,  # Umbral de validación (ajustable)
        )
        # Crear el FieldToValidate
        field_to_validate_2 = FieldToValidate.objects.create(
            name="company_id",  # Nombre del campo
            description="cif nif de la empresa",  # Descripción del campo
            treshold=80,  # Umbral de validación (ajustable)
        )

        # Crear el FieldToValidate
        field_to_validate_3 = FieldToValidate.objects.create(
            name="company_name",  # Nombre del campo
            description="el nombre o razón social de la empresa",  # Descripción del campo
            treshold=80,  # Umbral de validación (ajustable)
        )


        # Asociar el FieldToValidate con varios DocumentTypes (relación Many-to-Many)
        field_to_validate_1.document_types.add(document_type_1)
        field_to_validate_2.document_types.add(document_type_2)
        field_to_validate_3.document_types.add(document_type_2)

        return "fields created"  # Retornar el objeto creado
    except DocumentType.DoesNotExist:
        print("Error: No se encuentran los DocumentTypes especificados.")
        return None
    except Exception as e:
        print(f"Error inesperado al crear el FieldToValidate: {str(e)}")
        return None

def create_field_to_extract():
    try:
        # Obtener varios DocumentTypes (hardcoded), por ejemplo "ID Card" y "Passport"
        document_type_2 = DocumentType.objects.get(id=2)  # Usamos ID 1 como ejemplo
        document_type_3 = DocumentType.objects.get(id=3)  # Usamos ID 2 como ejemplo

        # Crear el FieldToExtract
        field_to_extract = FieldToExtract.objects.create(
            name="issue_date",  # Nombre del campo
            description="Fecha de emisión",  # Descripción del campo
        )

        # Asociar el FieldToExtract con varios DocumentTypes (relación Many-to-Many)
        field_to_extract.document_types.add(document_type_2, document_type_3)

        return field_to_extract  # Retornar el objeto creado
    except DocumentType.DoesNotExist:
        print("Error: No se encuentran los DocumentTypes especificados.")
        return None
    except Exception as e:
        print(f"Error inesperado al crear el FieldToExtract: {str(e)}")
        return None

# Crear Validations asociadas a Documentos
def create_validations():
    documents = Document.objects.all()

    for document in documents:
        for _ in range(2):  # Cada documento tendrá 2 validaciones
            Validation.objects.create(                
                document=document,
                status=random.choice(['success', 'failure']),
                validation_details=[{"name": "company_name", "result": random.choice(['success', 'failure'])}, {"name": "company_id", "result": random.choice(['success', 'failure'])}],
            )
    print("Validations creadas.")

# Script principal
class Command(BaseCommand):
    help = "Initialize the database with sample data."

    def handle(self, *args, **kwargs):

        print("Vaciando las tablas...")

        # Vaciar las tablas antes de insertar los nuevos datos
        # Company.objects.all().delete()
        # Resource.objects.all().delete()
        # Vehicle.objects.all().delete()
        # Employee.objects.all().delete()
        # Document.objects.all().delete()
        # Validation.objects.all().delete()

        print("Initializing sample data...")
        #companies = create_companies()
        #create_resources(companies)
        # create_documents()
        # create_validations()
        create_field_to_validate()
        create_field_to_extract()
        print("Sample data initialization completed.")



# from django.core.management.base import BaseCommand
# from django.contrib.auth.models import User
# from django.conf import settings

# class Command(BaseCommand):
#     help = 'Creates a superuser if one does not exist.'

#     def handle(self, *args, **kwargs):
#         # Check if the superuser already exists
#         if not User.objects.filter(username='superuser').exists():
#             self.stdout.write(self.style.NOTICE('Superuser not found. Creating superuser...'))

#             # Create the superuser with the specified credentials
#             user = User.objects.create_superuser(
#                 username='superuser',
#                 email='enrictgn2001@gmail.com',
#                 password='tgna2001',
#             )
#             self.stdout.write(self.style.SUCCESS(f'Successfully created superuser: {user.username}'))
#         else:
#             self.stdout.write(self.style.SUCCESS('Superuser already exists.'))

