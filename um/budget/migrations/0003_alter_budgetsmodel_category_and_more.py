# Generated by Django 4.0.8 on 2023-01-01 22:02

from django.conf import settings
import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('budget', '0002_auto_20221116_0238'),
    ]

    operations = [
        migrations.AlterField(
            model_name='budgetsmodel',
            name='category',
            field=models.CharField(max_length=127, validators=[django.core.validators.MinLengthValidator(1)]),
        ),
        migrations.AlterUniqueTogether(
            name='budgetsmodel',
            unique_together={('account', 'category')},
        ),
    ]
