from enum import IntEnum


class Durations(IntEnum):
    NONE = 0
    DAILY = 1
    WEEKLY = 7
    SEMI_MONTHLY = 14
    MONTHLY = 30
    YEARLY = 365

    def __str__(self):
        match self:
            case Durations.DAILY: return 'Daily'
            case Durations.WEEKLY: return 'Weekly'
            case Durations.SEMI_MONTHLY: return 'Semi-Monthly'
            case Durations.MONTHLY: return 'Monthly'
            case Durations.YEARLY: return 'Yearly'
            case Durations.NONE: return 'None'

    def to_choice_tuple(self):
        return (self.value, str(self))
