from django.conf import settings
from django.shortcuts import render
from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache
from django.views.generic.base import View

from os import listdir
from pathlib import Path


@method_decorator(never_cache, name='get')
class ImageList(View):
    http_method_names = ['get', ]

    def get(self, request):
        try:
            category = request.GET['category']
        except:
            category = ''
        
        match category:
            case 'art':
                category = 'art'
            case _:
                category = 'art'
        tail = 'img/' + category + '/'
        path = settings.STATIC_ROOT + '/' + tail
        file_list = listdir(path)

        response = JsonResponse({'urls': [settings.STATIC_URL + tail + file_name for file_name in file_list]})
        response.headers['Access-Control-Allow-Origin'] = 'http://127.0.0.1'
        return response

