from django.contrib.auth import authenticate, login
from django.contrib.auth.mixins import UserPassesTestMixin
from django.contrib.auth.views import LoginView
from django.core.exceptions import PermissionDenied
from django.shortcuts import redirect, render
from django.views.generic.edit import CreateView

from .forms import AccountCreationForm, AccountLoginForm

import logging
logger = logging.getLogger('proj')


class NotLoggedInMixin(UserPassesTestMixin):
    raise_exception = False
    login_url = '/'
    def test_func(self):
        return not self.request.user.is_authenticated
    
    def handle_no_permission(self):
        if self.raise_exception:
            raise PermissionDenied()
        else:
            return redirect(self.login_url)


class SignUpView(NotLoggedInMixin, CreateView):
    form_class = AccountCreationForm
    http_method_names = ['get', 'post']

    def post(self, request):
        form = self.get_form()

        if form.is_valid():
            accountsModel = form.save(commit=False)
            accountsModel.set_email_attributes(form.cleaned_data['email'])
            accountsModel.save()
            return redirect('/accounts/login')
        else:
            context = {'form' : form}
            return render(request, self.template_name, context=context)
    
    # to access request from clean: https://stackoverflow.com/a/12064048/8335309
    def get_form_kwargs(self):
        kwargs = super(SignUpView, self).get_form_kwargs()
        kwargs.update({
            'request' : self.request
        })
        return kwargs


class LoginView(NotLoggedInMixin, LoginView):
    authentication_form = AccountLoginForm

    def post(self, request):
        form = self.get_form()

        if form.is_valid():
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']
            my_sweet_user = authenticate(request, username=username, password=password)
            if my_sweet_user is not None:
                login(request, my_sweet_user)
                return super().post(request)
        
        context = {'form' : form}
        return render(request, self.template_name, context=context)

