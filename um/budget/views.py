from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import render, redirect
from django.views.generic import TemplateView
from django.views.generic.edit import FormView

from .models import SpecificPlacesModel, TransactionCategoriesModel, TransactionsModel
from .models import TimeFrequenciesModel, RepeatingTransactionsModel
from .forms import AddTransactionForm
from accounts.models import AccountsModel

import logging
logger = logging.getLogger('proj')

class IndexView(LoginRequiredMixin, TemplateView):
    template_name = 'index.html'


class AddTransactionView(LoginRequiredMixin, FormView):
    form_class = AddTransactionForm
    http_method_names = ['get', 'post']
    template_name = 'add_transaction.html'

    def post(self, request):
        form = self.get_form()

        if form.is_valid():
            transactionsModel = TransactionsModel()

            placeModel, was_created = SpecificPlacesModel.objects.get_or_create(
                place = form.cleaned_data['specific_place'].lower()
            )
            transactionsModel.place = placeModel

            categoryModel, was_created = TransactionCategoriesModel.objects.get_or_create(
                category = form.cleaned_data['category'].lower()
            )
            transactionsModel.category = categoryModel

            transactionsModel.amount = form.cleaned_data['amount']
            date = form.cleaned_data['date']
            if date is not None:
                transactionsModel.date = date
            transactionsModel.account = request.user

            transactionsModel.save()

            frequency = form.cleaned_data['frequency']
            if len(frequency) > 0: # empty string signifies that this is not a repeating transaction
                logger.debug('here we are bois')
                repeatingTransaction = RepeatingTransactionsModel()
                frequencyModel = TimeFrequenciesModel.objects.get(id=frequency)
                repeatingTransaction.frequency = frequencyModel
                repeatingTransaction.transaction = transactionsModel
                repeatingTransaction.save()
            
            return redirect('/budget')
        else:
            context = {'form' : form}
            return render(request, self.template_name, context=context)

