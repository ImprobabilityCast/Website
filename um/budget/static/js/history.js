(function () {
    window.addEventListener("load", function () {
        let filterForm = $("#filterForm")[0];
        let filterBtn = $("#filterBtn")[0];
        let cuteCat = $("#id_category")[0];
        let spPlace = $("#id_specific_place")[0];
        let urlCat = window.location.search.split(/[\?\&]/).filter(item => item.startsWith("category"))[0];
        let potentialValue = (urlCat == undefined) ? NaN : urlCat.split("=")[1] - 0;
        if (potentialValue != NaN)
            cuteCat.value = potentialValue.toString();

        cuteCat.addEventListener("change", function () {
            // update spPlace from API
        });

        filterBtn.addEventListener("click", function () {
            let newLoc = window.location.origin + window.location.pathname;
            let params = [];
            if (cuteCat.value != 0) {
                params.push("category=" + cuteCat.value);
            }
            if (spPlace.value != 0) {
                params.push("specific_place=" + spPlace.value);
            }
            if (window.timespanFormConfig.useDates && window.timespanFormConfig.isValid) {
                params.push("from=" + window.timespanFormConfig.fromDateStr);
                params.push("to=" + window.timespanFormConfig.toDateStr);
            }
            if (params.length > 0) {
                newLoc += "?" + params.join("&");
            }
            window.location = newLoc;
        });

        let filterBtnDisabler = function () {
            filterBtn.disabled = !window.timespanFormConfig.isValid;
        };
        filterForm.addEventListener("change", filterBtnDisabler);
        window.timespanFormConfig.toTimespanAction = filterBtnDisabler;

        window.timespanFormConfig.formTitle = "";
    });
})();