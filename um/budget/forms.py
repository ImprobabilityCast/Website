from django import forms
from django.utils.timezone import now


class BaseBudgetForm(forms.Form):
    category = forms.CharField(max_length=127, min_length=1)

    frequency = forms.ChoiceField(choices=[
        ('', ''),
        (1, 'Daily'),
        (2, 'Weekly'),
        (3, 'Monthly'),
        (4, 'Yearly')
        ], required=False, initial=('', ''))

    class Meta:
        abstract = True


class AddTransactionForm(BaseBudgetForm):
    specific_place = forms.CharField(max_length=255, min_length=1)

    amount = forms.FloatField(min_value=0.00, max_value=1e15)
    
    date = forms.DateField(required=False, default=now)


class ModifyBudgetForm(BaseBudgetForm):
    spending_limit = forms.FloatField(min_value=0.00, max_value=1e15)

    budget_id = forms.IntegerField(initial=-1, widget=forms.HiddenInput())

