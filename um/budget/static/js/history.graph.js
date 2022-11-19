(function () {
    window.onload = function () {historyObj.updateGraph($("#mainGraph")[0])};
	var historyObj = {
		_parsedData: {},
		colors: [],
		currencyFormatter: Intl.NumberFormat("en-US", options={currency: "USD", style: "currency"}),

		get parsedData() {
			return this._parsedData;
		},
		set parsedData(value)
		{
			this._parsedData = value;
			this.colors = palette('sol-accent', Object.keys(this._parsedData.data_by_category).length);
		},

		customTooltipLabel: function(context) {
			return context.dataset.label
				+ "(" + context.raw.place + "): "
				+ this.currencyFormatter.format(context.parsed.y);
		},

		drawChart: function (ctx) {
			console.log(historyObj.parsedData)
			let parsing = {
				xAxisKey: 'date',
				yAxisKey: 'amount',
			};
			let datasets = [];
			let obj = this;
			let counter = this.colors.length - 1;
			$.each(historyObj.parsedData.data_by_category, function (k, v) {
				let color = "#" + obj.colors[counter];
				datasets.push({
					data: v.data,
					parsing: parsing,
					label: v.category,
					backgroundColor: color,
					borderColor: color,
				});
				counter -= 1;
			});
			console.log(datasets[555]);

			return new Chart(ctx, {
				type: 'line',
				data: {
					datasets: [datasets[4]]
				},
				options: {
					scales: {
						xAxes: {
							type: 'time',
							time: {
								parser: function(s) {return new Date(s);},
							},
						},
					// 	yAxes: [{
					// 		type: 'dollars',
					//	}],
					},
					plugins: {
						tooltip: {
							callbacks: {
								label: function (context) { return obj.customTooltipLabel(context); },
							}
						}
					},
					tooltips: {
						enabled: true,
					},
				}
			});
		},

		updateGraph: function (graph)
		{
			let requester = new XMLHttpRequest();
			let obj = this;
			requester.onload = function () {
				obj.parsedData = JSON.parse(requester.responseText);
				obj.drawChart(graph);
			};
			requester.onerror = function () {
				console.log(requester.responseText);
			}
			requester.open("GET", "/budget/api/history");
			requester.send();
		},
	};
})();
