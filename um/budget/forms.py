from django import forms
from django.core.exceptions import ValidationError
from django.utils.timezone import now

from .enums import Durations
from .fields import DateDurationFormField, LowerCaseCharField
from .models import BudgetsModel

import logging
logger = logging.getLogger('proj')


class BaseBudgetForm(forms.Form):
    class Meta:
        abstract = True

    required_css_class = 'required'


class AddTransactionForm(BaseBudgetForm):

    def __init__(self, request, *args, **kwargs):
        super().__init__(*args, **kwargs)
        budgets = BudgetsModel.objects.filter(account=request.user, is_active=True)
        self.fields['category'].choices = [(-1, '')] + ([(budget.id, budget.category) for budget in budgets])

    amount = forms.FloatField(min_value=0.00, max_value=1e15)

    category = forms.ChoiceField()

    specific_place = LowerCaseCharField(max_length=255, min_length=1, required=False)

    frequency = DateDurationFormField(required=False)
    
    date = forms.DateField(required=False)


class DeleteBudgetForm(forms.Form):
    budget_id = forms.IntegerField()


class UpdateBudgetForm(BaseBudgetForm):
    budget_id = forms.IntegerField(initial=-1, widget=forms.HiddenInput())

    spending_limit = forms.FloatField(min_value=0.00, max_value=1e15)

    category = LowerCaseCharField(max_length=127, min_length=1)

    frequency = DateDurationFormField()

    end_date = forms.DateField(required=False)


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

