from django import forms
from django.core.exceptions import ValidationError
from django.utils.timezone import now

from .enums import Durations
from .fields import DateDurationFormField, LowerCaseCharField, ActualDateField
from .fields import DefaultInvalidChoiceFormField
from .models import BudgetsModel, SpecificPlacesModel

import logging
logger = logging.getLogger('proj')


class BaseBudgetForm(forms.Form):
    class Meta:
        abstract = True

    required_css_class = 'required'


class IdentiferMixin(forms.Form):
    class Meta:
        abstract = True

    data_id = forms.IntegerField(initial=-1, widget=forms.HiddenInput())


class BudgetTxBaseForm(BaseBudgetForm):
    def __init__(self, request, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.get_constraint_sql_from_request(request)
        budgets = BudgetsModel.objects.filter(account=request.user, is_active=True)
        cat = self.fields['category']
        cat.choices = cat.choices + [budget.get_choice_pair() for budget in budgets]
        cat.initial = self.category_filter
    
    category = DefaultInvalidChoiceFormField()

    def get_constraint_sql_from_request(self, request):
        try:
            # these are used in sql string concat, so check for sql injection if u change these lines
            self.category_filter = int(request.GET['category']) if 'category' in request.GET else None
        except:
            return True
        # these are always int or None, so no sql injection here
        self.what_budget = '' if self.category_filter == None else ' AND budget_id = ' + str(self.category_filter)
        return self.what_budget
    
    def get_form_url_params(self):
        result = list()
        if self.category_filter is not None:
            result.append('category=' + str(self.category_filter))
        return result


class BudgetChooserForm(BudgetTxBaseForm):
    def __init__(self, request, *args, **kwargs):
        super().__init__(request, *args, **kwargs)
        self.get_constraint_sql_from_request(request)
        places = SpecificPlacesModel.get_places_from_filter(request.user.id, budget_id=self.category_filter)
        spp = self.fields['specific_place']
        spp.choices = spp.choices + [p.get_choice_pair() for p in places]
        spp.initial = self.sp_place_filter

    specific_place = DefaultInvalidChoiceFormField()

    def get_constraint_sql_from_request(self, request):
        try:
            # these are used in sql string concat, so check for sql injection if u change these lines
            self.sp_place_filter = int(request.GET['specific_place']) if 'specific_place' in request.GET else None
        except:
            return True
        # these are always int or None, so no sql injection here
        parent = super().get_constraint_sql_from_request(request)
        if parent == True:
            return True
        self.what_sp = '' if self.sp_place_filter == None else ' AND specific_place_id = ' + str(self.sp_place_filter)
        return self.what_sp + parent

    def get_form_url_params(self):
        result = super().get_form_url_params()
        if self.sp_place_filter is not None:
            result.append('specific_place=' + str(self.sp_place_filter))
        return result


class BaseTransactionForm(BudgetTxBaseForm, IdentiferMixin):
    class Meta:
        abstract = True

    amount = forms.FloatField(min_value=0.00, max_value=1e15)

    specific_place = LowerCaseCharField(max_length=255, min_length=1, required=False)


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


class UpdateRepeatingTxForm(BaseTransactionForm):
    frequency = DateDurationFormField()


class UpdateBudgetForm(IdentiferMixin, BaseBudgetForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['category'].widget.attrs['placeholder'] = 'category'
        self.fields['spending_limit'].widget.attrs['placeholder'] = 'spending limit'

    spending_limit = forms.FloatField(min_value=0.00, max_value=1e15)

    category = LowerCaseCharField(max_length=127, min_length=1)

    frequency = DateDurationFormField()


# class WhenMoneyFreeForm(BaseTransactionForm):
#     pass

