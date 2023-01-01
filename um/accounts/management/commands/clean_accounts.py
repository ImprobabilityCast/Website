from django.core.management.base import BaseCommand
from django.utils.timezone import datetime

from datetime import timedelta

from accounts.models import AccountsModel, AccountsValidationModel


class Command(BaseCommand):
    help = 'deletes old accounts that\'ve been inactive for over 90 days'

    def handle(self, *args, **kwargs):
        count_deleted, items_deleted = AccountsModel.objects.filter(
            is_active=False,
            modified__lt=datetime.now()-timedelta(days=90)
        ).delete()

        key = 'accounts.AccountsModel'
        num_accounts = items_deleted[key] if key in items_deleted else 0
        print('purged ' + str(num_accounts) + ' accounts')

