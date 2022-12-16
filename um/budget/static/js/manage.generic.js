var listManage = (function () {
    let addHTML = function (element, HTMLtext) {
        element.innerHTML = HTMLtext;
        $(element).hide();
        $('#formsContainer')[0].appendChild(element);
        $(element).show(300);
    };

    return {
        cacheKey: "",
        onSaveSuccess: function(formElement) {},

        delete: function (event) {
            let delayedDelete = function () {
                let juiceyPears = event.traget.form.parents();
                juiceyPears[1].removeChild(juiceyPears[0]);
            };
            if (event.traget.form.find("#id_data_id")[0].value != -1) {
                event.target.disabled = true;
                window.forms.ajaxFormSubmit(event.target, function (requester) {
                    setTimeout(delayedDelete, 500);
                });
            } else { // don't care about errors bc this doesn't exist on srv
                setTimeout(delayedDelete, 550);
            }
            event.traget.form.hide(500);
        },
        save: function (event) {
            event.target.disabled = true;
            let obj = this;
            window.forms.ajaxFormSubmit(event.target, function (json) {
                event.target.form.find("#id_data_id")[0].value = json.data_id;
                obj.onSaveSuccess(event.target);
            });
        },
        new: function (event, async=true) {
            // get form if not cached
            let formHTML = window.cacheMan.getItem(this.cacheKey);
            let newElement = document.createElement("div");
            $(newElement).hide();
            let obj = this;
            if (formHTML == null) {
                let request = new XMLHttpRequest();
                request.onload = function () {
                    if (request.status == 200) {
                        addHTML(newElement, request.responseText);
                        window.cacheMan.setItem(obj.cacheKey, request.responseText);
                    } else {
                        console.warn("form request failed with status: " + request.status);
                    }
                };
                let url = (event == undefined ? $("#newBtn")[0] : event.target)
                        .getAttribute("data-action");
                request.open("GET", url, async);
                request.send();
            } else {
                addHTML(newElement, formHTML);
            }
        },
        populate: function () {
            let pageData = JSON.parse($("#pageData")[0].textContent);
            let formsContainer = $("#formsContainer")[0];
            let obj = this;
            pageData.forEach(function (data, i) {
                obj.new(undefined /* event */, false /* async */);
                let form = $(formsContainer.lastElementChild.firstElementChild);
                Object.keys(data).forEach( function (key, ii) {
                    form.find("#id_" + key)[0].value = data[key];
                });
            });
        }
    };
})();
