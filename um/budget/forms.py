from django import forms


class AddTransactionForm(forms.Form):
    specific_place = forms.CharField(max_length=255, min_length=1)

    category = forms.CharField(max_length=127, min_length=1)

    amount = forms.FloatField(min_value=0.00, max_value=1e15)
