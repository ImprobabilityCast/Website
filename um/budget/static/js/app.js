var app = (function () {
    let budgetCacheStr = "app.budget.isBudgetCacheOutdated";
    let repeatingTxCacheStr = "app.budget.isRepeatingTxCacheStr";
    return {
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
    };
})();