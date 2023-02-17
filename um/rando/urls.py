from django.urls import path
from django.views.generic.base import RedirectView
from .views import *

urlpatterns = [
    path('img_list', ImageList.as_view(), name='img_list'),
]
