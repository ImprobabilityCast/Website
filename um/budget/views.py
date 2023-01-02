from django.conf import settings
from django.contrib.auth.mixins import LoginRequiredMixin
from django.core.paginator import Paginator
from django.db.models import Sum, F
from django.db.models.query import QuerySet
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache
from django.views.generic import TemplateView, ListView
from django.views.generic.base import View
from django.views.generic.edit import FormView, FormMixin

from datetime import date, timedelta
import json

from .models import SpecificPlacesModel, BudgetsModel, TransactionsModel
from .models import RepeatingTransactionsModel
from .enums import Durations
from .forms import AddTransactionForm, UpdateRepeatingTxForm, UpdateBudgetForm, DeleteDataForm
#from .forms import WhenMoneyFreeForm
from accounts.models import AccountsModel

import logging
logger = logging.getLogger('proj')


class TxFormMixin(FormMixin):
    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs['request'] = self.request
        return kwargs


class BaseModifyView(LoginRequiredMixin, FormView):
    class Meta:
        abstract = True

    http_method_names = ['post', ]

    def post_task(self, form, request):
        pass

    def post(self, request):
        form = self.get_form()
        has_errors = False
        self.data_id = -1

        if form.is_valid():
            try:
                if request.user.id != 1 or settings.DEBUG == True:
                    self.post_task(form, request)
                errors = {}
            except:
                errors = {'__all__': ['internal server error \\(^_^)/']}
                has_errors = True
        else:
            errors = form.errors
            has_errors = True
        
        return JsonResponse({
            'data_id': self.data_id,
            'has_errors': has_errors,
            'errors': errors,
        })


class AddTransactionView(BaseModifyView, TxFormMixin):
    form_class = AddTransactionForm

    def post_task(self, form, request):
        if form.cleaned_data['specific_place'] is None:
            form.cleaned_data['specific_place'] = ''
        placeModel, was_created = SpecificPlacesModel.objects.get_or_create(
            place = form.cleaned_data['specific_place']
        )
        budgetModel = BudgetsModel.objects.get(
            account = request.user,
            id = form.cleaned_data['category'],
            is_active = True
        )
        
        date = form.cleaned_data['date']
        
        if form.cleaned_data['is_repeating']:
            repeatingTransaction = RepeatingTransactionsModel()
            if date is not None:
                repeatingTransaction.start_date = date
            repeatingTransaction.frequency = form.cleaned_data['frequency']
            model = repeatingTransaction
        else:
            transaction = TransactionsModel()
            if date is not None:
                transaction.date = date
            model = transaction

        model.specific_place = placeModel
        model.budget = budgetModel
        model.amount = form.cleaned_data['amount']
        model.account = request.user
        model.save()
        self.data_id = model.id


class IndexView(LoginRequiredMixin, FormView):
    form_class = AddTransactionForm
    http_method_names = ['get', ]
    template_name = 'index.html'

    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs['request'] = self.request
        return kwargs


class DeleteDataView(BaseModifyView):
    class Meta:
        abstract = True

    form_class = DeleteDataForm

    def post_task(self, form, request):
        self.data_id = form.cleaned_data['data_id']
        self.model_class.objects.filter(
            id=self.data_id, account=request.user
        ).update(is_active=False, end_date = date.today())


class DeleteBudgetView(DeleteDataView):
    model_class = BudgetsModel


class DeleteRepeatingTxView(DeleteDataView):
    model_class = RepeatingTransactionsModel


class UpdateBudgetView(BaseModifyView):
    form_class = UpdateBudgetForm
    http_method_names = ['get', 'post']
    template_name = 'update_budget.frag.html'

    def post_task(self, form, request):
        self.data_id = form.cleaned_data['data_id']
        if self.data_id > 0:
            budget = BudgetsModel.objects.get(id=self.data_id, account=request.user)
            budget.category = form.cleaned_data['category']
        else:
            budget, was_created = BudgetsModel.objects.get_or_create(account=request.user,
                category=form.cleaned_data['category']
            )
            budget.is_active = True
            self.data_id = budget.id

        budget.frequency = form.cleaned_data['frequency']
        budget.spending_limit = form.cleaned_data['spending_limit']
        budget.save()

    def get(self, request):
        try:
            self.initial['data_id'] = int(request.GET['data_id'])
        except:
            pass
        return super().get(request)


@method_decorator(never_cache, name='get')
class JsonBudgetStatusView(LoginRequiredMixin, View):
    http_method_names = ['get', ]

    def get(self, request):
        raw_sql = '''SELECT
            budget_budgetsmodel.id as id,
            spending_limit,
            category,
            frequency,
            COALESCE(amount__sum, 0) as amount__sum
        FROM
        (
            SELECT budget_budgetsmodel.id as id, sum(amount) as amount__sum
            FROM budget_budgetsmodel
            LEFT JOIN budget_transactionsmodel
            ON budget_budgetsmodel.id=budget_transactionsmodel.budget_id
            WHERE budget_budgetsmodel.account_id=%s
            AND budget_budgetsmodel.is_active
            AND (
                    (frequency=30 AND date >= DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH))
                OR
                    (frequency=365 AND date >= DATE_SUB(CURRENT_DATE(), INTERVAL 1 YEAR))
                OR
                    (date >= DATE_SUB(CURRENT_DATE(), INTERVAL frequency DAY))
                )
            GROUP BY budget_budgetsmodel.id
        ) as inner_table
        RIGHT JOIN budget_budgetsmodel
        ON budget_budgetsmodel.id=inner_table.id
        WHERE budget_budgetsmodel.is_active
        AND budget_budgetsmodel.account_id=%s'''
        budget_tx_sums = BudgetsModel.objects.raw(raw_sql, [request.user.id, request.user.id])
        
        tday = date.today()
        repeating_transactions = list(RepeatingTransactionsModel.objects.filter(
            account=request.user,
            end_date__gte=tday,
            start_date__lte=tday,
            is_active=True
        ).order_by('budget_id').select_related('budget'))

        response = {'data' : {}}
        data_by_budget = response['data']

        for budget_tx in budget_tx_sums:
            budget_repeating_tx = [
                rep_tx for rep_tx in repeating_transactions if rep_tx.budget_id == budget_tx.id
            ]
            amount__sum = budget_tx.amount__sum
            for repeating in budget_repeating_tx:
                amount__sum += repeating.amount_for_period()
            
            duration = Durations(budget_tx.frequency)
            data_by_budget[budget_tx.id] = {
                'amount' : float(amount__sum),
                'spending_limit' : float(budget_tx.spending_limit),
                'category' : budget_tx.category,
                'frequency' : {
                    'name': str(duration),
                    'value': duration.value,
                },
            }
        
        return JsonResponse(response)


@method_decorator(never_cache, name='get')
class PagedListView(LoginRequiredMixin, ListView):
    class Meta:
        abstract = True

    http_method_names = ['get', ]
    paginate_by = 10

    def get_queryset(self):
        return self.model.objects.filter(account=self.request.user, is_active=True)
    
    def paginated_queryset(self):
        paginator = Paginator(self.get_queryset(), self.paginate_by)
        try:
            page_number = int(self.request.GET['page'])
            if page_number < 1 or page_number > paginator.num_pages:
                page_number = 1
        except:
            page_number = 1
        return paginator.get_page(page_number)

    def get(self, request):
        page = self.paginated_queryset()
        page.object_list = [self.create_json_from_model(item) for item in page]
        return render(request, self.template_name, {'page': page})


class ManageBudgetsView(PagedListView):
    model = BudgetsModel
    template_name = 'manage_budgets.html'

    def create_json_from_model(self, budgetModel):
        return {
            'category': budgetModel.category,
            'spending_limit': float(budgetModel.spending_limit),
            'frequency': budgetModel.frequency,
            'data_id': budgetModel.id,
        }


class ManageRepeatingTxView(PagedListView):
    model = RepeatingTransactionsModel
    template_name = 'manage_repeating_tx.html'

    def get_queryset(self):
        return super().get_queryset().select_related('budget', 'specific_place')

    def create_json_from_model(self, repeatingTxModel):
        return {
            'amount': repeatingTxModel.amount,
            'category': repeatingTxModel.budget.id,
            'specific_place': repeatingTxModel.specific_place.place,
            'frequency': repeatingTxModel.frequency,
            'data_id': repeatingTxModel.id,
        }


class UpdateRepeatingTxView(BaseModifyView, TxFormMixin):
    form_class = UpdateRepeatingTxForm
    http_method_names = ['get', 'post']
    template_name = 'update_repeating_tx.frag.html'

    def post_task(self, form, request):
        self.data_id = form.cleaned_data['data_id']
        if self.data_id > 0:
            place, was_created = SpecificPlacesModel.objects.get_or_create(
                place=form.cleaned_data['specific_place']
            )
            obj = RepeatingTransactionsModel.objects.get(id=self.data_id, account=request.user)
            obj.budget_id = form.cleaned_data['category']
            obj.specific_place = place
            obj.is_active = True
            obj.frequency = form.cleaned_data['frequency']
            obj.amount = form.cleaned_data['amount']
            obj.save()
        else:
            raise Exception('Invalid data id')


# class FreeWhenView(FormView, TxFormMixin):
#     http_method_names = ['get',]
#     form_class = WhenMoneyFreeForm

#     def get(self, request):
#         form = self.get_form()

#         if form.is_valid():
#             raw_sql = '''
#                 SELECT date, amount, spending_limit
#                 FROM budget_budgetsmodel
#                 LEFT JOIN budget_transactionsmodel
#                 ON budget_budgetsmodel.id=budget_transactionsmodel.budget_id
#                 WHERE budget_budgetsmodel.account_id=%s
#                 AND budget_budgetsmodel.id=%s
#                 AND budget_budgetsmodel.is_active
#                 AND (
#                         (frequency=30 AND date >= DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH)
#                             AND date <= DATE_ADD(CURRENT_DATE(), INTERVAL 1 MONTH)
#                         )
#                     OR
#                         (frequency=365 AND date >= DATE_SUB(CURRENT_DATE(), INTERVAL 1 YEAR)
#                             AND date <= DATE_ADD(CURRENT_DATE(), INTERVAL 1 YEAR)
#                         )
#                     OR
#                         (date >= DATE_SUB(CURRENT_DATE(), INTERVAL frequency DAY)
#                             AND date >= DATE_ADD(CURRENT_DATE(), INTERVAL frequency DAY)
#                         )
#                     )
#                 ORDER BY date'''
#             budget_id = form.cleaned_data['category']
#             tx_list = list(BudgetsModel.objects.raw(raw_sql, [request.user.id, budget_id]))

#             tday = date.today()
#             tx = RepeatingTransactionsModel.objects.filter(
#                 account=request.user,
#                 is_active=True,
#                 budget_id=budget_id
#             )
# select all tx in this period
# add to avail starting with newest
# until avail >= amount we looking for
# if not find, return 9999-12-31
