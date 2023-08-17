(function () {
    var imgData = {urls: [], urlIndex: 0};
    var isAddingImages = false;
    
    document.addEventListener("scroll", scrolled);
    $("#navCollapse div label a").each(function (i, e) {
        e.addEventListener("click", collapseNavIfShown);
    });

    function scrolled() {
        let art = $("#art");
        if (!art[0].classList.contains("hidden")) {
            let lastImg = art[0].lastElementChild;
            let rect = lastImg.getBoundingClientRect();
            if (rect.top < window.innerHeight - rect.height / 2) { // close enough to end of page
                lazyLoadArt();
            }
        }
    }

    var addImage = function (imgUrl) {
        let artDiv = $("#art");
        let div = document.createElement("div");
        let a = document.createElement("a");
        let img = document.createElement("img");
        let fullUrl = "http://127.0.0.1:81" + imgUrl;
        img.src = fullUrl;
        img.alt = imgUrl;
        img.classList.add("img-fluid", "p-3", "art");
        a.href = fullUrl;
        a.appendChild(img);
        div.appendChild(a);
        artDiv[0].appendChild(div);
    }

    var addNewImages = function () {
        let count = 0;

        if (!isAddingImages) {
            isAddingImages = true;
            while (imgData.urlIndex < imgData.urls.length && count < 4) {
                addImage(imgData.urls[imgData.urlIndex]);
                imgData.urlIndex += 1;
                count += 1;
            }

            setTimeout(function () {isAddingImages = false}, 1000);
        }
    }

    var lazyLoadArt = function () {
        let artDiv = $("#art");
        let artLoadingMsgID = "artLoadingMsg";
        if (artDiv[0].lastElementChild.id = artLoadingMsgID) {
            // show loading animation, nah just loading text :P
            // get list of images um.adoodleydo.dev/rando/img_list?category=art
            let request = new XMLHttpRequest();
            request.onload = function () {
                artDiv.find("#artLoadingMsg").hide(0);
                imgData = JSON.parse(request.responseText);
                imgData.urlIndex = 0;
                addNewImages();
            };
            request.open("GET", "http://127.0.0.1:81/rando/img_list?category=art");
            request.send();
        } else {
            // if blank page visible or near visible, and images avilable
            //      then add more images to art div
            addNewImages();
        }
    }

    var showRadioContent = function (contentID) {
        for (let ele of elements) {
            if (ele.id === contentID) {
                ele.classList.remove("hidden");
                let func = eval(ele.getAttribute("data-call-on-show"));
                if (func !== null) func(ele);
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

    function collapseNavIfShown()
    {
        let nav = $('#navCollapse');
        if (nav[0].classList.contains('show')) {
            nav.collapse('hide');
        }
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
