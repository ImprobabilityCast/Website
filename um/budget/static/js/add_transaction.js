var add_transaction = (function () {
    return {
        toggleRepeatingTransaction: function (event) {
            $("#id_frequency")[0].required=event.target.checked;
            $("#dateLabelContainer label")[0].innerHTML = event.target.checked ? "Start Date:" : "Date:";
        },
        submitTransaction: function (event) {
            window.forms.ajaxFormSubmit(event.target, function (json) {
                // get data
                let form  = $(event.target.form);
                let categoryControl = form.find("#id_category")[0];
                let amountControl = form.find("#id_amount")[0];
                let categoryID = categoryControl.selectedOptions[0].value;
                let amount  = amountControl.value - 0;
                let spentData = $.grep($.grep(window.historyObj.chart.data.datasets, function (e, i) {
                    return e.label === "spent";
                })[0].data, function (e, i) {
                    return e.budget_id === categoryID;
                })[0];
                let budgetedData = $.grep($.grep(window.historyObj.chart.data.datasets, function (e, i) {
                    return e.label === "budgeted";
                })[0].data, function (e, i) {
                    return e.budget_id === categoryID;
                })[0];

                // update graph, ignore repeating tx for now bc I can't be bothered
                if (!$("#id_is_repeating")[0].checked) {
                    spentData.x += amount;
                    spentData.available -= amount;
                    budgetedData.available -= amount;
                    window.historyObj.chart.update();
                }

                // clear form
                categoryControl.selectedIndex = 0;
                form.find("#id_frequency")[0].selectedIndex = 0;
                amountControl.value = "";
                form.find("#id_date")[0].value = "";
                form.find("#id_specific_place")[0].value = "";
            });
        },
        toggleTransactionForm: function (event) {
            // If it's expanded, then it's collapsing & vice versa
            event.target.textContent = event.target.getAttribute('aria-expanded') === "true" ?
                "Add Transaction" : "Hide ^";
        },
    };
})();
