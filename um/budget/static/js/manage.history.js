(function () {
    window.listManage.cacheKey = "newHistoryRow";
    let setDirtyCache = function () {
        window.app.isHistoryCacheOutdated = true;
    };
    window.listManage.onSaveSuccess = setDirtyCache;
    window.listManage.onDeleteSuccess = setDirtyCache;
    window.listManage.updateCache = window.app.isHistoryCacheOutdated;
    window.listManage.sortDataCallback = function (e1, e2) {
        return e1.amount * e1.num_times < e2.amount * e2.num_times;
    };
    let onFinish = function () {
        $(".history_item").each(function (idx, ele) {
            let amount = $(ele).find("#id_amount")[0].value - 0;
            let num_times = $(ele).find("#id_num_times")[0].value - 0;
            ele.title = window.app.currencyFormatter.format(amount * num_times);
        });
    };
    window.addEventListener("load", function () {
        window.listManage.populate(onFinish);
        window.app.isHistoryCacheOutdated = false;
    });
})();
