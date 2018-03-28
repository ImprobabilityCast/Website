function isValidInput(target) {
    return Number(target.value) >= Number(target.getAttribute("min"));
}

function stopInvalid(evt) {
    if (!isValidInput(evt.currentTarget) ||
        Number(evt.currentTarget.value).toString() === "NaN") {
            evt.currentTarget.value =
                evt.currentTarget.getAttribute("last-good-input");
    }
    flagInvalid(evt);
}

function flagInvalid(evt) {
    if (isValidInput(evt.currentTarget)) {
        evt.currentTarget.classList.remove("invalid");
        evt.currentTarget.setAttribute("last-good-input",
                                        evt.currentTarget.value);
    } else {
        evt.currentTarget.classList.add("invalid");
    }
}
