from django import forms
from django.db import models

import datetime

from .enums import Durations


class DateDuration:

    def __init__(self, years, months, days):
        self.years = years
        self.months = months
        self.days = days
    
    def __str__(self):
        return str(self.years) + '-' + str(self.months) + '-' + str(self.days)
    
    @classmethod
    def from_str(cls, value):
        arr = value.split('-')
        return DateDuration(arr[0], arr[1], arr[2])
    
    @classmethod
    def from_duration(cls, enum_value):
        if isinstance(enum_value, Durations):
            match enum_value:
                case Durations.Daily: return DateDuration(0, 0, 1)
                case Durations.Weekly: return DateDuration(0, 0, 7)
                case Durations.BiWeekly: return DateDuration(0, 0, 14)
                case Durations.Monthly: return DateDuration(0, 1, 0)
                case Durations.Yearly: return DateDuration(1, 0, 0)
                case _: raise NotImplementedError()
        else:
            if isinstance(enum_value, str):
                enum_value = int(enum_value)
            return DateDuration.from_duration(Durations(enum_value))



class DateDurationFormField(forms.ChoiceField):

    def __init__(self, *args, **kwargs):
        if 'choices' not in kwargs:
            kwargs['choices'] = [
                ('', ''),
                Durations.Daily.to_choice_two_tuple(),
                Durations.Weekly.to_choice_two_tuple(),
                Durations.BiWeekly.to_choice_two_tuple(),
                Durations.Monthly.to_choice_two_tuple(),
                Durations.Yearly.to_choice_two_tuple()
            ]
        super().__init__(*args, **kwargs)


# class DateDurationFormField(forms.Field):
#     widget = forms.MultiWidget(widgets=[
#         forms.Select(choices=[
#             ('', ''),
#             Durations.DAILY.to_choice_two_tuple(),
#             Durations.WEEKLY.to_choice_two_tuple(),
#             Durations.MONTHLY.to_choice_two_tuple(),
#             Durations.YEARLY.to_choice_two_tuple(),
#             Durations.CUSTOM.to_choice_two_tuple()
#         ]),
#         forms.NumberInput(),
#         forms.NumberInput(),
#         forms.NumberInput()
#     ])

#     def decompress(self, value):
#         if value:
#             # do things


class DateDurationField(models.CharField):

    def __init__(self, *args, **kwargs):
        if 'max_length' not in kwargs:
            kwargs['max_length'] = 32
        if 'default' in kwargs:
            kwargs['default'] = str(kwargs['default'])
        super().__init__(*args, **kwargs)
    
    def to_python(self, obj):
        return DateDuration.from_str(obj)

    def get_prep_value(self, value):
        return str(value)
    
    def from_db_value(self, value, expression, connection):
        return DateDuration.from_str(value)

    def value_to_string(self, obj):
        return str(obj)

    # def deconstruct(self):
    #     name, path, args, kwargs = super().deconstruct()
    #     return name, path, args, kwargs

