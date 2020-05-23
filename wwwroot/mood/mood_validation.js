function setHiddenInputs() {
    $("#mood-hidden").val($("#mood-overall").val().length);

    $("#suicide-hidden").val($("input[name=suicidal-thoughts]:checked").length
            & $("input[name=suicidal-urges]:checked").length);
    $("#harm-hidden").val($("input[name=harm-purpose]:checked").length);
    
    $("#depression-hidden").val(
        $("#energy").prop("changed")
        & $("#motivation").prop("changed")
        & $("#hygine").prop("changed")
    );

    $("#anxiety-hidden").val(
        $("#anx-intensity").changed
        | $("#anx-where").val().length > 0
        | $("#panic-attack").prop("checked")
    );

    $("#fog-hidden").val(
        $("input[name=forgets]:checked").length
        & $("input[name=slurrs]:checked").length
    );
    
    $("#anger-hidden").val(
        $("#anger-exp").val().length > 0
        | $("#anger-thoughts").val().length > 0
    );

    $("#food-hidden").val(
        $("#wake-to-eat-time").val() !== ""
        & $("#foof-to-food-time").val() !== ""
        & $("#veggies").prop("checked")
    );

    $("#sleep-hidden").val(
        $("#sleep-fell-asleep").val() !== ""
        & $("#sleep-woke-up").val() !== ""
        & $("#sleep-spen-awake").val() !== ""
        & $("input[name=sleep-quality]:checked").length
    );

    $("#people-hidden").val(
        $("#ap-what").val().length > 0
        | $("#ap-interactions").prop("changed")
    );
}

function flagInput(e) {
    e.target.changed = 1;
}
