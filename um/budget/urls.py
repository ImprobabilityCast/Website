from django.urls import path
from .views import *

urlpatterns = [
    path('', IndexView.as_view(), name='index'),
    path('add_transaction', AddTransactionView.as_view(), name='add_transaction'),
    path('status', BudgetStatusView.as_view(), name='status'),
    path('api/status', JsonBudgetStatusView.as_view(), name='status_api'),
    path('manage', ManageBudgetsView.as_view(), name='manage'),
    path('api/budget_update', UpdateBudgetView.as_view(), name='budget_update_api'),
    path('transaction_history', TransactionHistoryListView.as_view(), name='transaction_history'),
    path('api/transaction_history', JsonTransactionHistoryView.as_view(), name='transaction_history_api'),
]
