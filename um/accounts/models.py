from django.contrib.auth.models import AbstractBaseUser
from django.db.models.signals import pre_save
from django.db import models
from django.dispatch import receiver

from hashlib import sha256

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
