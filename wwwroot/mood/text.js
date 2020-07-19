var text = (function () {
    let obj = {};

    function createText(stamp, text, name) {
        let stampStr = stamp.replace(/[^0-9]/g, '_');
        console.log(stampStr);
        let id = name + stampStr;

        let link = document.createElement('a');
        link.innerText = stamp;
        link.setAttribute("href", "#" + id);
        link.setAttribute("aria-expanded", "false");
        link.setAttribute("aria-controls", id);
        link.setAttribute("data-toggle", "collapse");
        link.classList.add('long');

        let hidden = document.createElement("div");
        hidden.classList.add("collapse");
        hidden.setAttribute("id", id);
        hidden.innerText = text;

        let container = document.createElement("div");
        container.classList.add("text-card");
        container.classList.add("border");
        container.appendChild(link);
        container.appendChild(hidden);
        return container;
    }

    function insertText(parent, dataset, names) {
        parent.innerHTML = "";
        for (let entry of dataset) {
            for (let name of names) {
                console.log(entry[name]);
                if (entry[name].length > 0) {
                    let text = createText(entry.stamp, entry[name], name);
                    parent.appendChild(text);
                }
            }
        }
    }

    obj.addText = function (data) {
        insertText($('#suicide-text')[0], data.suicide, ['steps']);
    }

    return obj;
})();
