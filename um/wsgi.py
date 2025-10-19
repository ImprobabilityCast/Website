"""
WSGI config for proj project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.0/howto/deployment/wsgi/
"""

import sys, os

# Remember to set this to the proper path:
INTERP = "/home/name/Website/um/env/bin/python3"
#INTERP is present twice so that the new python interpreter
#knows the actual executable path
#if sys.executable != INTERP: os.execl(INTERP, INTERP, *sys.argv)

cwd = os.getcwd()
sys.path.append(cwd)
sys.path.append(cwd + '/proj')  #You must add your project here

sys.path.insert(0,cwd+'/env/bin')
sys.path.insert(0,cwd+'/env/lib/python3.10/site-packages')

os.environ['DJANGO_SETTINGS_MODULE'] = "proj.settings"

from django.core.wsgi import get_wsgi_application

application = get_wsgi_application()
