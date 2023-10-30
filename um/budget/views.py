from django.conf import settings
from django.contrib.auth.mixins import LoginRequiredMixin
from django.core.paginator import Paginator
from django.db.models import ExpressionWrapper, F, Sum, Value, IntegerField
from django.db.models.query import QuerySet
from django.http import JsonResponse, HttpResponseBadRequest
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
from .forms import AddTransactionForm, UpdateRepeatingTxForm, UpdateBudgetForm, DeleteDataForm, BudgetChooserForm
#from .forms import WhenMoneyFreeForm
from accounts.models import AccountsModel

import traceback
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
        status_code = 201
        self.data_id = -1

        if form.is_valid():
            try:
                if request.user.id != 1 or settings.DEBUG == True:
                    self.post_task(form, request)
                errors = {}
            except Exception as e:
                logger.debug(traceback.format_exc())
                errors = {'__all__': ['internal server error \\(^_^)/']}
                has_errors = True
                status_code = 500
        else:
            errors = form.errors
            has_errors = True
            status_code = 400
        
        response = JsonResponse({
            'data_id': self.data_id,
            'has_errors': has_errors,
            'errors': errors,
        })
        response.status_code = status_code
        return response


class AddTransactionView(BaseModifyView, TxFormMixin):
    form_class = AddTransactionForm
    template_name = 'update_tx.frag.html'
    http_method_names = ['get', 'post']

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
        self.data_id = form.cleaned_data['data_id']
        
        if form.cleaned_data['is_repeating']:
            repeatingTransaction = RepeatingTransactionsModel.objects.get(
                id = self.data_id
            ) if self.data_id > 0 else RepeatingTransactionsModel()
            if date is not None:
                repeatingTransaction.start_date = date
            repeatingTransaction.frequency = form.cleaned_data['frequency']
            model = repeatingTransaction
        else:
            transaction = TransactionsModel.objects.get(
                id = self.data_id
            ) if self.data_id > 0 else TransactionsModel()
            if date is not None:
                transaction.date = date
            model = transaction

        model.specific_place = placeModel
        model.budget = budgetModel
        model.amount = form.cleaned_data['amount']
        model.account = request.user
        model.save()
        self.data_id = model.id

    def get(self, request):
        try:
            self.initial['data_id'] = int(request.GET['data_id'])
        except:
            pass
        return super().get(request)


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

    def get_update_kwargs(self):
        return {'is_active': False}

    def post_task(self, form, request):
        self.data_id = form.cleaned_data['data_id']
        return self.model_class.objects.filter(
            id=self.data_id, account=request.user
        ).update(**self.get_update_kwargs())


class DeleteWithEndDateView(DeleteDataView):
    def get_update_kwargs(self):
        kwargs = super().get_update_kwargs();
        kwargs.update({
            'end_date': date.today()
        })
        return kwargs


class DeleteBudgetView(DeleteWithEndDateView):
    model_class = BudgetsModel


class EndRepeatingTxView(BaseModifyView):
    model_class = RepeatingTransactionsModel
    form_class = DeleteDataForm

    def get_update_kwargs(self):
        return {
            'end_date': date.today()
        }

    def post_task(self, form, request):
        self.data_id = form.cleaned_data['data_id']
        return self.model_class.objects.filter(
            id=self.data_id, account=request.user
        ).update(**self.get_update_kwargs())


class DeleteTransactionView(DeleteDataView):
    model_class = TransactionsModel


@method_decorator(never_cache, name='get')
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
        return super().get_queryset().filter(end_date__gt=date.today()).select_related('specific_place')

    def create_json_from_model(self, repeatingTxModel):
        return {
            'amount': repeatingTxModel.amount,
            'category': repeatingTxModel.budget_id,
            'specific_place': repeatingTxModel.specific_place.place,
            'frequency': repeatingTxModel.frequency,
            'data_id': repeatingTxModel.id,
        }


@method_decorator(never_cache, name='get')
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


@method_decorator(never_cache, name='get')
class ManageTxView(PagedListView):
    model = TransactionsModel
    template_name = 'manage_tx.html'

    def get_queryset(self):
        return super().get_queryset().order_by('date').reverse().select_related('specific_place')

    def create_json_from_model(self, txModel):
        return {
            'category': txModel.budget_id,
            'date': txModel.date,
            'specific_place': txModel.specific_place.place,
            'amount': txModel.amount,
            'data_id': txModel.id,
        }


@method_decorator(never_cache, name='get')
class TxAggregateSummary(LoginRequiredMixin, View):
    template_name = ''

    def get(self, request):
        tday = date.today()
        a_year_ago = date(year=tday.year - 1, month=tday.month, day=tday.day)
        try:
            start_date = date.fromisoformat(request.GET['from']) if 'from' in request.GET else a_year_ago
            end_date = date.fromisoformat(request.GET['to']) if 'to' in request.GET else tday
        except:
            return HttpResponseBadRequest()

        raw_sql = '''
            SELECT budget_budgetsmodel.id as id, budget_budgetsmodel.category, spending_limit, COALESCE(sum(amount), 0) as amount__sum
            FROM budget_budgetsmodel
            LEFT JOIN (
                SELECT budget_id, amount FROM budget_transactionsmodel
                WHERE budget_transactionsmodel.is_active
                AND budget_transactionsmodel.account_id=%s
                AND budget_transactionsmodel.date >= %s
                AND budget_transactionsmodel.date <= %s
            ) AS filtered_tx
            ON budget_budgetsmodel.id=filtered_tx.budget_id
            WHERE budget_budgetsmodel.account_id=%s
            AND budget_budgetsmodel.is_active
            GROUP BY budget_budgetsmodel.id
        '''
        budget_tx_sums = BudgetsModel.objects.raw(raw_sql, [
            request.user.id,
            start_date,
            end_date,
            request.user.id
        ])
        
        repeating_transactions = list(RepeatingTransactionsModel.objects.filter(
            account=request.user,
            start_date__lte=end_date,
            is_active=True
        ).order_by('budget_id'))

        response = {'data' : {}}
        data_by_budget = response['data']

        for budget_tx in budget_tx_sums:
            budget_repeating_tx = [
                rep_tx for rep_tx in repeating_transactions if rep_tx.budget_id == budget_tx.id
            ]
            amount__sum = budget_tx.amount__sum
            spending__sum = budget_tx.spending_limit_over_range(start_date, end_date)
            for repeating in budget_repeating_tx:
                amount__sum += repeating.amount_between_dates(start_date, end_date)
            
            duration = Durations(budget_tx.frequency)
            data_by_budget[budget_tx.id] = {
                'amount' : float(amount__sum),
                'spending_limit': float(spending__sum),
                'category' : budget_tx.category,
                'frequency' : {
                    'name': str(duration),
                    'value': duration.value,
                },
            }
        
        return JsonResponse(response)


@method_decorator(never_cache, name='get')
class AllTxFragView(LoginRequiredMixin, TemplateView):
    template_name = 'history.frag.html'
    http_method_names = ['get', ]


# how much spend/speninglimit at each speciifc place over timespan???
@method_decorator(never_cache, name='get')
class ListAllTxView(PagedListView):
    model = TransactionsModel
    template_name = 'history.html'
    paginate_by = 20
    extra_cond = ''

    def get_queryset(self):
        raw_sql = '''
            (SELECT id, is_active, frequency, start_date, end_date,
                account_id, budget_id, specific_place_id, amount, True AS is_repeating
                FROM budget_repeatingtransactionsmodel
                WHERE account_id = %s AND is_active''' + self.extra_cond + '''
                    AND start_date <= %s AND end_date >= %s
            )
            UNION
            (SELECT id, is_active, %s AS frequency, date AS start_date, date AS end_date,
                account_id, budget_id, specific_place_id, amount, False AS is_repeating
                FROM budget_transactionsmodel
                WHERE account_id = %s AND is_active''' + self.extra_cond + '''
                    AND date >= %s AND date <= %s
            )
            ORDER BY
            CASE WHEN is_repeating THEN
                (amount * DATEDIFF(
                    CASE WHEN end_date < %s THEN end_date ELSE %s END,
                    start_date
                )) / frequency
            ELSE
                amount
            END DESC
        '''
        # "Order By" will be slightly inaccurate for monthly & yearly repeating transactions
        # because dividing by frequency does not take leap years or the many different lengths
        # of the months.
        
        return RepeatingTransactionsModel.objects.raw(raw_sql, [
            self.request.user.id,
            self.range_end,
            self.range_start,
            Durations.DAILY.value,
            self.request.user.id,
            self.range_start,
            self.range_end,
            self.range_end,
            self.range_end,
        ])

    def set_paramters_from_request(self):
        try:
            self.got_range = 'to' in self.request.GET and 'from' in self.request.GET
            logger.debug(self.got_range)
            if self.got_range:
                self.range_start = date.fromisoformat(self.request.GET['from'])
                self.range_end = date.fromisoformat(self.request.GET['to'])
            else:
                self.range_start = date.min
                self.range_end = date.today()
                ret = self.form.get_constraint_sql_from_request(self.request)
                has_err = ret == True
                self.extra_cond = '' if has_err else ret
            return has_err
        except:
            return True

    def get(self, request):
        self.form = BudgetChooserForm(request)
        if self.set_paramters_from_request():
            return HttpResponseBadRequest()
        
        page = self.paginated_queryset()
        # don't include repeating txs that didn't trigger in the time range
        # even though they are active in the time range
        objs = list()
        for item in page:
            obj = self.create_json_from_model(item)
            if obj['num_times'] > 0:
                objs.append(obj)
        page.object_list = objs

        params = self.form.get_form_url_params()
        if self.got_range:
            params.append('from=' + str(self.range_start))
            params.append('to=' + str(self.range_end))
        if len(params) > 0:
            page.extra_url_params = '&'.join(params) + '&'

        return render(request, self.template_name, {
            'page': page,
            'form': self.form,
            'range_start': str(self.range_start) if self.got_range else '',
            'range_end': str(self.range_end) if self.got_range else ''
        })

    def create_json_from_model(self, txModel):
        return {
            'category': txModel.budget_id,
            'specific_place': txModel.specific_place.place,
            'amount': txModel.amount,
            'is_repeating': txModel.is_repeating,
            'num_times': txModel.get_num_tx_between_dates(self.range_start, self.range_end),
        }


@method_decorator(never_cache, name='get')
class JsonSpecificPlacesView(LoginRequiredMixin, View):
    http_method_names = ['get', ]
    def get(self, request):
        try:
            budget_id = int(request.GET['category']) if 'category' in request.GET else None
        except:
            return HttpResponseBadRequest()
        places = SpecificPlacesModel.get_places_from_filter(request.user.id, budget_id)
        responseData = {'data' : [{'id': p.id, 'place': p.place} for p in places]}
        return JsonResponse(responseData)


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
