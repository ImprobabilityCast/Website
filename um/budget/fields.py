from django import forms
from django.core.exceptions import ValidationError
from django.db import models

from .enums import Durations


class DateDurationFormField(forms.ChoiceField):

    def __init__(self, *args, **kwargs):
        if 'choices' not in kwargs:
            kwargs['choices'] = [
                (Durations.NONE.value, ''),
                (Durations.DAILY.value, 'Daily'),
                (Durations.WEEKLY.value, 'Weekly'),
                (Durations.SEMI_MONTHLY.value, 'Semi-Monthly'),
                (Durations.MONTHLY.value, 'Monthly'),
                (Durations.YEARLY.value, 'Yearly'),
            ]
        super().__init__(*args, **kwargs)

    def clean(self, value):
        value = super().clean(value)
        try:
            value = Durations(int(value)).value
        except:
            raise ValidationError('Select a valid duration')
        if value == Durations.NONE.value:
            value = None
        return value


class LowerCaseCharField(forms.CharField):
    def clean(self, value):
        return super().clean(value).lower()

