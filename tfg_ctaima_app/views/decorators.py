# app1/views/decorators.py

from functools import wraps
from ..models import Log, EventType
import logging

logger = logging.getLogger(__name__)

def log_event(event_type):
    """
    Decorador para crear logs basados en el tipo de evento.
    
    :param event_type: Tipo de evento a registrar.
    """
    def decorator(func):
        @wraps(func)
        def wrapper(self, request, *args, **kwargs):
            response = func(self, request, *args, **kwargs)
            if response.status_code in [200, 201, 204]:
                try:
                    instance_info = response.data.get('id') or response.data.get('name') or 'N/A'
                except AttributeError:
                    instance_info = 'N/A'
                details = f"User '{request.user.username}' performed '{event_type}' on '{instance_info}'."
                Log.objects.create(
                    user=request.user,
                    event=event_type,
                    details=details
                )
                logger.info(details)
            return response
        return wrapper
    return decorator