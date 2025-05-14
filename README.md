# Gestion de Documentos de Clientes

XXXXX es una aplicacion web diseÃ±ada para gestionar la subida, validacion y almacenamiento de documentos de clientes. Esta aplicacion interactua con un servicio externo para validar los documentos y luego los almacena de manera segura en una base de datos y un contenedor de blobs.

# Estructura

- En el repositorio hay el backend (Django) y el frontend (React), genera la documentacion sobre ellos.

## Descripcion

La aplicacion permite a los empleados de la empresa XXXXX:

- Subir documentos de clientes.
- Validar esos documentos a travÃ©s de un **endpoint externo** de validacion.
- Almacenar la informacion de los documentos (metadatos) en una **base de datos**.
- Guardar los archivos documentales fÃ­sicos en un **blob container** de almacenamiento.

### Funcionalidades

1. **Subida de documentos**: Los clientes pueden subir documentos a travÃ©s de una interfaz web.
2. **Validacion externa**: Cada documento es validado por un endpoint externo, asegurando que los documentos sean autÃ©nticos y cumplan con las normas establecidas.
3. **Almacenamiento**:
   - Los **metadatos** (como el nombre del cliente, tipo de documento, fecha de carga, etc.) se guardan en una **base de datos**.
   - El **contenido del documento** se guarda de forma segura en un **blob container**, garantizando la disponibilidad y seguridad de los documentos.
4. **Interfaz intuitiva**: Los empleados de XXXXX pueden acceder a un panel donde visualizar y gestionar los documentos.
