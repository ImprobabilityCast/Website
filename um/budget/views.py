from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.views.generic import TemplateView, ListView
from django.views.generic.base import View
from django.views.generic.edit import FormView

from datetime import date, timedelta
import json

from .models import SpecificPlacesModel, BudgetsModel, TransactionsModel
from .models import TimeFrequenciesModel, RepeatingTransactionsModel, BudgetsModel
from .forms import AddTransactionForm, ModifyBudgetForm
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

            budgetModel, was_created = BudgetsModel.objects.get_or_create(
                account = request.user,
                category = form.cleaned_data['category'].lower(),
                defaults = {'frequency': TimeFrequenciesModel.objects.get(frequency='Monthly')}
            )
            budgetModel.is_active = True
            transactionsModel.budget = budgetModel

            transactionsModel.amount = form.cleaned_data['amount']
            date = form.cleaned_data['date']
            if date is not None:
                transactionsModel.date = date
            transactionsModel.account = request.user

            transactionsModel.save()

            frequency = form.cleaned_data['frequency']
            if len(frequency) > 0: # empty string signifies that this is not a repeating transaction
                repeatingTransaction = RepeatingTransactionsModel()
                frequencyModel = TimeFrequenciesModel.objects.get(id=frequency)
                repeatingTransaction.frequency = frequencyModel
                repeatingTransaction.transaction = transactionsModel
                
                end_date = form.cleaned_data['end_date']
                if end_date is not None:
                    repeatingTransaction.end_date = end_date
                
                repeatingTransaction.save()
            
            return redirect('/budget')
        else:
            context = {'form' : form}
            return render(request, self.template_name, context=context)


class ModifyBudgetView(LoginRequiredMixin, FormView):
    form_class = ModifyBudgetForm
    http_method_names = ['get', 'post']
    template_name = 'modify_budget.html'

    def post(self, request):
        form = self.get_form()


class ListBudgetView(LoginRequiredMixin, ListView):
    model = BudgetsModel
    http_method_names = ['get', ]
    template_name = 'list_budget.html'

    @classmethod
    def create_form_from_model(cls, budgetModel):
        modifyBudgetForm = ModifyBudgetForm(initial={
            'category': budgetModel.category,
            'spending_limit': budgetModel.spending_limit,
            'frequency': (budgetModel.frequency_id, budgetModel.frequency.frequency),
            'budget_id': budgetModel.id,
        })
        return modifyBudgetForm

    def get_queryset(self):
        queryset = self.model.objects.filter(account=self.request.user, is_active=True)
        result_list = [ ListBudgetView.create_form_from_model(item) for item in queryset]
        return result_list


# graph / chart / data view
class JsonTransactionAPIView(LoginRequiredMixin, View):
    
    def get(self, request):
        oldest_date = date.today() - timedelta(days=30)
        query = TransactionsModel.objects.filter(created__gt=oldest_date)

        response = {'data_by_category' : {}, 'category_mapping' : {}}
        category_mapping = response['category_mapping']
        data_by_budget = response['data_by_category']

        for q in query:
            if q.budget_id not in data_by_budget:
                data_by_budget[q.budget_id] = {'category' : q.budget.category, 'data' : []}
                category_mapping[q.budget_id] = q.budget.category
            
            data_by_budget[q.budget_id]['data'].append({
                'amount' : float(q.amount),
                'date' : str(q.date),
                'place' : q.place.place
            })
        
        return JsonResponse(response)


class TransactionHistoryGraphView(LoginRequiredMixin, TemplateView):
    template_name = 'history.html'

