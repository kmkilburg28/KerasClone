// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: brown; icon-glyph: magic;

function getBostonDataset() {
	// console.log(bostonDataset.src)
	return new Promise((resolve, reject) => {
		let bostonDataset = document.getElementById("dataset");
		bostonDataset.onload = function () {
			let bostonDatasetText = bostonDataset.contentDocument.body.children[0].innerHTML;
			resolve(parseDataset(bostonDatasetText));
		}
	});
}
// function getBostonDataset() {
// 	return new Promise((resolve, reject) => {
// 		let xhr = new XMLHttpRequest();
// 		xhr.open('GET', "http://lib.stat.cmu.edu/datasets/boston");
// 		xhr.setRequestHeader("Access-Control-Allow-Origin", "true")
// 		xhr.onload = function() {
// 			switch (xhr.status) {
// 				case (200):
// 					console.log(xhr);
// 					resolve(parseDataset(xhr.response));
// 					break;
// 				default:
// 					console.error(error);
// 					reject({
// 						status: xhr.status,
// 						statusText: xhr.statusText
// 					});
// 					break;
// 			};
// 		};
// 		xhr.onerror = function() {
// 			reject({
// 				status: xhr.status,
// 				statusText: xhr.statusText
// 			});
// 		}
// 		xhr.send();
// 	});
// }

function parseDataset(webpage) {
	webpage = webpage.split("Variables in order:")[1].trim();
	
	let labels = [];
	let lines = webpage.split("\n");
	for (let i in lines) {
		let line = lines.shift();
		label = line.trim().split(" ", 1)[0];
		if (label.length == 0) {
			break;
		}
		labels.push(label);
	}
	
	let dataset = {};
	labels.map((label) => dataset[label] = []);
	let labelInd = 0;
	for (let line of lines) {
		let features = line.trim().split(new RegExp(' +'));
		for (let feature of features) {
			dataset[labels[labelInd]].push(parseFloat(feature));
			labelInd++;
			if (labelInd >= labels.length) {
				labelInd = 0;
			}
		}
	}
	return dataset;
}

function datasetToTensor(dataset) {
	let entries = [];
	for (let label in dataset) {
		dataset[label].map(() => entries.push([]));
		break;
	}
	for (let labelInd in dataset) {
		for (let entryInd in dataset[labelInd]) {
			entries[entryInd].push(dataset[labelInd][entryInd]);
		}
	}
	return entries;
}

// module.exports.getBostonDataset = getBostonDataset;
// module.exports.datasetToTensor = datasetToTensor;

datasetModule = {};
datasetModule.getBostonDataset = getBostonDataset;
datasetModule.datasetToTensor = datasetToTensor;