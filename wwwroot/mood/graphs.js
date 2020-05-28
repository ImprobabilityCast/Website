var graphs = (function () {
	var obj = {};
	var graphColors = ['#26c5d375', '#266ed375', '#26d38b75'];

	obj.buildGraphs = function (data) {
		let cols = ['thoughts', 'urges'];
		let suicide = transformData(data.suicide, cols);
		cols = ['energy', 'motivation', 'hygine'];
		let dep = transformData(data.depression, cols);
		cols = ['intensity', 'panic'];
		let anx = transformData(data.anxiety, cols);
		let fogComp = transformData(data.fog, ['comp_speed']);
		cols = ['forget', 'slurr'];
		let fogRadio = transformData(data.fog, cols);
		cols = ['after_wake', 'between_food', 'protein_veggie'];
		let food = transformData(data.food, cols);
		cols = ['fell_asleep', 'woke_up'];//, 'sleep_spent_awake'];
		let sleep = transformData(data.sleep, cols);
		let thing = transformData(data.sleep, ['quality']);
		cols = ['interaction_rating'];
		let people = transformData(data.people, cols);

		drawChart(suicide, $('#suicide')[0].getContext('2d'),
			[getRadioOptions()]
		);
		drawChart(dep, $('#depression')[0].getContext('2d'),
			[getScaleOptions()]
		);
		drawAnxChart(anx, $('#anxiety')[0].getContext('2d'));

		drawChart(fogComp, $('#fogComp')[0].getContext('2d'),
			[getScaleOptions()]
		);
		drawChart(fogRadio, $('#fogRadio')[0].getContext('2d'),
			[getRadioOptions()]
		);
		// drawChart(food, $('#food')[0].getContext('2d'));
		drawSleepChart(sleep, $('#sleep')[0].getContext('2d'));
		// drawChart(people, $('#people')[0].getContext('2d'));
	}

	function transformData(rawData, cols) {
		var out = [];
		var colorIdx = 0;
		for (let col of cols) {
			let set = {
				label: col,
				data: [],
				fill: 'origin',
				backgroundColor: graphColors[colorIdx],
				borderColor: graphColors[colorIdx],
			};
			for (let i = 0; i < rawData.length; i++) {
				set.data[i] = {
					// add Z bc it's in UTC
					x: rawData[i]['stamp'] + "Z",
					y: rawData[i][col]
				};
			}
			out.push(set);
			colorIdx++;
		}
		return out;
	}

	function getTimeOptions() {
		return {
			type: 'time',
			time: {
				displayFormat: 'minute',
				parser: "HH:mm",
			},
		};
	}

	function getRadioOptions() {
		return {
			beginAtZero: true,
			ticks: {
				suggestedMin: 0,
				suggestedMax: 3,
				callback: function (value, index, values) {
					return ['None', '1-5', '5-10', 'Over 10'][value];
				}
			}
		};
	}

	function getScaleOptions() {
		return {
			beginAtZero: true,
			ticks: {
				suggestedMin: 0,
				suggestedMax: 100,
				callback: function (value, index, values) {
					if (value == 0) {
						return 'Low';
					} else if (value == 100) {
						return 'High';
					} else {
						return null;
					}
				}
			}
		};
	}

	function getBoolOptions() {
		return {
			beginAtZero: true,
			ticks: {
				suggestedMin: 0,
				suggestedMax: 2,
				display: false,
			}
		};
	}

	function drawSleepChart(datasets, ctx) {
		datasets[0].fill = 1;
		datasets[1].fill = 0;
		datasets[0].yAxisID = 'left';
		datasets[1].yAxisID = 'left';
		//datasets[2].yAxisID = 'right';
		console.log(datasets);
		var options  = [getTimeOptions(), getTimeOptions()];
		options[0].parser = undefined;
		options[0].id = datasets[0].yAxisID;
		//options[1].id = datasets[2].yAxisID;
		drawChart(datasets, ctx, options);
	}

	function drawAnxChart(datasets, ctx) {
		datasets[1].type = 'bar';
		datasets[0].yAxisID = 'int';
		datasets[1].yAxisID = 'pan';
		datasets[1].barThickness = 15;
		var options = [getScaleOptions(), getBoolOptions()];
		options[0].id = datasets[0].yAxisID;
		options[1].id = datasets[1].yAxisID;
		drawChart(datasets, ctx, options);
	}

	function drawChart(datasets, ctx, yOptions) {
		return new Chart(ctx, {
			type: 'line',
			data: {
				datasets: datasets,
			},
			options: {
				scales: {
					xAxes: [{
						type: 'time',
					}],
					yAxes: yOptions,
				}
			},
		});
	}


	return obj;
})();
