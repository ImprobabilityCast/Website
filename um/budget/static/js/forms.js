var forms = (function () {
    let csrftokenNode = null;
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
        let error_elements = formElement.find(".invalid-feedback");
        error_elements.each(function(idx, ele) { ele.innerHTML = ""; });
        for (let key in json.errors) {
            setErrorMsg(error_elements.filter("." + key + "_error")[0], json.errors[key]);
        }
    };
    let handleResponse = function (triggerElement, onSuccessfulResponse, requester) {
        let has_errors = true;
        if (requester.status == 200) {
            let json = JSON.parse(requester.responseText);
            let formElement = $(triggerElement.tagName == "FORM" ? triggerElement : triggerElement.form);
            // log errors, enable save if bad
            if (json.has_errors) {
                triggerElement.disabled = false;
                console.log(json.errors);
                formElement.show(300);
            } else {
                onSuccessfulResponse(json);
            }
            // call regardless bc it will clear existing error msgs
            writeErrors(json, formElement);
            has_errors = json.has_errors;
        }
        return has_errors;
    };

    return {
        accordion: function (collapsable) {
            $(".accordion-member").not(collapsable).collapse("hide");
            collapsable.collapse("show");
        },
        ajaxFormSubmit: function (triggerElement, onSuccessfulResponse=function(){}) {
			let requester = new XMLHttpRequest();
			requester.onload = function () {
                handleResponse(triggerElement, onSuccessfulResponse, requester);
            };
			requester.onerror = function () {
				console.log(requester.status + " : " + requester.responseText);
			};
            if (csrftokenNode == null) {
                csrftokenNode = $("input[name=csrfmiddlewaretoken]")[0];
            }
			requester.open("POST", triggerElement.getAttribute("data-action"));
            requester.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
            requester.setRequestHeader("X-CSRFTOKEN", csrftokenNode.value);
			requester.send($(triggerElement.form).serialize());
        },
    };
})();
