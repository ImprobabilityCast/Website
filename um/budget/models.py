from django.contrib.auth.models import AbstractUser
from django.core.validators import MinLengthValidator
from django.db import models
from accounts.models import AccountsModel

# Create your models here.

class BaseModel(models.Model):
    class Meta:
        abstract = True

    created = models.DateField(auto_now_add=True)

    modified = models.DateTimeField(auto_now=True)

    is_active = models.BooleanField(default=True)


class TransactionCategoriesModel(BaseModel):

    category = models.CharField(max_length=127, unique=True, validators=[MinLengthValidator(1)])

    def __str__(self):
        return self.kind


class SpecificPlacesModel(BaseModel):

    place = models.CharField(max_length=255, unique=True, validators=[MinLengthValidator(1)])

    def __str__(self):
        return self.place


class TransactionsModel(BaseModel):

    account = models.ForeignKey(AccountsModel,
        on_delete=models.CASCADE
    )

    category = models.ForeignKey(TransactionCategoriesModel,
        on_delete=models.CASCADE
    )

    place = models.ForeignKey(SpecificPlacesModel,
        on_delete=models.CASCADE
    )

    amount = models.DecimalField(max_digits=15,
        decimal_places=2
    )

    date = models.DateField(auto_now=True)

    def __str__(self):
        return '({}, {}, {}, {}, {})'.format(
            self.account.username,
            self.kind,
            self.place,
            self.amount,
            self.date)

    class Meta:
        ordering = ['date']
