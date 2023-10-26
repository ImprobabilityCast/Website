var historyObj = (function () {
	const statusUrl = "/budget/api/status";
	const summaryUrl = "/budget/api/tx_summary";
	const todayString = new Date().toISOString().substring(0, 10);
	return {
		_parsedData: {data: []},
		_palette: palette("sol-accent", 8),
		chart: null,
		_url: statusUrl,
		fromDate: todayString,
		toDate: todayString,

		get numBudgets() {
			return Object.keys(this._parsedData.data).length;
		},

		get parsedData() {
			return this._parsedData;
		},
		set parsedData(value) {
			this._parsedData = value;
		},

		get urlParams() {
			if (this._url == summaryUrl) {
				return "?from=" + this.fromDate + "&to=" + this.toDate;
			}
			return "";
		},

		get url() {
			return this._url + this.urlParams;
		},

		get differnceName() {
			if (this._url == summaryUrl) {
				return "difference";
			}
			return "available";
		},

		colorsGen: function* () {
			idx = 0;
			do {
				yield historyObj._palette[idx];
				idx = (idx + 1) % historyObj._palette.length;
			} while (true);
		},

		bindToCurrentPeriod: function () {
			this._url = statusUrl;
		},

		bindToTimespan: function () {
			this._url = summaryUrl;
		},

		customTooltipTitle: function (context) {
			let freq = context[0].raw.frequency;
			let suffix = (freq === undefined) ? "" : " (" + freq.name + ")";
			return context[0].label + suffix;
		},

		customTooltipLabel: function(context) {
			return context.dataset.label + ": "
				+ window.app.currencyFormatter.format(context.parsed.x)
		},

		customTooltipFooterLabel: function(context) {
			let labelText = "(" + window.app.currencyFormatter.format(context[0].raw.available)
					+ " " + this.differnceName + ")";
			return labelText;
		},

		customXScaleLabel: function(val, index) {
			return window.app.currencyFormatter.format(val);
		},

		drawChart: function (ctx) {
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
					maxBarThickness: 40,
					backgroundColor: [],
					borderColor: [],
				},
				{
					label: "spent",
					type: "bar",
					data: [],
					fill: false,
					maxBarThickness: 40,
					backgroundColor: [],
					borderColor: [],
				},
			];
			let obj = this;
			let counter = this.numBudgets - 1;
			let colors  = this.colorsGen();
			$.each(historyObj.parsedData.data, function (k, v) {
				let color = "#" + colors.next().value;
				let halfTransparentColor = color + "80";

				datasets[0].data.push({
					x: v.spending_limit,
					y: counter,
					available: v.spending_limit - v.amount,
					budget_id: k,
					frequency: v.frequency,
				});
				datasets[0].backgroundColor.push(halfTransparentColor);
				datasets[0].borderColor.push(color);

				datasets[1].data.push({
					x: v.amount,
					y: counter,
					available: v.spending_limit - v.amount,
					budget_id: k,
					frequency: v.frequency,
				});
				datasets[1].backgroundColor.push(color);
				datasets[1].borderColor.push(color);

				labels.push(v.category);
				counter -= 1;
			});

			ctx.parentElement.style.height = (this.numBudgets * 4.1) + "rem";
			let isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
			let fontColor = isDarkMode ? "#ddd" : "#555";
			let lineColor = isDarkMode ? "#282828" : "#e0e0e0";
			if (this.chart != null) {
				this.chart.destroy();
			}
			this.chart = new Chart(ctx, {
				type: "bar",
				data: {
					labels: labels,
					datasets: datasets,
				},
				options: {
					responsive: true,
					indexAxis: "y",
					parsing: parsing,
					maintainAspectRatio: false,
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
								color: fontColor,
							},
							grid: {
								color: lineColor,
							},
						},
						x: {
							ticks: {
								callback: function (val, index) {
									return obj.customXScaleLabel(val, index);
								},
								color: fontColor,
							},
							grid: {
								color: lineColor,
							},
						},
					},
					plugins: {
						tooltip: {
							callbacks: {
								title: function (context) { return obj.customTooltipTitle(context); },
								label: function (context) { return obj.customTooltipLabel(context); },
								footer: function (context) { return obj.customTooltipFooterLabel(context); }
							},
							intersect: false,
						},
						legend: {
							display: false,
						},
					},
				}
			});
		},

		onload: function(){},

		updateGraph: function (graph)
		{
			let requester = new XMLHttpRequest();
			let obj = this;
			requester.onload = function () {
				if (Math.floor(requester.status) / 100 === 2) {
					obj.parsedData = JSON.parse(requester.responseText);
					obj.onload();
					obj.drawChart(graph);
				}
			};
			requester.onerror = function () {
				console.log(requester.responseText);
			}
			requester.open("GET", this.url);
			requester.send();
		},
	};
})();
