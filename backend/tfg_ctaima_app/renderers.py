# app1/renderers.py
# se usa para asegurarnos que los documentos lleguen al usuario sin ser alterados. Y que el usuario final en el frontend pueda descargar el documento sin problemas.

from rest_framework.renderers import BaseRenderer

class NoOpRenderer(BaseRenderer):
    """
    Renderizador que no realiza ninguna transformación, 
    y que acepta cualquier tipo de media.
    """
    media_type = '*/*'
    format = None

    def render(self, data, accepted_media_type=None, renderer_context=None):
        return data
