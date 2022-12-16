from django import forms
from django.core.exceptions import ValidationError
from django.db import models

from .enums import Durations

import logging
logger = logging.getLogger('proj')


class DefaultInvalidChoiceFormField(forms.ChoiceField):
    def __init__(self, *args, **kwargs):
        if 'choices' not in kwargs:
            kwargs['choices'] = []
        kwargs['choices'].insert(0, (0, ''))
        super().__init__(*args, **kwargs)

    def clean(self, value):
        value = super().clean(value)
        try:
            value = int(value)
        except:
            raise ValidationError('Please select a valid option')
        logger.debug(value)
        if value == 0:
            if self.required:
                raise ValidationError('This field is required.')
            else:
                value = None
        return value


class DateDurationFormField(DefaultInvalidChoiceFormField):
    def __init__(self, *args, **kwargs):
        if 'choices' not in kwargs:
            kwargs['choices'] = [
                (Durations.DAILY.value, 'Daily'),
                (Durations.WEEKLY.value, 'Weekly'),
                (Durations.SEMI_MONTHLY.value, 'Semi-Monthly'),
                (Durations.MONTHLY.value, 'Monthly'),
                (Durations.YEARLY.value, 'Yearly'),
            ]
        super().__init__(*args, **kwargs)


class LowerCaseCharField(forms.CharField):
    def clean(self, value):
        return super().clean(value).lower()


class ActualDateField(forms.DateField):
    widget = forms.DateInput

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.widget.input_type = 'date'

