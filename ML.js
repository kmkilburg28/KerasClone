// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: cyan; icon-glyph: magic;

// let train_x = [	
// 	[1, 2],
// ];
let datasetModule = importModule('Dataset');
let train = await datasetModule.getBostonDataset();

let train_x = {'MEDV': train['MEDV']};
let train_y = {'MEDV': train['MEDV']};
// console.log(train_x)
train_x = datasetModule.datasetToTensor(train_x);
train_y = datasetModule.datasetToTensor(train_y);
// console.log(typeof(train_x))

let keras = importModule('Keras');

let nInputs = train_x[0].length;
model = new keras.SequentialModel([
	new keras.InputLayer(units=nInputs),
	new keras.DenseLayer(units=16, activation=''),
	new keras.DenseLayer(units=1,  activation=''),
]);

model.compile(learningRate=0.0005);

let history = model.fit(train_x, train_y, epochs=500, batch_size=1);

let prediction = model.predict(train_x);
console.log(prediction);
let alert = new Alert();
alert.message = prediction.toString();
alert.presentAlert();
// console.log(model.layers)
