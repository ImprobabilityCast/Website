(function () {
    window.addEventListener("load", function () {
        let canvas = $("#mainGraph")[0];
        window.historyObj.onload = function () {
            if (window.historyObj.numBudgets > 0) {
                canvas.classList.toggle("d-none");
            } else {
                $("#noDataMsg")[0].classList.toggle("d-none");
                let addTxBtn = $("#addTxBtn")[0];
                addTxBtn.disabled = true;
                addTxBtn.title = "Add a budget before adding a transaction";
            }
        }
        window.historyObj.updateGraph(canvas);
    });
})();