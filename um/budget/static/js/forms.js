var forms = (function () {
    let csrftokenNode = null;
    return {
        accordion: function (collapsable) {
            $(".accordion-member").not(collapsable).collapse("hide");
            collapsable.collapse("show");
        },
        ajaxFormSubmit: function (formElement, url, onload) {
			let requester = new XMLHttpRequest();
			requester.onload = function (event) {
                onload(requester);
            };
			requester.onerror = function () {
				console.log(requester.status + " : " + requester.responseText);
			};
            if (csrftokenNode == null) {
                csrftokenNode = $("input[name=csrfmiddlewaretoken]")[0];
            }
			requester.open("POST", url);
            requester.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
            requester.setRequestHeader("X-CSRFTOKEN", csrftokenNode.value);
			requester.send(formElement.serialize());
        },
    };
})();
