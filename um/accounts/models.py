from django.contrib.auth.models import AbstractBaseUser
from django.db.models.signals import pre_save
from django.db import models
from django.dispatch import receiver
from django.utils.timezone import datetime

from hashlib import sha256
from datetime import timedelta
from secrets import randbits

from .managers import AccountsManager

import logging
logger = logging.getLogger('proj')


class AccountsModel(AbstractBaseUser):

    id = models.AutoField(primary_key=True)

    username = models.CharField(max_length=31, unique=True)

    email_mask = models.CharField(max_length=511)

    email_hash = models.CharField(max_length=127, unique=True)

    created = models.DateField(auto_now_add=True)

    modified = models.DateTimeField(auto_now=True)

    is_active = models.BooleanField(default=False)

    USERNAME_FIELD = 'username'

    REQUIRED_FIELDS = ['email']

    objects = AccountsManager()

    def __str__(self):
        return self.username

    def set_email_attributes(self, email):
        self.email_mask = email[0:3] + '***' + email[email.find('@'):]
        self.email_hash = sha256(email.encode(encoding='UTF-8')).hexdigest()


def new_exp_date():
    return datetime.now() + timedelta(minutes=15)

def new_code():
    return randbits(63)


class AccountsValidationModel(models.Model):
    expiration = models.DateTimeField(default=new_exp_date)

    validation_code = models.BigIntegerField(default=new_code)

    account = models.OneToOneField(AccountsModel,
        on_delete=models.CASCADE
    )

    def set_new_validation_code(self):
        validate_code = new_code()
        expiration = new_exp_date()
    
    # An account_id cookie must have been set already, otherwise the link will not work
    def create_verification_link(self):
        return 'https://um.adoodleydo.dev/accounts/validate?code=' + str(self.validation_code)


# @receiver(pre_save, sender=AccountsModel, dispatch_uid='accounts_pre_save')
# def on_pre_save(sender, instance, *args, **kwargs):
#     logger.debug("nbfhvjdvbhvbhfdjv")
#     #instance.set_email_attributes()
