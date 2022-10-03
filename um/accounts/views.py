from django.shortcuts import redirect
from django.views.generic.edit import CreateView

from .forms import AccountCreationForm

import logging
logger = logging.getLogger("proj")

# Create your views here.

class SignUpView(CreateView):
    form_class = AccountCreationForm
    success_url = ''
    template_name = "registration/signup.html"
    http_method_names = ['get', 'post']

    def post(self, request):
        form = self.get_form()

        if form.is_valid():
            for key, value in form.cleaned_data.items():
                logger.debug(key + " => " + value)
            accountsModel = form.save(commit=False)
            accountsModel.set_email_attributes(form.cleaned_data["email"])
            accountsModel.save()
            return redirect('/')
        else:
            return super().post(request)
    
    # to access request from clean: https://stackoverflow.com/a/12064048/8335309
    def get_form_kwargs(self):
        kwargs = super(SignUpView, self).get_form_kwargs()
        kwargs.update({
            'request' : self.request
        })
        return kwargs

    def form_invalid(self, form):
        logger.debug("hhhhvhvhvh")
        return super().form_invalid(form)
