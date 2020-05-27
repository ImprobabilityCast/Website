var page = (function () {
    var obj = {};
    var requestID = -1;

    $("#start-date").val(
        // yesterday
        new Date(Date.now() - 1000 * 60 * 60 * 24).toLocaleDateString('en-CA')
    );
    $("#end-date").val(new Date().toLocaleDateString('en-CA'));

    obj.getData = function () {
        clearTimeout(requestID); // invalid ids do nothing
        requestID = setTimeout(sendRequest, 1000);
    };

    function sendRequest() {
        let start = $("#start-date").val();
        let end = $("#end-date").val();
        let req = new XMLHttpRequest();
        let timespan = "?start=" + start + " 00:00:00&end="
            + end + " 23:59:59";
        req = new XMLHttpRequest();
        req.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                let json = JSON.parse(this.responseText);
                var cData = transformData(json.depression,
                    ['energy', 'motivation', 'hygine']
                );
                console.log(json.depression);
                drawChart(cData['energy']);
            }
        };
        req.open("GET", "get_history.php" + timespan, true);
        req.send();
    }

    function transformData(rawData, cols) {
        var out = {};
        for (let col of cols) {
            out[col] = [];
            for (let i = 0; i < rawData.length; i++) {
                out[col][i] = {
                    // add Z bc it's in UTC
                    x: rawData[i]['stamp'] + "Z",
                    y: rawData[i][col]
                };
            }
        }
        return out;
    }

    function drawChart(data) {
        console.log(data);
        var ctx = document.getElementById('chart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [
                    {
                        label: 'first',
                        data: data,
                        fill: false,
                        backgroundColor: '#f005',
                    },
                ]
            },
            options: {
                scales: {
                    xAxes: [{
                        type: 'time',
                    }],
                }
            }
        });
    }


    return obj;
})();

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

function parseMechData(text) {
    var data = JSON.parse(text);
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

page.getData();
