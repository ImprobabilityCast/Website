from django.urls import path
from django.urls import include

from .views import SignUpView, LoginView

urlpatterns = [
    path('signup/', SignUpView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('', include('django.contrib.auth.urls'))
]
