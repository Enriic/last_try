# Ctaima - Gestión de Documentos de Clientes

**Ctaima** es una aplicación web diseñada para gestionar la subida, validación y almacenamiento de documentos de clientes. Esta aplicación interactúa con un servicio externo para validar los documentos y luego los almacena de manera segura en una base de datos y un contenedor de blobs.

## Descripción

La aplicación permite a los empleados de la empresa **Ctaima**:

- Subir documentos de clientes.
- Validar esos documentos a través de un **endpoint externo** de validación.
- Almacenar la información de los documentos (metadatos) en una **base de datos**.
- Guardar los archivos documentales físicos en un **blob container** de almacenamiento.

### Funcionalidades

1. **Subida de documentos**: Los clientes pueden subir documentos a través de una interfaz web.
2. **Validación externa**: Cada documento es validado por un endpoint externo, asegurando que los documentos sean auténticos y cumplan con las normas establecidas.
3. **Almacenamiento**:
   - Los **metadatos** (como el nombre del cliente, tipo de documento, fecha de carga, etc.) se guardan en una **base de datos**.
   - El **contenido del documento** se guarda de forma segura en un **blob container**, garantizando la disponibilidad y seguridad de los documentos.
4. **Interfaz intuitiva**: Los empleados de **Ctaima** pueden acceder a un panel donde visualizar y gestionar los documentos.

