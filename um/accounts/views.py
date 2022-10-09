from django.contrib.auth import authenticate, login
from django.contrib.auth.views import LoginView
from django.shortcuts import redirect, render
from django.views.generic.edit import CreateView

from .forms import AccountCreationForm, AccountLoginForm

import logging
logger = logging.getLogger('proj')

# Create your views here.

class SignUpView(CreateView):
    form_class = AccountCreationForm
    success_url = ''
    template_name = 'registration/signup.html'
    http_method_names = ['get', 'post']
    error_css_class = 'error'

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
    
    def get(self, request):
        if request.user.is_authenticated:
            return redirect('/')
        else:
            return super().get(request)
    
    # to access request from clean: https://stackoverflow.com/a/12064048/8335309
    def get_form_kwargs(self):
        kwargs = super(SignUpView, self).get_form_kwargs()
        kwargs.update({
            'request' : self.request
        })
        return kwargs

    def form_invalid(self, form):
        logger.debug('hhhhvhvhvh')
        return super().form_invalid(form)


class LoginView(LoginView):
    authentication_form = AccountLoginForm

    def post(self, request):
        form = self.get_form()

        if form.is_valid():
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']
            my_sweet_user = authenticate(request, username=username, password=password)
            if my_sweet_user is not None:
                login(request, my_sweet_user)
                return redirect('/')
        
        context = {'form' : form}
        return render(request, self.template_name, context=context)

    def get(self, request):
        if request.user.is_authenticated:
            return redirect('/')
        else:
            return super().get(request)

