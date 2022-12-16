from django.urls import path
from .views import *

urlpatterns = [
    path('', IndexView.as_view(), name='index'),
    path('api/add_transaction', AddTransactionView.as_view(), name='add_transaction_api'),
    path('api/status', JsonBudgetStatusView.as_view(), name='status_api'),
    path('manage', ManageBudgetsView.as_view(), name='manage'),
    path('api/budget_update', UpdateBudgetView.as_view(), name='budget_update_api'),
    path('api/budget_delete', DeleteBudgetView.as_view(), name='budget_delete_api'),
    path('manage_repeating_tx', ManageRepeatingTxView.as_view(), name='manage_repeating_tx'),
    path('api/repeating_tx_update', UpdateRepeatingTxView.as_view(), name='repeating_tx_update_api'),
    path('api/repeating_tx_delete', DeleteRepeatingTxView.as_view(), name='repeating_tx_delete_api'),
]
