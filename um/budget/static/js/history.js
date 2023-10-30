(function () {
    window.addEventListener("load", function () {
        let filterForm = $("#filterForm")[0];
        let filterBtn = $("#filterBtn")[0];
        let cuteCat = $("#id_category")[0];
        let spPlace = $("#id_specific_place")[0];
        let palcesUrl = "/budget/api/places";

        cuteCat.addEventListener("change", function () {
            spPlace.disabled = true;
			let requester = new XMLHttpRequest();
			requester.onload = function () {
                let placesJson = JSON.parse(requester.responseText);
                spPlace.innerHTML = "";
                let opt = document.createElement("option");
                opt.value = 0;
                opt.innerText = ""
                spPlace.appendChild(opt);
                for (let placeItem of placesJson.data) {
                    opt = document.createElement("option");
                    opt.value = placeItem.id;
                    opt.innerText = placeItem.place;
                    spPlace.appendChild(opt);
                }
                spPlace.disabled = false;
            };
			requester.onerror = function () {
				console.log(requester.status + " : " + requester.responseText);
			};
            let url = palcesUrl;
            if (cuteCat.value != 0) {
                url += '?category=' + cuteCat.value;
            }
			requester.open("GET", url);
			requester.send();
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

        $("label[for=id_current_period")[0].innerText = "All of time";
    });
})();