var listManage = (function () {
    let setErrorMsg = function (element, msgArray) {
        if (msgArray == undefined) msgArray = [];
        let parent = document.createElement("ul");
        parent.classList.add("pl-3");
        msgArray.forEach(function (text) {
            let li = document.createElement("li");
            li.innerText = text;
            parent.appendChild(li);
        });
        element.innerHTML = "";
        element.appendChild(parent);
    };
    let writeErrors = function (json, formElement) {
        let error_elements = $(formElement).find(".invalid-feedback");
        error_elements.each(function(idx, ele) { ele.innerHTML = ""; });
        for (let key in json.errors) {
            setErrorMsg(error_elements.filter("." + key + "_error")[0], json.errors[key]);
        }
    };
    let handleResponse = function (triggerElement, formElement, requester) {
        let json = JSON.parse(requester.responseText);
        // log errors, enable save if bad
        if (json.has_errors) {
            triggerElement.disabled = false;
            console.log(json.errors);
            formElement.show(300);
        } else {
            // if success, update hidden id input element in case it was new
            formElement.find("#id_data_id")[0].value = json.data_id;
        }
        // call regardless bc it will clear existing error msgs
        writeErrors(json, formElement);
        return json.has_errors;
    };
    let addHTML = function (element, HTMLtext) {
        element.innerHTML = HTMLtext;
        $(element).hide();
        $('#formsContainer')[0].appendChild(element);
        $(element).show(300);
    };
    let getParentForm = function (formChildElement) {
        return $(formChildElement).parents("form");
    };

    return {
        deleteUrl: "",
        updateUrl: "",
        onSaveSuccess: function(formElement) {},

        delete: function (event) {
            let formElement = getParentForm(event.target);
            let delayedDelete = function () {
                let juiceyPears = formElement.parents();
                juiceyPears[1].removeChild(juiceyPears[0]);
            };
            if (formElement.find("#id_data_id")[0].value != -1) {
                event.target.disabled = true;
                window.forms.ajaxFormSubmit(formElement, this.deleteUrl, function (requester) {
                    if (!handleResponse(event.target, formElement, requester)) {
                        // no errors, so delete the html element
                        setTimeout(delayedDelete, 500);
                    }
                });
            } else { // don't care about errors bc this doesn't exist on srv
                setTimeout(delayedDelete, 600);
            }
            formElement.hide(500);
        },
        save: function (event) {
            let formElement = getParentForm(event.target);
            event.target.disabled = true;
            let obj = this;
            window.forms.ajaxFormSubmit(formElement, this.updateUrl, function (requester) {
                if (!handleResponse(event.target, formElement, requester)) {
                    obj.onSaveSuccess(formElement);
                }
            });
        },
        new: function (cacheKey) {
            // get form if not cached
            let formHTML = sessionStorage.getItem(cacheKey);
            let newElement = document.createElement("div");
            $(newElement).hide();
            if (formHTML == null) {
                let request = new XMLHttpRequest();
                request.onload = function () {
                    addHTML(newElement, request.responseText);
                    sessionStorage.setItem(cacheKey, request.responseText);
                };
                request.open("GET", this.updateUrl);
                request.send()
            } else {
                addHTML(newElement, formHTML);
            }
        },
    };
})();
