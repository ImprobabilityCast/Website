from django.contrib.auth.backends import BaseBackend

from .models import AccountsModel


class NoAuthBackend(BaseBackend):
    def authenticate(self, request):
        pass

    def get_user(self, user_id):
        try:
            return AccountsModel.objects.get(pk=user_id)
        except:
            return None
