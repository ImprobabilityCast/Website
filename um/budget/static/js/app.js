var app = (function () {
    let budgetCacheStr = "app.budget.isBudgetCacheOutdated";
    let repeatingTxCacheStr = "app.budget.isRepeatingTxCacheStr";
    let txCacheStr = "app.budget.txCacheStr";
    let historyCacheStr = "app.budget.historyCacheStr";
    return {
		currencyFormatter: Intl.NumberFormat("en-US", options={currency: "USD", style: "currency"}),
        
        set isRepeatingTxCacheOutdated(value) {
            localStorage.setItem(repeatingTxCacheStr, value);
        },
        get isRepeatingTxCacheOutdated() {
            return "true" === localStorage.getItem(repeatingTxCacheStr);
        },
        set isBudgetCacheOutdated(value) {
            localStorage.setItem(budgetCacheStr, value);
        },
        get isBudgetCacheOutdated() {
            return "true" === localStorage.getItem(budgetCacheStr);
        },
        set isTxCacheOutdated(value) {
            localStorage.setItem(txCacheStr, value);
        },
        get isTxCacheOutdated() {
            return "true" === localStorage.getItem(txCacheStr);
        },
        set isHistoryCacheOutdated(value) {
            localStorage.setItem(historyCacheStr, value);
        },
        get isHistoryCacheOutdated() {
            return "true" === localStorage.getItem(historyCacheStr);
        },
    };
})();