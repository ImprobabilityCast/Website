from django.urls import path
from .views import *

urlpatterns = [
    path('', IndexView.as_view(), name='index'),
    path('add_transaction', AddTransactionView.as_view(), name='add_transaction'),
    path('history', TransactionHistoryGraphView.as_view(), name='history'),
    path('api/history', JsonTransactionAPIView.as_view(), name='history_api'),
    path('view', ListBudgetView.as_view(), name='view'),
]
