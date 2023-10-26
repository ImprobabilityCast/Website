(function () {
    window.addEventListener("load", function () {
        let canvas = $("#mainGraph")[0];
        let getGraphElement = function () {
            return $("#mainGraph")[0];
        };
        window.historyObj.onload = function () {
            if (window.historyObj.numBudgets === 0) {
                canvas.classList.toggle("d-none");
                $("#noDataMsg")[0].classList.toggle("d-none");
                let addTxBtn = $("#addTxBtn")[0];
                addTxBtn.disabled = true;
                addTxBtn.title = "Add a budget before adding a transaction";
            }
        };
        window.historyObj.updateGraph(canvas);

        window.timespanFormConfig.formTitle = "Graph Display Settings";
        window.timespanFormConfig.toTimespanAction = function (fromDate, toDate) {
            window.historyObj.bindToTimespan();
            window.historyObj.fromDate = fromDate;
            window.historyObj.toDate = toDate;
            window.historyObj.updateGraph(getGraphElement());
        };
        window.timespanFormConfig.toCurentPeriodAction = function () {
            window.historyObj.bindToCurrentPeriod();
            window.historyObj.updateGraph(getGraphElement());
        };
    });
})();