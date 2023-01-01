from django.urls import path
from django.urls import include

from .views import *

urlpatterns = [
    path('signup', SignUpView.as_view(), name='signup'),
    path('login', LoginView.as_view(), name='login'),
    path('logout', LogoutView.as_view(), name='logout'),
    path('demo', LoginDemoView.as_view(), name='demo'),
    path('new_validation_code', NewValidationCodeView.as_view(), name='new_validation_code'),
    path('validate', NewAccountValidationView.as_view(), name='validate'),
    path('validation_expired', ValidationExpiredView.as_view(), name='validation_expired'),
    #path('', include('django.contrib.auth.urls'))
]
