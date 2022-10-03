from django.contrib.auth.models import AbstractUser
from django.db import models
from accounts.models import AccountsModel

# Create your models here.

class BaseModel(models.Model):

    created = models.DateField(auto_now_add=True)

    modified = models.DateTimeField(auto_now=True)

    active = models.BooleanField(default=True)


class SpendingKindsModel(BaseModel):

    kind = models.CharField(max_length=127, unique=True)

    def __str__(self):
        return self.kind


class SpecificPlacesModel(BaseModel):

    place = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.place


class SpendingModel(BaseModel):

    account = models.ForeignKey(AccountsModel,
        on_delete=models.CASCADE
    )

    kind = models.ForeignKey(SpendingKindsModel,
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
