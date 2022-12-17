from django import forms
from django.core.exceptions import ValidationError
from django.utils.timezone import now

from .enums import Durations
from .fields import DateDurationFormField, LowerCaseCharField, ActualDateField
from .fields import DefaultInvalidChoiceFormField
from .models import BudgetsModel

import logging
logger = logging.getLogger('proj')


class BaseBudgetForm(forms.Form):
    class Meta:
        abstract = True

    required_css_class = 'required'


class BaseTransactionForm(BaseBudgetForm):
    class Meta:
        abstract = True

    def __init__(self, request, *args, **kwargs):
        super().__init__(*args, **kwargs)
        budgets = BudgetsModel.objects.filter(account=request.user, is_active=True)
        cat = self.fields['category']
        cat.choices = cat.choices + [budget.get_choice_pair() for budget in budgets]

    amount = forms.FloatField(min_value=0.00, max_value=1e15)

    category = DefaultInvalidChoiceFormField()

    specific_place = LowerCaseCharField(max_length=255, min_length=1, required=False)


class IdentiferMixin(forms.Form):
    class Meta:
        abstract = True

    data_id = forms.IntegerField(initial=-1, widget=forms.HiddenInput())


class DeleteDataForm(IdentiferMixin):
    pass


class AddTransactionForm(BaseTransactionForm):
    date = ActualDateField(required=False)

    is_repeating = forms.BooleanField(required=False)

    frequency = DateDurationFormField(required=False)

    def clean(self):
        cleaned_data = super().clean()
        if cleaned_data['is_repeating']:
            if cleaned_data['frequency'] is None:
                self.add_error('frequency',
                    ValidationError('Frequency is required for repeating transactions.')
                )
            date = cleaned_data['date']
            if date is not None and date.day > 28:
                self.add_error('date',
                    ValidationError('Start Date cannot be on the 29th-31st of any month for '
                        + 'repeating transactions. Why? Because it made my maths easier.')
                )
        return cleaned_data


class UpdateRepeatingTxForm(BaseTransactionForm, IdentiferMixin):
    frequency = DateDurationFormField()


class UpdateBudgetForm(BaseBudgetForm, IdentiferMixin):
    spending_limit = forms.FloatField(min_value=0.00, max_value=1e15)

    category = LowerCaseCharField(max_length=127, min_length=1)

    frequency = DateDurationFormField()

