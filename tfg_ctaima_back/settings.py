from pathlib import Path
import environ
import os
import django
from logging.handlers import RotatingFileHandler

SESSION_ENGINE = 'django.contrib.sessions.backends.db'  # Usa base de datos para almacenar sesiones

# Configurar la duración de la sesión (opcional)
SESSION_COOKIE_AGE = 1209600  # 2 semanas en segundos
SESSION_COOKIE_HTTPONLY = True  # Proteger cookies de scripts JavaScript
SESSION_EXPIRE_AT_BROWSER_CLOSE = True  # Cerrar sesión al cerrar el navegador

# Configurar URLs para redireccionamiento (opcional)
LOGIN_REDIRECT_URL = '/upload'  # Redirige tras iniciar sesión
LOGOUT_REDIRECT_URL = '/login'  # Redirige tras cerrar sesión

SESSION_COOKIE_SECURE = True  # Solo sobre HTTPS
SESSION_COOKIE_SAMESITE = 'Strict'  # Evita que se envíe con solicitudes de otros orígenes
CSRF_COOKIE_SECURE = True


env = environ.Env()
# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent
# environ.Env.read_env(os.path.join(BASE_DIR, '.env'))

if os.path.exists(os.path.join(BASE_DIR, '.env')):
    environ.Env.read_env(os.path.join(BASE_DIR, '.env'))  # Solo cargar si existe el archivo .env

LOG_DIR = os.path.join(BASE_DIR, 'logs')
if not os.path.exists(LOG_DIR):
    os.makedirs(LOG_DIR)


print("Ruta del .env:", os.path.join(BASE_DIR, '.env'))
print("¿Existe el archivo?:", os.path.exists(os.path.join(BASE_DIR, '.env')))

# Configurar la base de datos y otras variables según el entorno
env_type = env("ENV", default="PRE")  # Si no se define 'ENV', se usará 'qa' por defecto
ENVIRONMENT = env_type.upper()

if ENVIRONMENT not in ['QA', 'PRE']:
    raise ValueError(f"El entorno {ENVIRONMENT} no está configurado correctamente")

DB_NAME = env(f"{ENVIRONMENT}_DB_NAME")
DB_USER = env(f"{ENVIRONMENT}_DB_USER")
DB_PASSWORD = env(f"{ENVIRONMENT}_DB_PASSWORD")
DB_HOST = env(f"{ENVIRONMENT}_DB_HOST")
DB_PORT = env(f"{ENVIRONMENT}_DB_PORT")
VALIDATION_ENDPOINT = env(f"{ENVIRONMENT}_VALIDATION_ENDPOINT")
OCP_APIM_VALIDATION_SUBSCRIPTION_KEY = env(f"{ENVIRONMENT}_OCP_APIM_VALIDATION_SUBSCRIPTION_KEY")

AZURE_ACCOUNT_NAME = env('AZURE_ACCOUNT_NAME')
AZURE_ACCOUNT_KEY = env('AZURE_ACCOUNT_KEY')
AZURE_CONTAINER = env('AZURE_CONTAINER')

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',  # Especificamos que estamos usando PostgreSQL
        'NAME': DB_NAME,  # El nombre de la base de datos
        'USER': DB_USER,  # El nombre de usuario de la base de datos
        'PASSWORD': DB_PASSWORD,  # La contraseña del usuario de la base de datos
        'HOST': DB_HOST,  # El host (será 'localhost' para local y el host de Azure para producción)
        'PORT': DB_PORT,  # El puerto de la base de datos (5432 es el puerto por defecto para PostgreSQL)
    }
}


# SECURITY WARNING: keep the secret key used in production secret! Save it in .env file in production
SECRET_KEY = env('SECRET_KEY')

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '[{asctime}] {levelname} {name} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': os.path.join(BASE_DIR, 'logs/app.log'),
            'formatter': 'verbose',
        },
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
    },
    'loggers': {
        'tfg_ctaima_app': {  # Cambia esto al nombre de tu aplicación si es diferente
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}


# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

ALLOWED_HOSTS = ['*']


REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
        'rest_framework.permissions.DjangoModelPermissions'
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
    ], 

}

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'tfg_ctaima_app',
    'corsheaders',
    'django_filters',
]

# Habilitar middleware para sesiones
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',  # Importante para cookies de sesión
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',  # Recomendado para seguridad
    'django.contrib.auth.middleware.AuthenticationMiddleware',  # Necesario para request.user
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'corsheaders.middleware.CorsMiddleware',
]


CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',  # URL de tu frontend
    'https://tfg-ctaima-backend-production.up.railway.app'
]

CSRF_TRUSTED_ORIGINS = [
    'http://localhost:5173',  # URL de tu frontend
    'https://tfg-ctaima-backend-production.up.railway.app'

]

CORS_ALLOW_CREDENTIALS = True

ROOT_URLCONF = 'tfg_ctaima_back.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'tfg_ctaima_back.wsgi.application'


# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'Europe/Madrid'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.1/howto/static-files/

STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Default primary key field type
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
