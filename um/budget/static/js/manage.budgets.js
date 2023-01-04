(function () {
    window.listManage.cacheKey = "newBudgetForm";
    let setDirtyCache = function () {
        window.app.isRepeatingTxCacheOutdated = true;
    };
    window.listManage.onSaveSuccess = setDirtyCache;
    window.listManage.onDeleteSuccess = setDirtyCache;
    window.listManage.updateCache = window.app.isBudgetCacheOutdated;
    window.addEventListener("load", function () {
        window.listManage.populate();
        window.app.isBudgetCacheOutdated = false;
    });
})();
