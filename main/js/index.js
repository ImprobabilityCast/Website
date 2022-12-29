(function () {

    var showRadioContent = function (contentID) {
        for (let ele of elements) {
            if (ele.id === contentID) {
                ele.classList.remove("hidden");
                setTimeout(function (element) { element.classList.remove("transparent"); }, 20, ele);
            } else {
                ele.classList.add("hidden", "transparent");
            }
        }
    }

    var setNavSelected = function (navElement) {
        for (let item of $(".nav-item")) {
            item.classList.remove("active");
        }
        navElement.classList.add("active");
    }

    var removeHash = function (hashed) {
        return hashed.substring(hashed.lastIndexOf("#") + 1);
    }

    var elements = $("[data-info=content]");
    var bookmark = "#home";

    for (let ele of document.getElementsByClassName("nav-link")) {
        ele.addEventListener("click", function (e) {
            setNavSelected(e.target.parentElement);

            showRadioContent(removeHash(e.target.href));
        })
    }

    if (location.hash.length > 0) {
        bookmark = location.hash;
    }

    setNavSelected($("[href=" + $.escapeSelector(bookmark) + "]")[0].parentElement);
    showRadioContent(removeHash(bookmark));
})();

(function () {
    window.addEventListener("load", function () {
        let choices = ["Isaac", "Issaac", "Isssac", "Issac", "Isac", "Isaak"];
        $(".myName").each(function (i, e) {
            e.textContent = choices[Math.floor(Math.random() * choices.length)];
        });
    });
})();
