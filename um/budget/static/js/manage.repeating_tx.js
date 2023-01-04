(function () {
    let currencyFormatter = Intl.NumberFormat("en-US", options={currency: "USD", style: "currency"});
    window.listManage.cacheKey = "repeatingTxForm";
    let updateDisplay = function (formElement) {
        let amount = formElement.find("#id_amount")[0].value;
        let category = formElement.find("#id_category")[0].selectedOptions[0].textContent;
        let place = formElement.find("#id_specific_place")[0].value;
        let frequency = formElement.find("#id_frequency")[0].selectedOptions[0].textContent;
        formElement.find(".data-summary")[0].innerHTML =
            "<div class='w-100'>" + place + "</div><div class='w-100'><b>"
            + currencyFormatter.format(amount) + " " + frequency
            + "</b></div><div class='w-100'><i>" + category + "</i></div>";
    };
    let setDirtyCache = function () {
        window.app.isRepeatingTxCacheOutdated = true;
    };
    window.listManage.onSaveSuccess = function (formElement) {
        updateDisplay(formElement);
        setDirtyCache();
    }
    window.listManage.onDeleteSuccess = setDirtyCache;
    window.listManage.updateCache = window.app.isRepeatingTxCacheOutdated;
    window.addEventListener("load", function () {
        window.listManage.populate(function () {
            $("form").each(function (i, e) {
                updateDisplay($(e));
            });
        });
        window.app.isRepeatingTxCacheOutdated = false;
    });
})();
