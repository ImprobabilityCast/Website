from django import forms
from django.contrib.auth.forms import UserChangeForm, UserCreationForm

from .models import AccountsModel

class AccountCreationForm(UserCreationForm):

    class Meta:
        model = AccountsModel
        fields = ('username', 'email')


class AccountChangeForm(UserChangeForm):

    class Meta:
        model = AccountsModel
        fields = ('username', 'email')
