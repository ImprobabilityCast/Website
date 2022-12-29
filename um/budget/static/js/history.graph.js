var historyObj = (function () {
	return {
		_parsedData: {data: []},
		_palette: palette("sol-accent", 8),
		currencyFormatter: Intl.NumberFormat("en-US", options={currency: "USD", style: "currency"}),
		chart: null,

		get numBudgets() {
			return Object.keys(this._parsedData.data).length;
		},

		get parsedData() {
			return this._parsedData;
		},
		set parsedData(value) {
			this._parsedData = value;
		},

		colors: (function* () {
			let idx = 0;
			do {
				yield historyObj._palette[idx];
				idx = (idx + 1) % historyObj._palette.length;
			} while (true);
		})(),

		customTooltipTitle: function (context) {
			return context[0].label + " (" + context[0].raw.frequency.name + ")";
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
					minBarLength: 24,
					backgroundColor: [],
					borderColor: [],
				},
				{
					label: "spent",
					type: "bar",
					data: [],
					fill: false,
					maxBarThickness: 40,
					minBarLength: 24,
					backgroundColor: [],
					borderColor: [],
				},
			];
			let obj = this;
			let counter = this.numBudgets - 1;
			$.each(historyObj.parsedData.data, function (k, v) {
				let color = "#" + obj.colors.next().value;
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
			this.chart = new Chart(ctx, {
				type: "bar",
				data: {
					labels: labels,
					datasets: datasets,
				},
				options: {
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
							}
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
				obj.parsedData = JSON.parse(requester.responseText);
				obj.onload();
				obj.drawChart(graph);
			};
			requester.onerror = function () {
				console.log(requester.responseText);
			}
			requester.open("GET", "/budget/api/status");
			requester.send();
		},
	};
})();
