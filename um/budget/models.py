from django.contrib.auth.models import AbstractUser
from django.core.validators import MinLengthValidator
from django.db import models
from django.utils.timezone import now
import datetime

from accounts.models import AccountsModel


class BaseModel(models.Model):

    class Meta:
        abstract = True

    created = models.DateField(auto_now_add=True)

    modified = models.DateTimeField(auto_now=True)

    is_active = models.BooleanField(default=True)


class TransactionCategoriesModel(BaseModel):

    category = models.CharField(max_length=127, unique=True, validators=[MinLengthValidator(1)])

    def __str__(self):
        return self.kind


class SpecificPlacesModel(BaseModel):

    place = models.CharField(max_length=255, unique=True, validators=[MinLengthValidator(1)])

    def __str__(self):
        return self.place


class TransactionsModel(BaseModel):

    account = models.ForeignKey(AccountsModel,
        on_delete=models.CASCADE
    )

    category = models.ForeignKey(TransactionCategoriesModel,
        on_delete=models.CASCADE
    )

    place = models.ForeignKey(SpecificPlacesModel,
        on_delete=models.CASCADE
    )

    amount = models.DecimalField(max_digits=15,
        decimal_places=2
    )

    date = models.DateField(default=now, editable=False, blank=False)

    def __str__(self):
        return '({}, {}, {}, {}, {})'.format(
            self.account.username,
            self.kind,
            self.place,
            self.amount,
            self.date)

    class Meta:
        ordering = ['date']


class TimeFrequenciesModel(BaseModel):

    frequency = models.CharField(max_length=255, unique=True)


class RepeatingTransactionsModel(BaseModel):

    transaction = models.ForeignKey(TransactionsModel,
        on_delete=models.CASCADE
    )

    frequency = models.ForeignKey(TimeFrequenciesModel,
        on_delete=models.PROTECT
    )

    end_date = models.DateField(default='9999-12-31')


class BudgetsModel(BaseModel):

    account = models.ForeignKey(AccountsModel,
        on_delete=models.CASCADE
    )

    category = models.ForeignKey(TransactionCategoriesModel,
        on_delete=models.CASCADE
    )

    spending_limit = models.DecimalField(max_digits=15,
        decimal_places=2
    )

    frequency = models.ForeignKey(TimeFrequenciesModel,
        on_delete=models.PROTECT
    )

    start_date = models.DateField(default=now, editable=False, blank=False)

    end_date = models.DateField(default='9999-12-31')

