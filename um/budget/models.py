from django.contrib.auth.models import AbstractUser
from django.core.validators import MinLengthValidator, MinValueValidator
from django.db import models
from django.utils.timezone import now

import calendar
from datetime import date, timedelta
import math

from accounts.models import AccountsModel
from .enums import Durations


class BaseModel(models.Model):
    class Meta:
        abstract = True

    created = models.DateField(auto_now_add=True)

    modified = models.DateTimeField(auto_now=True)

    is_active = models.BooleanField(default=True)


class TimespanMixin(models.Model):
    class Meta:
        abstract = True
    # in days, excluing 30 & 365 which are treated specially
    frequency = models.IntegerField(default=30, validators=[MinValueValidator(1)])

    start_date = models.DateField(default=now, editable=False, blank=False)

    end_date = models.DateField(default=date.max)



class SpecificPlacesModel(BaseModel):
    place = models.CharField(max_length=255, unique=True, validators=[MinLengthValidator(1)])

    def __str__(self):
        return self.place


class BudgetsModel(BaseModel, TimespanMixin):
    account = models.ForeignKey(AccountsModel,
        on_delete=models.CASCADE
    )

    category = models.CharField(max_length=127, unique=True, validators=[MinLengthValidator(1)])

    spending_limit = models.DecimalField(max_digits=15,
        decimal_places=2,
        default=0.00
    )

    def get_current_period(self):
        tday = date.today()
        return (tday-timedelta(days=self.frequency), tday)
    
    def get_choice_pair(self):
        return (self.id, self.category)


class BaseTransactionModel(BaseModel):
    class Meta:
        abstract = True

    account = models.ForeignKey(AccountsModel,
        on_delete=models.CASCADE
    )

    budget = models.ForeignKey(BudgetsModel,
        on_delete=models.CASCADE
    )

    specific_place = models.ForeignKey(SpecificPlacesModel,
        on_delete=models.CASCADE
    )

    amount = models.DecimalField(max_digits=15,
        decimal_places=2
    )


class TransactionsModel(BaseTransactionModel):
    class Meta:
        ordering = ['date']

    date = models.DateField(default=now, editable=False, blank=False)

    def __str__(self):
        return '({}, {}, {}, {}, {})'.format(
            self.account.username,
            self.kind,
            self.place,
            self.amount,
            self.date)


class RepeatingTransactionsModel(BaseTransactionModel, TimespanMixin):
    # this assumes that tx only begin on the days of the month in range [1, 28]
    def get_first_tx_in_period(self, period_start_date):
        tx_begin_date = self.start_date
        if tx_begin_date > period_start_date:
            return tx_begin_date
        else:
            month = period_start_date.month
            year = period_start_date.year
            day = tx_begin_date.day
            match self.frequency:
                case Durations.MONTHLY.value:
                    if period_start_date.day > tx_begin_date.day:
                        month = (period_start_date.month % 12) + 1
                        year = period_start_date.year + math.floor(period_start_date.month / 12)
                case Durations.YEARLY.value:
                    year += 1
            # everything else (daily, weekly, semi-monthly) is literal days
            return date(year=year, month=month, day=day) + timedelta(days=self.frequency)

    # this assumes that tx only begin on the days of the month in range [1, 28]
    def get_num_tx_until_period_end(self, first_tx_in_period, period_end_date):
        num_tx = 1 # for the first tx
        match self.frequency:
            case Durations.MONTHLY.value:
                num_tx += (period_end_date.year - first_tx_in_period.year) * 12
                num_tx += period_end_date.month - first_tx_in_period.month
                # last one doesn't count if it hasn't happened yet
                if period_end_date.day < first_tx_in_period.day:
                    num_tx -= 1
            case Durations.YEARLY.value:
                num_tx += period_end_date.year - first_tx_in_period.year
                # if specific tx date for the final year in period, has not happened, don't count it
                if period_end_date < first_tx_in_period.replace(year=period_end_date.year):
                    num_tx -= 1
            case _: # everything else (daily, weekly, semi-monthly) is literal days
                num_tx += math.floor((period_end_date - first_tx_in_period).days / self.frequency)
        return num_tx

    def get_num_tx_in_period(self):
        period = self.budget.get_current_period()
        first_tx = self.get_first_tx_in_period(period[0])
        if first_tx > period[1]:
            return 0
        else:
            return self.get_num_tx_until_period_end(first_tx, period[1])

    # take 2, assume day of month to be in range [1, 28]
    def amount_for_period(self):
        return self.amount * self.get_num_tx_in_period()

