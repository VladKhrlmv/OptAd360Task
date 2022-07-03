// selection dom elements
const table = document.querySelector('.fetched-data-table');
const btn = document.querySelector('.fetch-data-button');
const ctx = document.getElementById('ageDistribution');

// define ageDistributionChart variable
let ageDistributionChart = null;

// adding event listener to button
btn.addEventListener('click', fetchData);

// function to fetch data from https://randomuser.me/
export function fetchData() {
	clearData();
	displayLoader();

	const url = 'https://randomuser.me/api/?results=1000&gender=male&nat=fr';
	fetch(url)
		.then((response) => response.json())
		.then((data) => {
			hideLoader();
			showChart(data);
			showTable(data);
		})
		.catch((err) => errorHandler(err));
}

// show loading
function displayLoader() {
	const loader = document.querySelector('.loader');

	loader.classList.remove('hidden');
}

// hide loader
function hideLoader() {
	const loader = document.querySelector('.loader');

	loader.classList.add('hidden');
}

// clear all data and placeholder
function clearData() {
	const placeholder = document.querySelector('.placeholder');
	const tableBody = document.querySelector('.fetched-data-table tbody');

	placeholder.classList.add('hidden');
	table.classList.add('hidden');
	ctx.classList.add('hidden');
	if (ageDistributionChart) ageDistributionChart.destroy();
	if (tableBody) tableBody.parentNode.removeChild(tableBody);
}

function errorHandler(err) {
	hideLoader();

	const placeholder = document.querySelector('.placeholder');

	placeholder.classList.add('error');
	placeholder.classList.remove('hidden');
	placeholder.innerText = `Something went wrong: ${err}`;

	console.log(err);
}

// function to show data as chart
function showChart(data) {
	const { ageGaps, ageDistribution } = processData(data);

	const chartData = {
		labels: ageGaps,
		datasets: [
			{
				label: 'Male age distribution in France',
				data: ageDistribution,
				hoverOffset: 4,
			},
		],
	};

	const chartConfig = {
		type: 'pie',
		data: chartData,
		options: {
			plugins: {
				autocolors: {
					mode: 'data',
				},
				title: {
					display: true,
					text: 'Age distribution of men in France',
					font: {
						size: 25,
					},
				},
			},
		},
	};

	const autocolors = window['chartjs-plugin-autocolors'];
	Chart.register(autocolors);
	Chart.defaults.font.size = 16;

	ageDistributionChart = new Chart(ctx, chartConfig);

	ctx.classList.remove('hidden');
}

// function to show table with 10 oldest men
function showTable(data) {
	const oldest10 = data.results
		.sort((a, b) => b.dob.age - a.dob.age)
		.slice(0, 10);

	const requiredDataOfOldest10 = oldest10.reduce((result, item) => {
		// receive name
		let name = Object.values(item.name).reduce(
			(name, value) => name + ' ' + value,
			''
		);
		name = name.slice(1);

		let age = item.dob.age;

		let email = item.email;

		let phone = item.phone;

		result.push({ name, age, email, phone });

		return result;
	}, []);

	let tableBody = document.createElement('tbody');

	// set colspan for label
	document
		.querySelector('.table-label')
		.setAttribute('colspan', Object.keys(requiredDataOfOldest10[0]).length);

	// create headers for table
	let headers = document.createElement('tr');

	headers.classList.add('headers');

	Object.keys(requiredDataOfOldest10[0]).forEach((value) => {
		let cell = document.createElement('td');
		cell.innerText = value;
		headers.appendChild(cell);
	});

	tableBody.appendChild(headers);

	// create table rows containing name, age, email, phone for each element of the array
	requiredDataOfOldest10.forEach((element) => {
		let row = document.createElement('tr');

		Object.values(element).forEach((value) => {
			let cell = document.createElement('td');
			cell.innerText = value;
			row.appendChild(cell);
		});

		tableBody.appendChild(row);
	});

	table.appendChild(tableBody);

	table.classList.remove('hidden');
}

// process data for chart
function processData(data) {
	const ageGaps = [
		'20-29',
		'30-39',
		'40-49',
		'50-59',
		'60-69',
		'70-79',
		'>=80',
	];

	let ages = data.results.map((elem) => elem.dob.age);
	const ageDistribution = ages.reduce((result, item) => {
		// find to which age group the item belongs
		let gapIndex = ageGaps.findIndex(
			(gap) => item >= gap.split('-')[0] && item <= gap.split('-')[1]
		);

		// if item belongs to an existing gap, increment the corresponding index
		if (!result[gapIndex]) {
			result[gapIndex] = 1;
		} else {
			result[gapIndex]++;
		}

		return result;
	}, []);

	return {
		ageGaps,
		ageDistribution,
	};
}

// show background on every 5th page refresh
window.onload = function () {
	let refreshCounter = localStorage.getItem('refreshCounter') || 0;
	if (refreshCounter == 5) {
		let content2 = document.querySelector('.content2');
		content2.classList.add('visible-background');
		refreshCounter = 1;
		localStorage.setItem('refreshCounter', refreshCounter);
	} else {
		refreshCounter++;
		localStorage.setItem('refreshCounter', refreshCounter);
	}
};
