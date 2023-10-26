var listManage = (function () {
    let addHTML = function (element, HTMLtext) {
        let formsContainer = $('#formsContainer')[0];
        let unsaved = $(formsContainer).find("#id_data_id[value=-1]");
        if (unsaved.length === 0) {
            element.innerHTML = HTMLtext;
            $(element).hide();
            $('#formsContainer')[0].prepend(element);
            $(element).show(300);
        }
    };

    return {
        cacheKey: "",
        updateCache: false,
        onSaveSuccess: function(formElement) {},
        onDeleteSuccess: function() {},
        sortDataCallback: null,

        delete: function (event) {
            let jForm = $(event.target.form)
            let delayedDelete = function () {
                let juiceyPears = jForm.parents();
                juiceyPears[1].removeChild(juiceyPears[0]);
            };
            if (jForm.find("#id_data_id")[0].value != -1) {
                event.target.disabled = true;
                let obj = this;
                window.forms.ajaxFormSubmit(event.target, function (requester) {
                    setTimeout(delayedDelete, 500);
                    obj.onDeleteSuccess();
                });
            } else { // don't care about errors bc this doesn't exist on srv
                setTimeout(delayedDelete, 550);
                obj.onDeleteSuccess();
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
        new: function (event, onFinish = function () {}) {
            // get form if not cached
            let formHTML = window.cacheMan.getItem(this.cacheKey);
            let newElement = document.createElement("div");
            $(newElement).hide();
            let obj = this;
            if (formHTML == null || this.updateCache) {
                let request = new XMLHttpRequest();
                request.onload = function () {
                    if (request.status == 200) {
                        addHTML(newElement, request.responseText);
                        window.cacheMan.setItem(obj.cacheKey, request.responseText);
                        obj.updateCache = false;
                        onFinish();
                    }
                };
                let url = (event == undefined ? $("#newBtn")[0] : event.target)
                        .getAttribute("data-action");
                request.open("GET", url);
                request.send();
            } else {
                addHTML(newElement, formHTML);
                onFinish();
            }
        },
        populate: function (onFinish = function () {}) {
            let pageData = JSON.parse($("#pageData")[0].textContent);
            if (this.sortDataCallback != null) {
                pageData.sort(this.sortDataCallback);
            }
            let formsContainer = $("#formsContainer")[0];
            let obj = this;
            let recusriveWaitingNew = function (idx=pageData.length - 1) {
                if (idx < 0) {
                    onFinish();
                    return;
                }
                let data = pageData[idx];
                obj.new(undefined /* event */, function () {
                    let form = $(formsContainer.firstElementChild.firstElementChild);
                    Object.keys(data).forEach( function (key, ii) {
                        let formChild = form.find("#id_" + key)[0];
                        formChild.value = data[key];
                        formChild.setAttribute("value", data[key])
                        if (!formChild.classList.contains("form-control")) {
                            formChild.innerText = data[key];
                        }
                    });
                    recusriveWaitingNew(idx - 1);
                });
            };
            recusriveWaitingNew();
        }
    };
})();
