(function () {
    window.listManage.deleteUrl = "/budget/api/budget_delete";
    window.listManage.updateUrl = "/budget/api/budget_update";
    window.listManage.cacheKey = "newBudgetForm";
    window.addEventListener("load", function () {
        window.listManage.populate();
    });
})();
