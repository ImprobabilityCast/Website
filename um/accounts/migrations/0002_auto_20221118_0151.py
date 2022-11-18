# Generated by Django 4.0.7 on 2022-11-18 01:51

from django.db import migrations

# This will break if I ever change the AccountsModel,
# but where else can I get something like the set_password method
from accounts.models import AccountsModel

def create_demo_user(apps, schema_editor):
    #AccountsModel = apps.get_model('accounts', 'AccountsModel')
    demo_user = AccountsModel.objects.create_user(
        username='demo', email='demo@example.com', password='password'
    )
    demo_user.save()


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0003_alter_accountsmodel_managers'),
    ]

    operations = [
        migrations.RunPython(create_demo_user)
    ]
