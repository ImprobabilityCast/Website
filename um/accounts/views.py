from django.conf import settings
from django.contrib.auth import authenticate, login, logout, load_backend
from django.contrib.auth.mixins import UserPassesTestMixin
from django.contrib.auth.views import LoginView
from django.core.exceptions import PermissionDenied
from django.core.mail import send_mail
from django.shortcuts import redirect, render
from django.utils.encoding import iri_to_uri
from django.utils.http import url_has_allowed_host_and_scheme
from django.utils.timezone import datetime
from django.views.generic.base import View
from django.views.generic import TemplateView
from django.views.generic.edit import CreateView

from .forms import AccountCreationForm, AccountLoginForm
from .models import AccountsValidationModel

from re import findall

import logging
logger = logging.getLogger('proj')


class NotLoggedInMixin(UserPassesTestMixin):
    raise_exception = False

    def test_func(self):
        return not self.request.user.is_authenticated
    
    def handle_no_permission(self):
        if self.raise_exception:
            raise PermissionDenied()
        else:
            return redirect(settings.LOGIN_URL)
    
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

    def test_func(self):
        return super().test_func() or self.request.user.id == 1

    def post(self, request):
        form = self.get_form()

        if form.is_valid():
            accountsModel = form.save(commit=False)
            accountsModel.set_email_attributes(form.cleaned_data['email'])
            accountsModel.save()
            account_validation = AccountsValidationModel(account=accountsModel)
            account_validation.save()
            NewValidationCodeView.new_code(account_id=accountsModel.id,
                email=form.cleaned_data['email']
            )

            response = redirect('new_validation_code')
            request.session['account_id'] = accountsModel.id
            request.session['email'] = form.cleaned_data['email']
            return response
        else:
            context = {'form' : form, 'email': form.cleaned_data['email']}
            return render(request, self.template_name, context=context)
    
    # to access request from clean: https://stackoverflow.com/a/12064048/8335309
    def get_form_kwargs(self):
        kwargs = super(SignUpView, self).get_form_kwargs()
        kwargs.update({
            'request' : self.request
        })
        return kwargs


class NewValidationCodeView(TemplateView):
    template_name = 'registration/account_verification.html'

    @classmethod
    def new_code(cls, account_id, email):
        validation = AccountsValidationModel.objects.get(account_id=account_id)
        validation.set_new_validation_code()

        num_msgs_sent = send_mail(
            subject='ADooldeyDo Account Verification',
            message='Follow this totally legit link to verify your new account: ' +
                validation.create_verification_link(),
            from_email=None,
            recipient_list=[email],
            fail_silently=True
        )

        if num_msgs_sent == 0:
            logger.debug('email failed to send')


    def post(self, request):
        try:
            # generate new code & email
            account_id = request.session['account_id']
            email = request.session['email']
            NewValidationCodeView.new_code(account_id=account_id,
                email=email
            )

            # set 'tries' cookie to give user feedback that yes, another email has been sent
            cookie_name = 'tries'
            cookie_value = 0
            try:
                cookie_value = int(request.COOKIES[cookie_name])
            except:
                pass
            response = redirect('new_validation_code')
            response.set_cookie(cookie_name, value=cookie_value+1,
                samesite='Strict', secure=True, max_age=15 * 60 # 15 mins
            )
        except: # something went wrong, maybe account_id cookie was not sent
            response = redirect('validation_expired')
        return response


class NewAccountValidationView(View):
    def get(self, request):
        try:
            code = int(request.GET['code'])
            account_id = request.session['account_id']

            verification = AccountsValidationModel.objects.get(
                validation_code=code,
                account_id=account_id,
                expiration__gt=datetime.now()
            )
            verification.account.is_active = True
            verification.account.save()
            verification.expiration = datetime.now()
            verification.save()

            # https://stackoverflow.com/a/5843944/8335309
            for backend in settings.AUTHENTICATION_BACKENDS:
                if verification.account == load_backend(backend).get_user(user_id=account_id):
                    verification.account.backend = backend
                    login(request, verification.account)
                    break
            response = redirect(settings.LOGIN_REDIRECT_URL)
            try:
                del request.session['account_id']
                del request.session['email']
            except:
                logger.debug("session vars did not exist")
        except:
            response = redirect('validation_expired')

        return response


class ValidationExpiredView(TemplateView):
    http_method_names = ['get', ]
    template_name = 'registration/verification_expired.html'


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
            if url_has_allowed_host_and_scheme(url, ['*.127.0.0.1', 'localhost:444']):
                return redirect(url)
        return redirect(settings.LOGIN_REDIRECT_URL)


class LogoutView(TemplateView):
    template_name = 'registration/logout.html'
    http_method_names = ['get', ]

    def get(self, request):
        logout(request)
        return super().get(request)

