#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys
from django.core.management import execute_from_command_line


def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tfg_ctaima_back.settings')
    execute_from_command_line(sys.argv)
    if 'runserver' in sys.argv:
        from django.core.management import call_command
        call_command('auto_login')


if __name__ == '__main__':
    main()
