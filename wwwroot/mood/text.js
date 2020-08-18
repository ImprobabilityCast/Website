var text = (function () {
    let obj = {};

    obj.createText = function (stamp, html) {
        let id = 'a' + (Math.random() + stamp).replace(/[^0-9]/g, '_');

        let link = document.createElement('a');
        link.innerText = stamp;
        link.setAttribute("href", "#" + id);
        link.setAttribute("aria-expanded", "false");
        link.setAttribute("aria-controls", id);
        link.setAttribute("data-toggle", "collapse");
        link.classList.add('long');

        let hidden = document.createElement("div");
        hidden.classList.add("collapse");
        hidden.classList.add("pt-2")
        hidden.setAttribute("id", id);
        if (html) {
            hidden.appendChild(html);
        }

        let container = document.createElement("div");
        container.classList.add("text-card");
        container.classList.add("border");
        container.appendChild(link);
        container.appendChild(hidden);
        return container;
    }

    function insertText(parent, dataset) {
        parent.innerHTML = "";
        for (let entry of dataset) {
            let html = obj.createText(new Date(entry.stamp).toLocaleString(), entry.html);
            parent.appendChild(html);
        }
    }

    function transformName(name) {
        let arr = {
            "emote_response" : "Emotional Response",
            "expression" : "Expressions",
            "thought" : "Thoughts",
            "what_do" : "What do",
            "what_impact" : "Impact",
        };

        if (arr[name] !== undefined) {
            return arr[name];
        } else {
            let words = name.split("_");
            for (let i = 0; i < words.length; i++) {
                words[i] = words[i].charAt(0).toUpperCase() + words[i].substr(1);
            }
            return words.join(" ");
        }
    }

    function dataToHtml(entry) {
        let div = document.createElement("div");
        let strCount = 0;
        for (let prop of Object.getOwnPropertyNames(entry)) {
            if (typeof entry[prop] === "string" && prop !== "stamp") {
                let head = document.createElement('h6');
                head.innerText = transformName(prop);
                head.classList.add("font-weight-bold");

                strCount += 1;
                if (strCount == 1) {
                    head.style.display = "none";
                }

                let text = document.createElement('p');
                text.innerText = entry[prop];
                div.appendChild(head);
                div.appendChild(text);
            }
        }
        
        if (strCount > 1) {
            div.children[0].style.display = "block";
        }
        return div;
    }
    
    function transformData(data) {
        let trans = {};
        let mechHolder = data.mechs;
        delete data.mechs;

        for (let group of Object.getOwnPropertyNames(data)) {
            trans[group] = [];
            if (group === 'sleep') {
                for (let entry of data[group]) {
                    trans[group].push({});
                    let div = document.createElement('div');
                    div.appendChild(document.createElement('p'));
                    div.children[0].innerText = entry.meds;
                    trans[group][trans[group].length - 1].stamp = entry.stamp;
                    trans[group][trans[group].length - 1].html = div;
                }
            } else {
                for (let entry of data[group]) {
                    trans[group].push({});
                    let div = dataToHtml(entry);
                    trans[group][trans[group].length - 1].stamp = entry.stamp;
                    trans[group][trans[group].length - 1].html = div;
                }
            }
        }

        data.mechs = mechHolder;
        return trans;
    }

    obj.addText = function (data) {
        let trans = transformData(data);
        console.log(trans);
        insertText($('#suicide-text')[0], trans.suicide);
        insertText($('#self-harm-text')[0], trans.self_harm);
        insertText($('#anxiety-text')[0], trans.anxiety);
        insertText($('#anger-text')[0], trans.anger);
        insertText($('#sleep-text')[0], trans.sleep);
        insertText($('#people-text')[0], trans.people);
        insertText($('#notes-text')[0], trans.notes);
    }

    return obj;
})();
