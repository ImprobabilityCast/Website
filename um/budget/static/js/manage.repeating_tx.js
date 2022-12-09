(function () {
    let currencyFormatter = Intl.NumberFormat("en-US", options={currency: "USD", style: "currency"});
    window.listManage.deleteUrl = "/budget/api/repeating_tx_delete";
    window.listManage.updateUrl = "/budget/api/repeating_tx_update";
    let updateDisplay = function (formElement) {
        let amount = formElement.find("#id_amount")[0].value;
        let category = formElement.find("#id_category")[0].selectedOptions[0].innerText;
        let place = formElement.find("#id_specific_place")[0].value;
        let frequency = formElement.find("#id_frequency")[0].selectedOptions[0].innerText;
        formElement.find(".data-summary")[0].innerHTML =
            "<div class='row'><div class='col-md'>" + place + "</div><div class='col-md'>"
            + currencyFormatter.format(amount) + " " + frequency
            + "</div></div><div><i>" + category + "</i></div>";
    };
    window.listManage.onSaveSuccess = updateDisplay;
    window.addEventListener("load", function () {
        $("form").each(function (i, e) {
            updateDisplay($(e));
        });
    });
})();
