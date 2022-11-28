var forms = (function () {
    return {
        accordion: function (collapsable) {
            $(".accordion-member").not("#" + collapsable[0].id).collapse("hide");
            collapsable.collapse("show");
        },
        ajaxSubmit: function (url, formElement) {

        },
    };
})();
