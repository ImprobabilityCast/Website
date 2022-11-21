from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .forms import AccountCreationForm, AccountChangeForm
from .models import AccountsModel

# Register your models here.
class AccountsAdmin(UserAdmin):
    add_form = AccountCreationForm
    form = AccountChangeForm
    model = AccountsModel
    list_display = ["username", "email_mask"]
    list_filter = ["username", "email_mask"]
    filter_horizontal = []

admin.site.register(AccountsModel, AccountsAdmin)
