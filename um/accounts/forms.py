from django import forms
from django.contrib.auth.forms import UserChangeForm, UserCreationForm, AuthenticationForm

from .models import AccountsModel

import logging
logger = logging.getLogger('proj')

class AccountCreationForm(UserCreationForm):

    class Meta:
        model = AccountsModel
        fields = ('username', )

    def __init__(self, request=None, *args, **kwargs):
        self.request = request
        super().__init__(*args, **kwargs)

    def clean(self, *args, **kwargs):
        cleaned_data = super().clean(*args, **kwargs)
        email_field = forms.EmailField()
        cleaned_data['email'] = email_field.clean(self.request.POST['email'])
        return cleaned_data


class AccountChangeForm(UserChangeForm):

    class Meta:
        model = AccountsModel
        fields = ('username',)

class AccountLoginForm(AuthenticationForm):
    pass
