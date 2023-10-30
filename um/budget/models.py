from django.contrib.auth.models import AbstractUser
from django.core.validators import MinLengthValidator, MinValueValidator
from django.db import models
from django.utils.timezone import now

import calendar
from datetime import date, timedelta
import math

from accounts.models import AccountsModel
from .enums import Durations


import logging
logger = logging.getLogger('proj')


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

    def get_choice_pair(self):
        return (self.id, self.place)
    
    @classmethod
    def get_places_from_filter(cls, account_id: int, budget_id: int):
        what_budget = ' AND budget_id = ' + str(budget_id) if budget_id is not None  else ''
        raw_sql = '''
            SELECT uni.specific_place_id as id, place
            FROM (
                SELECT specific_place_id
                FROM budget_repeatingtransactionsmodel
                WHERE is_active AND account_id = %s''' + what_budget + '''
                UNION
                SELECT specific_place_id
                FROM budget_transactionsmodel
                WHERE is_active AND account_id = %s''' + what_budget + '''
            ) uni
            LEFT JOIN budget_specificplacesmodel
            ON uni.specific_place_id=budget_specificplacesmodel.id
        '''
        return SpecificPlacesModel.objects.raw(raw_sql, [account_id, account_id])

    def __str__(self):
        return self.place


class BudgetsModel(BaseModel, TimespanMixin):
    class Meta:
        unique_together = [['account', 'category']]

    account = models.ForeignKey(AccountsModel,
        on_delete=models.CASCADE
    )

    category = models.CharField(max_length=127, validators=[MinLengthValidator(1)])

    spending_limit = models.DecimalField(max_digits=15,
        decimal_places=2,
        default=0.00
    )

    def get_current_period(self):
        tday = date.today()
        return (tday-timedelta(days=self.frequency), tday)
    
    def get_choice_pair(self):
        return (self.id, self.category)

    def get_num_budget_cycles_in_range(self, range_start_date, range_end_date):
        actual_start_date = range_start_date if range_start_date > self.start_date else self.start_date
        actual_end_date = range_end_date if range_end_date < self.end_date else self.end_date

        num_cycles = 0
        match self.frequency:
            case Durations.YEARLY.value:
                num_cycles = actual_end_date.year - actual_start_date.year
            case Durations.MONTHLY.value:
                num_cycles = (actual_end_date.year - actual_start_date.year) * 12 + (actual_end_date.month - actual_start_date.month)
            case _: # daily, weekly, semi-monthly
                num_cycles = math.ceil((actual_end_date - actual_start_date).days / self.frequency)

        if num_cycles == 0 and range_start_date <= range_end_date:
            num_cycles = 1

        if num_cycles < 0:
            num_cycles = 0

        return num_cycles

    def spending_limit_over_range(self, range_start_date, range_end_date):
        return self.get_num_budget_cycles_in_range(range_start_date, range_end_date) * self.spending_limit


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


class RepeatingTransactionsModel(TimespanMixin, BaseTransactionModel):
    # this assumes that tx only begin on the days of the month in range [1, 28]
    # budget range can be on any day
    def get_first_tx_in_period(self, period_start_date):
        tx_begin_date = self.start_date
        if tx_begin_date >= period_start_date:
            return tx_begin_date
        else:
            month = period_start_date.month
            year = period_start_date.year
            day = tx_begin_date.day
            td = timedelta(days=0)
            match self.frequency:
                case Durations.MONTHLY.value:
                    if period_start_date.day > tx_begin_date.day:
                        month = (period_start_date.month % 12) + 1
                        year = period_start_date.year + math.floor(period_start_date.month / 12)
                case Durations.YEARLY.value:
                    year += 1
                case Durations.DAILY.value:
                    day = period_start_date.day
                case _: # everything else (weekly, semi-monthly) is literal days
                    num_tx = math.ceil((period_start_date - tx_begin_date).days / self.frequency)
                    td = timedelta(days = num_tx * self.frequency)
                    year = tx_begin_date.year
                    month = tx_begin_date.month
            return date(year=year, month=month, day=day) + td

    # this assumes that tx only begin on the days of the month in range [1, 28]
    # budget range can be on any day
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
    
    def get_tx_dates_between_dates(self, first_date, second_date):
        dates = list()
        end_date_to_use = self.end_date if self.end_date < second_date else second_date
        start_date_to_use = first_date
        while True:
            first_tx = self.get_first_tx_in_period(start_date_to_use)
            if first_tx > end_date_to_use or first_tx == start_date_to_use:
                break
            else:
                dates.append(first_tx)
                start_date_to_use = first_tx + timedelta(days=1)
        return dates

    def get_num_tx_between_dates(self, first_date, second_date):
        end_date_to_use = self.end_date if self.end_date < second_date else second_date
        first_tx = self.get_first_tx_in_period(first_date)
        if first_tx > end_date_to_use:
            return 0
        else:
            return self.get_num_tx_until_period_end(first_tx, end_date_to_use)

    def get_num_tx_in_period(self):
        period = self.budget.get_current_period()
        return self.get_num_tx_between_dates(period[0], period[1])

    # assumes day of month to be in range [1, 28]
    # budget range can be on any day
    def amount_for_period(self):
        return self.amount * self.get_num_tx_in_period()

    def amount_between_dates(self, first_date, second_date):
        return self.amount * self.get_num_tx_between_dates(first_date, second_date)

