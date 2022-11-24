from django.contrib.auth.models import AbstractUser
from django.core.validators import MinLengthValidator
from django.db import models
from django.utils.timezone import now
import datetime

from accounts.models import AccountsModel

from .fields import DateDuration, DateDurationField


class BaseModel(models.Model):

    class Meta:
        abstract = True

    created = models.DateField(auto_now_add=True)

    modified = models.DateTimeField(auto_now=True)

    is_active = models.BooleanField(default=True)


class SpecificPlacesModel(BaseModel):

    place = models.CharField(max_length=255, unique=True, validators=[MinLengthValidator(1)])

    def __str__(self):
        return self.place


class BudgetsModel(BaseModel):

    account = models.ForeignKey(AccountsModel,
        on_delete=models.CASCADE
    )

    category = models.CharField(max_length=127, unique=True, validators=[MinLengthValidator(1)])

    spending_limit = models.DecimalField(max_digits=15,
        decimal_places=2,
        default=0.00
    )

    frequency = DateDurationField(default=DateDuration(0, 1, 0))

    start_date = models.DateField(default=now, editable=False, blank=False)

    end_date = models.DateField(default=datetime.date.max)


class TransactionsModel(BaseModel):

    account = models.ForeignKey(AccountsModel,
        on_delete=models.CASCADE
    )

    budget = models.ForeignKey(BudgetsModel,
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


class RepeatingTransactionsModel(BaseModel):

    transaction = models.ForeignKey(TransactionsModel,
        on_delete=models.CASCADE
    )

    frequency = DateDurationField(default=DateDuration(0, 1, 0))

    end_date = models.DateField(default=datetime.date.max)

