from django.urls import path
from django.views.generic.base import RedirectView
from .views import *

urlpatterns = [
    path('', IndexView.as_view(), name='index'),
    path('api/add_transaction', AddTransactionView.as_view(), name='add_transaction_api'),
    path('api/remove_transaction', DeleteTransactionView.as_view(), name='remove_transaction_api'),
    path('api/status', JsonBudgetStatusView.as_view(), name='status_api'),
    path('manage', ManageBudgetsView.as_view(), name='manage'),
    path('api/budget_update', UpdateBudgetView.as_view(), name='budget_update_api'),
    path('api/budget_delete', DeleteBudgetView.as_view(), name='budget_delete_api'),
    path('manage_repeating_tx', ManageRepeatingTxView.as_view(), name='manage_repeating_tx'),
    path('api/repeating_tx_update', UpdateRepeatingTxView.as_view(), name='repeating_tx_update_api'),
    path('api/repeating_tx_end', EndRepeatingTxView.as_view(), name='repeating_tx_end_api'),
    path('api/tx_summary', TxAggregateSummary.as_view(), name='tx_summary_api'),
    path('manage_tx', ManageTxView.as_view(), name='manage_tx'),
    path('history', ListAllTxView.as_view(), name='history'),
    path('api/history', AllTxFragView.as_view(), name='history_api'),
    path('demo', RedirectView.as_view(url='/accounts/demo?next=/budget', permanent=False), name='demo')
]
