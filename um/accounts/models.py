from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractBaseUser
from django.db.models.signals import pre_save
from django.db import models
from django.dispatch import receiver

from hashlib import sha256

import logging
logger = logging.getLogger('proj')

# Create your models here.


class AccountsManager(BaseUserManager):
    def create_user(self, username, email, password=None):
        new_account = AccountsModel()
        new_account.username = username
        new_account.set_email_attributes(email)
        new_account.set_password(password)
        return new_account


class AccountsModel(AbstractBaseUser):

    id = models.AutoField(primary_key=True)

    username = models.CharField(max_length=31, unique=True)

    email_mask = models.CharField(max_length=511)

    email_hash = models.CharField(max_length=127, unique=True)

    created = models.DateField(auto_now_add=True)

    modified = models.DateTimeField(auto_now=True)

    is_active = models.BooleanField(default=True)

    USERNAME_FIELD = 'username'

    REQUIRED_FIELDS = ['email']

    objects = AccountsManager()

    def __str__(self):
        return self.username

    def set_email_attributes(self, email):
        self.email_mask = email[0:3] + '***' + email[email.find('@'):]
        self.email_hash = sha256(email.encode(encoding='UTF-8')).hexdigest()


# @receiver(pre_save, sender=AccountsModel, dispatch_uid='accounts_pre_save')
# def on_pre_save(sender, instance, *args, **kwargs):
#     logger.debug("nbfhvjdvbhvbhfdjv")
#     #instance.set_email_attributes()
