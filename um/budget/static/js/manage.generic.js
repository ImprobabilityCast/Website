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
            let jForm = $(event.target.form)
            let delayedDelete = function () {
                let juiceyPears = jForm.parents();
                juiceyPears[1].removeChild(juiceyPears[0]);
            };
            if (jForm.find("#id_data_id")[0].value != -1) {
                event.target.disabled = true;
                window.forms.ajaxFormSubmit(event.target, function (requester) {
                    setTimeout(delayedDelete, 500);
                });
            } else { // don't care about errors bc this doesn't exist on srv
                setTimeout(delayedDelete, 550);
            }
            jForm.hide(500);
        },
        save: function (event) {
            event.target.disabled = true;
            let obj = this;
            window.forms.ajaxFormSubmit(event.target, function (json) {
                let form = $(event.target.form)
                form.find("#id_data_id")[0].value = json.data_id;
                let saveFeedback = form.find("#saveFeedback");
                saveFeedback.show(300, function () {
                        setTimeout(function () {saveFeedback.hide(600);}, 4000);
                    });
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
