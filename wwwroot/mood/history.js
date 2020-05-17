document.getElementById('date').value = new Date().toLocaleDateString('en-CA');

function tenIfZero(num1, num2) {
    if (num1 < 10 && num1 > 0) {
        num2 = 90;
        num1 = 10;
    }
    if (num2 < 10 && num2 > 0) {
        num1 = 90;
        num2 = 10;
    }
    return [num1, num2];
}

function getMechData() {
    if (req.readyState == 4 & req.status == 200)
    {
        var data = JSON.parse(req.responseText);
        var coping  = document.getElementById('coping');
        
        for (var key in data) {
            var ele = document.createElement("div");
            ele.classList.add("row");
            ele.classList.add("mt-2");
            ele.innerText = key.replace(/~/g, ' ') + ":";
            coping.appendChild(ele);

            var tot = data[key].helpful * 1 + data[key].unhelpful * 1;
            var helpfulWidth = data[key].helpful  * 100.0 / tot;
            var unhelpfulWidth = data[key].unhelpful * 100.0 / tot;
            var arr = tenIfZero(helpfulWidth, unhelpfulWidth);
            helpfulWidth = arr[0];
            unhelpfulWidth = arr[1];

            ele = document.createElement('div');
            ele.classList.add('row');
            ele.innerHTML = '<div class="bg-primary text-center text-white'
            +   ' pt-1 pb-1 width-' +  helpfulWidth
            +   '" style="width:' + helpfulWidth + '%">'
            +       data[key].helpful + '</div>'
            + '<div class="bg-secondary text-center text-white'
            +   ' pt-1 pb-1 width-' + unhelpfulWidth
            +   '" style="width:' + unhelpfulWidth + '%">'
            +       data[key].unhelpful + '</div>';
            coping.appendChild(ele);
        }
    }
}

var req = new XMLHttpRequest();
req.addEventListener("readystatechange", getMechData);
req.open("GET", "getMechData.php?start=2020-05-10 00:00:00&end=2020-05-20 00:00:00", true);
req.send();
