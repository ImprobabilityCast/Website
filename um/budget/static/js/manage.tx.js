(function () {
    window.listManage.cacheKey = "newTxForm";
    let setDirtyCache = function () {
        window.app.isTxCacheOutdated = true;
    };
    window.listManage.onSaveSuccess = setDirtyCache;
    window.listManage.onDeleteSuccess = setDirtyCache;
    window.listManage.updateCache = window.app.isTxCacheOutdated;
    window.addEventListener("load", function () {
        window.listManage.populate();
        window.app.isTxCacheOutdated = false;
    });
})();
