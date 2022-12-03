var budgets = (function () {
    let set_error_msg = function (element, msgArray) {
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
    let write_errors = function (json, formElement) {
        let error_elements = $(formElement).find(".invalid-feedback");
        set_error_msg(error_elements.filter(".category_error")[0], json.errors.category);
        set_error_msg(error_elements.filter(".frequency_error")[0], json.errors.frequency);
        set_error_msg(error_elements.filter(".non_field_error")[0], json.errors.non_field_errors);
        set_error_msg(error_elements.filter(".spending_limit_error")[0], json.errors.spending_limit);
    };
    let handle_response = function (triggerElement, formElement, requester) {
        let json = JSON.parse(requester.responseText);
        // log errors, enable save if bad
        if (json.has_errors) {
            triggerElement.disabled = false;
            console.log(json.errors);
            write_errors(json, formElement);
            $(formElement).show(300);
        } else {
            // if success, update hidden id input element in case it was new
            $(formElement).find("#id_budget_id")[0].value = json.budget_id;
        }
    };
    let add_budget_html = function (element, HTMLtext) {
        element.innerHTML = HTMLtext;
        let tokens = $('[name=csrfmiddlewaretoken]');
        if (tokens.length > 0) {
            element.firstElementChild.appendChild(tokens[0]);
        }
        $(element).hide();
        $('#budgetsContainer')[0].appendChild(element);
        $(element).show(300);
    };
    let get_parent_form = function (formChildElement) {
        return $(formChildElement).parents("form");
    };
    let updateUrl = "/budget/api/budget_update";
    let deleteUrl = "/budget/api/budget_delete";

    return {
        delete: function (event, ) {
            let formElement = get_parent_form(event.target);
            if (formElement.find("#id_budget_id")[0].value != -1) {
                // disable btn
                event.target.disabled = true;
                // send request to srv
                window.forms.ajaxFormSubmit(formElement, deleteUrl, function (requester) {
                    handle_response(event.target, formElement, requester)
                });
            }
            // hide html
            formElement.hide(500);
        },
        save: function (event) {
            let formElement = get_parent_form(event.target);
            // diable save
            event.target.disabled = true;
            // send request to srv
            window.forms.ajaxFormSubmit(formElement, updateUrl, function (requester) {
                handle_response(event.target, formElement, requester)
            });
        },
        new: function () {
            // get form if not cached
            let storageKey = "newBudgetForm";
            let formHTML = sessionStorage.getItem(storageKey);
            let newElement = document.createElement("div");
            $(newElement).hide();
            if (formHTML == null) {
                let request = new XMLHttpRequest();
                request.onload = function () {
                    add_budget_html(newElement, request.responseText);
                    sessionStorage.setItem(storageKey, request.responseText);
                };
                request.open("GET", updateUrl);
                request.send()
            } else {
                add_budget_html(newElement, formHTML);
            }
        },
    };
})();
