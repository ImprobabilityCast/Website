from django.contrib.auth.mixins import LoginRequiredMixin
from django.db.models import Sum
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.views.generic import TemplateView, ListView
from django.views.generic.base import View
from django.views.generic.edit import FormView

from datetime import date, timedelta
import json

from .models import SpecificPlacesModel, BudgetsModel, TransactionsModel
from .models import RepeatingTransactionsModel
from .fields import DateDuration
from .forms import AddTransactionForm, UpdateBudgetForm, DeleteBudgetForm
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
            logger.debug(form.cleaned_data)
            logger.debug(request.POST)

            if form.cleaned_data['specific_place'] is None:
                form.cleaned_data['specific_place'] = ''

            placeModel, was_created = SpecificPlacesModel.objects.get_or_create(
                place = form.cleaned_data['specific_place'].lower()
            )
            transactionsModel.place = placeModel

            budgetModel, was_created = BudgetsModel.objects.get_or_create(
                account = request.user,
                category = form.cleaned_data['category'].lower(),
                is_active = True
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
                repeatingTransaction.frequency = DateDuration.from_duration(frequency)
                repeatingTransaction.transaction = transactionsModel
                
                end_date = form.cleaned_data['end_date']
                if end_date is not None:
                    repeatingTransaction.end_date = end_date
                
                repeatingTransaction.save()
            
            return redirect('/budget')
        else:
            context = {'form' : form}
            return render(request, self.template_name, context=context)


class BaseModifyBudgetView(LoginRequiredMixin, FormView):

    def post_task(self, form, request):
        pass

    def post(self, request):
        form = self.get_form()
        has_errors = False
        self.budget_id = -1

        if form.is_valid():
            self.post_task(form, request)
        else:
            has_errors = True
        
        return JsonResponse({
            'budget_id': self.budget_id,
            'has_errors': has_errors,
            'errors': form.errors,
        })

    class Meta:
        abstract = True


class DeleteBudgetView(BaseModifyBudgetView):
    form_class = DeleteBudgetForm
    http_method_names = ['post', ]

    def post_task(self, form, request):
        self.budget_id = form.cleaned_data['budget_id']
        budget = BudgetsModel.objects.get(id=self.budget_id, account=request.user)
        budget.is_active = False
        budget.end_date = date.today()
        budget.save()


class UpdateBudgetView(BaseModifyBudgetView):
    form_class = UpdateBudgetForm
    http_method_names = ['get', 'post']
    template_name = 'update_budget.frag.html'

    def post_task(self, form, request):
        self.budget_id = form.cleaned_data['budget_id']
        if self.budget_id > 0:
            budget = BudgetsModel.objects.get(id=self.budget_id, account=request.user)
        else:
            budget = BudgetsModel()
            budget.account = request.user

        budget.category = form.cleaned_data['category']
        budget.frequency = form.cleaned_data['frequency']
        budget.spending_limit = form.cleaned_data['spending_limit']
        budget.save()
    
    def get(self, request):
        id = -1
        try:
            id = int(request.GET['budget_id'])
        except:
            pass
        finally:
            self.initial['budget_id'] = id
        return super().get(request)


class ManageBudgetsView(LoginRequiredMixin, ListView):
    model = BudgetsModel
    http_method_names = ['get', ]
    template_name = 'manage_budgets.html'

    @classmethod
    def create_form_from_model(cls, budgetModel):
        form = UpdateBudgetForm(initial={
            'category': budgetModel.category,
            'spending_limit': budgetModel.spending_limit,
            'frequency': budgetModel.frequency.to_duration().to_choice_two_tuple(),
            'budget_id': budgetModel.id,
        })
        return form

    def get_queryset(self):
        queryset = self.model.objects.filter(account=self.request.user, is_active=True)
        result_list = [ ManageBudgetsView.create_form_from_model(item) for item in queryset]
        return result_list


class JsonRawHistoryView(LoginRequiredMixin, View):
    
    def get(self, request):
        oldest_date = date.today() - timedelta(days=30)
        query = TransactionsModel.objects.filter(date__gt=oldest_date)

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


class JsonBudgetStatusView(LoginRequiredMixin, View):
    http_method_names = ['get', ]

    def get(self, request):
        tday = date.today()

        budgets = BudgetsModel.objects.filter(account=request.user,
            is_active=True,
        )
        query = TransactionsModel.objects.filter(account=request.user,
            date__gte=tday.replace(year = tday.year - 1),
            date__lte=tday
        ).order_by('budget_id')

        response = {'data' : {}}
        data_by_budget = response['data']

        for budget in budgets:
            sub_query = query.filter(
                budget_id=budget.id,
                date__gte=budget.frequency.get_date_at_offset(tday, reverse=True),
                date__lte=tday
            )
            amount_sum = 0 if sub_query.count() == 0 else float(sub_query.aggregate(Sum('amount'))['amount__sum'])
            data_by_budget[budget.id] = {
                'amount' : amount_sum,
                'spending_limit' : float(budget.spending_limit),
                'category' : budget.category,
            }
        
        return JsonResponse(response)


class BudgetStatusView(LoginRequiredMixin, TemplateView):
    template_name = 'budget.html'


class TransactionHistoryListView(LoginRequiredMixin, ListView):
    template_name = 'transaction_history.html'


class JsonTransactionHistoryView(LoginRequiredMixin, View):
    pass

