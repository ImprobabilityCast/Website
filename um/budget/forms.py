from django import forms
from django.utils.timezone import now

from .enums import Durations
from .fields import DateDurationFormField


class BaseBudgetForm(forms.Form):
    category = forms.CharField(max_length=127, min_length=1)

    frequency = DateDurationFormField()

    timezone_offset = forms.HiddenInput()

    class Meta:
        abstract = True


class AddTransactionForm(BaseBudgetForm):
    specific_place = forms.CharField(max_length=255, min_length=1)

    amount = forms.FloatField(min_value=0.00, max_value=1e15)
    
    date = forms.DateField(required=False)

    end_date = forms.DateField(required=False)


class ModifyBudgetForm(BaseBudgetForm):
    spending_limit = forms.FloatField(min_value=0.00, max_value=1e15)

    budget_id = forms.IntegerField(initial=-1, widget=forms.HiddenInput())

