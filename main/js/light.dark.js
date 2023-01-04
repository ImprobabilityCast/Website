(function () {
    var colorSwitcher = function () {
        let checker = window.matchMedia("(prefers-color-scheme: dark)").matches;
        if (checker) {
            for (var ele of document.getElementsByClassName("navbar")) {
                ele.classList.remove("navbar-light", "bg-light");
                ele.classList.add("navbar-dark", "bg-dark");
            }
            for (var ele of document.getElementsByClassName("light-dark")) {
                ele.classList.remove("bg-light");
                ele.classList.add("bg-dark");
            }
            for (var ele of document.getElementsByClassName("light-dark-text")) {
                ele.classList.remove("text-dark");
                ele.classList.add("text-light");
            }
        } else {
            for (var ele of document.getElementsByClassName("navbar")) {
                ele.classList.remove("navbar-dark", "bg-dark");
                ele.classList.add("navbar-light", "bg-light");
            }
            for (var ele of document.getElementsByClassName("light-dark")) {
                ele.classList.remove("bg-dark");
                ele.classList.add("bg-light");
            }
            for (var ele of document.getElementsByClassName("light-dark-text")) {
                ele.classList.remove("text-light");
                ele.classList.add("text-dark");
            }
        }
    };
    setInterval(colorSwitcher, 500);
})();