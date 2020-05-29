var graphs = (function () {
	var obj = {};
	var graphColors = ['#26c5d375', '#266ed375',
		'#26d38b', '#4f0be2'];

	obj.buildGraphs = function (data) {
		let cols = ['thoughts', 'urges'];
		let suicide = transformData(data.suicide, cols);
		cols = ['energy', 'motivation', 'hygine'];
		let dep = transformData(data.depression, cols);
		cols = ['intensity', 'panic'];
		let anx = transformData(data.anxiety, cols,
			['intensity', 'panic attack']);
		let fogComp = transformData(data.fog, ['comp_speed'],
			['speed of comprehension']);
		cols = ['forget', 'slurr'];
		let fogRadio = transformData(data.fog, cols,
			['times forgotten what thing while doing the thing', 'speech slurrs']);
		cols = ['after_wake', 'between_food', 'protein_veggie'];
		let food = transformData(data.food, cols,
			['hours between getting up and eating',
			'hours between foods',
			'protien/veggie']);

		cols = ['interaction_rating'];
		let people = transformData(data.people, cols,
			['interaction rating']);

		drawSleepCharts(data.sleep);

		drawChart(suicide, $('#suicide')[0].getContext('2d'),
			[getRadioOptions()]
		);
		drawChart(dep, $('#depression')[0].getContext('2d'),
			[getScaleOptions()]
		);
		drawChartWithBoolLast(anx, $('#anxiety')[0].getContext('2d'),
			[getScaleOptions()]
		);

		drawChart(fogComp, $('#fogComp')[0].getContext('2d'),
			[getScaleOptions()]
		);
		drawChart(fogRadio, $('#fogRadio')[0].getContext('2d'),
			[getRadioOptions()]
		);
		drawChartWithBoolLast(food, $('#food')[0].getContext('2d'),
			[]
		);

		drawChart(people, $('#people')[0].getContext('2d'),
			[getScaleOptions(0, 'Life fueling', 'Heavy')]
		);
	}

	function transformData(rawData, cols, labels = []) {
		var out = [];
		var colorIdx = 0;
		for (let idx = 0; idx < cols.length; idx++) {
			let col = cols[idx];
			let set = {
				label: (labels.length > 0) ? labels[idx] : col,
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

	function transformTimespanData(rawData, startCol, endCol) {
		let colorIdx = 1;
		let set = {
			label: 'diff',
			data: [],
			fill: 'origin',
			backgroundColor: graphColors[colorIdx],
			borderColor: graphColors[colorIdx],
		};

		for (let i = 0; i < rawData.length; i++) {
			let start = rawData[i][startCol];
			let end = rawData[i][endCol];
			set.data.push({
				// add Z bc it's in UTC
				x: rawData[i]['stamp'] + "Z",
				y: Math.abs(
					(start.substr(0, 2) + end.substr(0, 2))
					- (start.substr(0, 2) + start.substr(0, 2))
					),
			});
		}
		return set;
	}

	function transformQualityData(rawData) {
		let result = [{
			type: 'bar',
			label: 'Restless',
			barThickness: 6,
			data: [],
			yAxisID: 0,
			backgroundColor: graphColors[2],
			borderColor: graphColors[2],
		}, {
				type: 'bar',
				label: 'Solid',
				barThickness: 6,
				data: [],
				yAxisID: 0,
				backgroundColor: graphColors[3],
				borderColor: graphColors[3],
		}];
		
		for (let i = 0; i < rawData.length; i++) {
			let one = {
				x: rawData[i]['stamp'] + 'Z',
				y: 1,
			};
			let zero = {
				x: rawData[i]['stamp'] + 'Z',
				y: 0,
			};
			if (rawData[i]['quality'] == 0) {
				result[0].data.push(one);
				result[1].data.push(zero);
			} else if (rawData[i]['quality'] == 1) {
				result[0].data.push(zero);
				result[1].data.push(one);
			}
		}

		return result;
	}

	function drawSleepCharts(sleep) {
		let cols = ['fell_asleep', 'woke_up'];
		let sleepTimes = transformData(sleep, cols);
		let sleepDiff = transformTimespanData(sleep, cols[0], cols[1]);
		let sleepHours = transformData(sleep, ['sleep_spent_awake']);
		sleepHours.push(sleepDiff);
		let quality = transformQualityData(sleep)

		for (let i = 0; i < sleepHours.length; i++) {
			sleepHours[i].yAxisID = 1;
		}

		sleepHours.push(quality[0]);
		sleepHours.push(quality[1]);

		drawChart(sleepTimes, $('#sleepTimes')[0].getContext('2d'),
			[getTimeOptions()]
		);

		console.log(sleepHours);

		drawChart(sleepHours,
			$('#sleepHours')[0].getContext('2d'), [{
				id: 0,
				ticks: {
					min: 0,
					max: 1.5,
					display: false,
				},
				position: 'right',
			}, {
				id: 1,
				position: 'left',
			}]);
	}

	function getTimeOptions(id) {
		return {
			type: 'time',
			time: {
				displayFormat: 'minute',
				parser: "HH:mm",
			},
			ticks: {
				stepSize: '30m'
			},
			id: id,
		};
	}

	function getRadioOptions(id) {
		return {
			beginAtZero: true,
			ticks: {
				suggestedMin: 0,
				suggestedMax: 3,
				callback: function (value, index, values) {
					return ['None', '1-5', '5-10', 'Over 10'][value];
				}
			},
			id: id,
		};
	}

	function getScaleOptions(id, highLabel='High', lowLabel='Low') {
		return {
			beginAtZero: true,
			ticks: {
				suggestedMin: 0,
				suggestedMax: 100,
				callback: function (value, index, values) {
					if (value == 0) {
						return lowLabel;
					} else if (value == 100) {
						return highLabel;
					} else {
						return null;
					}
				}
			},
			id: id,
		};
	}

	function getBoolOptions(id) {
		return {
			beginAtZero: true,
			ticks: {
				suggestedMin: 0,
				suggestedMax: 2,
				display: false,
			},
			id: id,
		};
	}

	function drawChartWithBoolLast(datasets, ctx, optFirst, id1 = 0) {
		let last = datasets.length - 1;
		for (let i = 0; i < last; i++) {
			datasets[i].yAxisID = id1;
		}
		datasets[last].yAxisID = 1;
		datasets[last].type = 'bar';
		datasets[last].barThickness = 15;

		var options = [ optFirst,
			getBoolOptions(datasets[last].yAxisID)
		];
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
				},
				tooltips: {
					enabled: false,
				},
			}
		});
	}


	return obj;
})();
