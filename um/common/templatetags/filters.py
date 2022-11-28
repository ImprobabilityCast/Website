from django import template


register = template.Library()

@register.filter(name='addcssclass')
def addcssclass(value, arg):
    return value.as_widget(attrs={'class': arg})
