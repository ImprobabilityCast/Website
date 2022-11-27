from django import forms
from django.core.exceptions import ValidationError
from django.utils.timezone import now

from .enums import Durations
from .fields import DateDurationFormField


class BaseBudgetForm(forms.Form):
    category = forms.CharField(max_length=127, min_length=1)

    frequency = DateDurationFormField()

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


class JsonAggregateHistoryForm(forms.Form):
    time_span = DateDurationFormField()

    start_date = forms.DateField()

    def get_time_range(self):
        self.clean()

        my_first_date = self.cleaned_data['start_date']
        my_time_span = self.cleaned_data['time_span']
        if my_first_date and my_time_span:
            end_date = DateDuration.from_str(my_time_span).get_date_at_offset(my_first_date)
            if end_date > my_first_date:
                return (my_first_date, end_date)
            else:
                return (end_date, my_first_date)
        else:
            return False

