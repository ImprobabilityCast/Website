from django.urls import path
from django.urls import include

from .views import SignUpView, LoginView, LogoutView, LoginDemoView

urlpatterns = [
    path('signup', SignUpView.as_view(), name='signup'),
    path('login', LoginView.as_view(), name='login'),
    path('logout', LogoutView.as_view(), name='logout'),
    path('demo', LoginDemoView.as_view(), name='demo'),
    #path('', include('django.contrib.auth.urls'))
]
