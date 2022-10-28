from django.urls import path
from .views import *

urlpatterns = [
    path('', IndexView.as_view(), name='index'),
    path('add_transaction', AddTransactionView.as_view(), name='add_transaction'),
]
