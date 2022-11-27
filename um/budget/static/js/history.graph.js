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
			this.colors = palette("sol-accent", Object.keys(this._parsedData.data).length);
		},

		customTooltipLabel: function(context) {
			return context.dataset.label + ": "
				+ this.currencyFormatter.format(context.parsed.x)
		},

		customTooltipFooterLabel: function(context) {
			return "(" + this.currencyFormatter.format(context[0].raw.available) + " available)";
		},

		customXScaleLabel: function(val, index) {
			return this.currencyFormatter.format(val);
		},

		drawChart: function (ctx) {
			console.log(historyObj.parsedData)
			let labels = [];
			let parsing = {
				yAxisKey: "y",
				xAxisKey: "x",
			};
			let datasets = [
				{
					label: "budgeted",
					type: "bar",
					data: [],
					fill: false,
					backgroundColor: [],
					borderColor: [],
				},
				{
					label: "spent",
					type: "bar",
					data: [],
					fill: false,
					backgroundColor: [],
					borderColor: [],
				},
			];
			let obj = this;
			let counter = this.colors.length - 1;
			$.each(historyObj.parsedData.data, function (k, v) {
				let color = "#" + obj.colors[counter];
				let halfTransparentColor = color + "80";

				datasets[0].data.push({
					x: v.spending_limit,
					y: counter,
					available: v.spending_limit - v.amount
				});
				datasets[0].backgroundColor.push(halfTransparentColor);
				datasets[0].borderColor.push(color);

				datasets[1].data.push({
					x: v.amount,
					y: counter,
					available: v.spending_limit - v.amount
				});
				datasets[1].backgroundColor.push(color);
				datasets[1].borderColor.push(color);

				labels.push(v.category);
				counter -= 1;
			});
			console.log(datasets);

			return new Chart(ctx, {
				type: "bar",
				data: {
					labels: labels,
					datasets: datasets,
				},
				options: {
					indexAxis: "y",
					parsing: parsing,
					// scales: {
					// 	xAxes: {
					// 		type: "time",
					// 		time: {
					// 			tooltipFormat: luxon.DateTime.DATE_MED,
					// 		},
					// 	},
					// 	yAxes: [{
					// 		type: "dollars",
					//	}],
					// },
					scales: {
						y: {
							stacked: true,
							ticks: {
								callback: function (val, index) {
									let label = labels[index];
									if (label.length > 12){
										label = label.substring(0, 10) + "...";
									}
									return label;
								},
							},
						},
						x: {
							ticks: {
								callback: function (val, index) {
									return obj.customXScaleLabel(val, index);
								},
							},
						},
					},
					plugins: {
						tooltip: {
							callbacks: {
								label: function (context) { return obj.customTooltipLabel(context); },
								footer: function (context) { return obj.customTooltipFooterLabel(context); }
							}
						},
						legend: {
							display: false,
						},
					},
					// tooltips: {
					// 	enabled: true,
					// },
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
