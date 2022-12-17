from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.mixins import UserPassesTestMixin
from django.contrib.auth.views import LoginView
from django.core.exceptions import PermissionDenied
from django.shortcuts import redirect, render
from django.utils.encoding import iri_to_uri
from django.utils.http import url_has_allowed_host_and_scheme
from django.views.generic.base import View
from django.views.generic import TemplateView
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
    
    @classmethod
    def try_login(cls, request, username, password):
        my_sweet_user = authenticate(request, username=username, password=password)
        if my_sweet_user is not None:
            login(request, my_sweet_user)
            return True
        else:
            return False


class SignUpView(NotLoggedInMixin, CreateView):
    form_class = AccountCreationForm
    template_name = 'registration/signup.html'
    http_method_names = ['get', 'post']

    def post(self, request):
        form = self.get_form()

        if form.is_valid():
            accountsModel = form.save(commit=False)
            accountsModel.set_email_attributes(form.cleaned_data['email'])
            accountsModel.save()
            NotLoggedInMixin.try_login(request,
                form.cleaned_data['username'],
                form.cleaned_data['password1']
            )
            return redirect('/')
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
            if NotLoggedInMixin.try_login(request, username, password):
                return super().post(request)
        
        context = {'form' : form}
        return render(request, self.template_name, context=context)


class LoginDemoView(View):
    def get(self, request):
        logout(request)
        if NotLoggedInMixin.try_login(request, 'demo', 'password'):
            url = iri_to_uri(request.GET['next'])
            if url_has_allowed_host_and_scheme(url, ['*.adoodleydo.dev', 'localhost']):
                return redirect(url)
        return redirect('/')


class LogoutView(TemplateView):
    template_name = 'registration/logout.html'
    http_method_names = ['get', ]

    def get(self, request):
        logout(request)
        return super().get(request)

