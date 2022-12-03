var add_transaction = (function () {
    return {
        toggleRepeatingTransaction: function (event) {
            $("#id_frequency")[0].required=event.target.checked;
            $("#dateLabelContainer label")[0].innerHTML = event.target.checked ? "Start Date:" : "Date:";
        },
    };
})();
