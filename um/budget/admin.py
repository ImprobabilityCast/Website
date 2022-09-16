from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .forms import AccountCreationForm, AccountChangeForm
from .models import AccountsModel, SpendingKindsModel, SpecificPlacesModel, SpendingModel

# Register your models here.
class AccountsAdmin(UserAdmin):
    add_form = AccountCreationForm
    form = AccountChangeForm
    model = AccountsModel
    list_display = ["email_mask", "username",]

admin.site.register(AccountsModel, AccountsAdmin)

admin.site.register(SpendingKindsModel)
admin.site.register(SpendingModel)
admin.site.register(SpecificPlacesModel)
