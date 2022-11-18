from django.contrib.auth.base_user import BaseUserManager


class AccountsManager(BaseUserManager):
    use_in_migrations = True

    def create_user(self, username, email, password=None, **kwargs):
        new_account = self.model()
        new_account.username = username
        new_account.set_email_attributes(email)
        new_account.set_password(password)
        return new_account
    
    def create_superuser(self, username, email, password=None, **kwargs):
        return self.create_user(username, email, password)
