from enum import Enum


class Durations(Enum):
    Daily = 1
    Weekly = 2
    BiWeekly = 3
    Monthly = 4
    Yearly = 5
    Custom = 6

    def to_choice_two_tuple(self):
        return (self.value, self.name)
