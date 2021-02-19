// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: sitemap;

class Edge {
	constructor(fromNode, toNode) {
		this.weight = Math.random();
		this.fromNode = fromNode;
		this.toNode   = toNode;
		this.partialDirivSum = 0;
		this.partialDirivCount = 0;
	}
}

class Node {
	constructor(value=0) {
		this.inEdges = [];
		this.outEdges = [];
		this.activation = value;
		this.output = value;
		this.biasNode = undefined;
		this.activationHistory = [];
		this.outputHistory = [];
		this.error = 0;
		
		// Add bias via headless node
	}
	
	activate() {
		this.activation = 0;
		for (let inEdge of this.inEdges) {
			this.activation += inEdge.weight * inEdge.fromNode.output;
		}
	}
}


class Layer {
	constructor(units) {
		this.units = units;
		this.nodes = [];
		for (let i = 0; i < units; i++) {
			this.nodes.push(
				new Node()
			);
		}
	}
	
	getValues() {
		return this.nodes.map(node => node.output);
	}
	linear(x, derivative=false) {
		return derivative ? 1 : x;
	}
}
class InputLayer extends Layer {
	constructor(units) {
		super(units);
		this.activation = this.linear;
	}
	setValues(values) {
		for (let i = 0; i < this.nodes.length; i++) {
			this.nodes[i].output = values[i];
		}
	}
}
class DenseLayer extends Layer {
	constructor(units, activation) {
		super(units);
		switch (activation) {
			case 'relu':
				this.activation = this.relu;
				break;
			case 'sigmoid':
				this.activation = this.sigmoid;
				break;
			default:
				this.activation = this.linear;
				break;
		}
	}
	
	relu(x, derivative=false) {
		if (derivative) {
			return x < 0 ? 0 : 1;
		}
		else {
			return x < 0 ? 0 : x;
		}
	}
	sigmoid(x, derivative=false) {
		if (derivative) {
			let sigmoid = this.sigmoid(x, false);	
			return sigmoid * (1 - sigmoid);
		}
		else {
			return 1 / (1 + Math.exp(-x));
		}
	}
}

class SequentialModel {
	constructor(layers) {
		this.layers = layers;
	}
	add(layer) {
		this.layers.push(layer);
	}
	
	compile(learningRate=0.01, optimizer, loss, metrics) {
		this.constructEdges();
		this.learningRate = learningRate;
	}
	
	constructEdges() {
		for (let layerInd = 1; layerInd < this.layers.length; layerInd++) {
			let fromLayer = this.layers[layerInd-1];
			let toLayer   = this.layers[layerInd];
			for (let toNodeInd = 0; toNodeInd < toLayer.nodes.length; toNodeInd++) {
				let toNode = toLayer.nodes[toNodeInd];
				let biasNode = new Node(1);
				let biasEdge = new Edge(biasNode, toNode);
				toNode.inEdges.push(biasEdge);
				toNode.biasNode = biasNode;
				for (let fromNodeInd = 0; fromNodeInd < fromLayer.nodes.length; fromNodeInd++) {
					let fromNode = fromLayer.nodes[fromNodeInd];
					let edge = new Edge(fromNode, toNode);
					fromNode.outEdges.push(edge);
					toNode.inEdges.push(edge);
				}
			}
		}
	}
	
	fit(x, y, epochs=1, batch_size=undefined) {
		for (let epoch = 0; epoch < epochs; epoch++) {
			this.resetHistories();
			this.forwardProp(x);
			this.backwardProp(y);
		}
	}
	
	evaluate(x, y) {
	}
	
	predict(x) {
		return this.forwardProp(x);
	}
	
	resetHistories() {
		for (let layer of this.layers) {
			for (let node of layer.nodes) {
				node.activationHistory = [];
				node.outputHistory = [];
			}
		}
	}
	
	forwardProp(x) {
		let results = new Array(x.length);
		for (let i = 0; i < x.length; i++) {
			let layer = this.layers[0];
			layer.setValues(x[i]);
			for (let nodeInd = 0; nodeInd < layer.nodes.length; nodeInd++) {
				let node = layer.nodes[nodeInd];
				node.output = x[i][nodeInd];
				node.outputHistory[i] = node.output;
			}
			for (let layerInd = 1; layerInd < this.layers.length; layerInd++) {
				layer = this.layers[layerInd];
				for (let node of layer.nodes) {
					node.biasNode.outputHistory[i] = node.biasNode.output;
					node.activate();
					node.output = layer.activation(node.activation);
					node.activationHistory[i] = node.activation;	
					node.outputHistory[i] = node.output;
				}
			}
			results[i] = layer.getValues();
		}
		return results;
	}
	
	backwardProp(y) {
		for (let i = 0; i < y.length; i++)
		{
			let layer = this.layers[this.layers.length-1];	
			let yEst = layer.nodes[0].outputHistory[i];
			let node = layer.nodes[0];
			let actDiriv = layer.activation(node.activationHistory[i], true);	
			node.error = actDiriv * (yEst - y[i]);
			for (let edge of node.inEdges) {
				edge.partialDirivSum += node.error * edge.fromNode.output;
				edge.partialDirivCount++;
			}
			for (let layerInd = this.layers.length-2; layerInd >= 0; layerInd--) {
				layer = this.layers[layerInd];
				for (let node of layer.nodes) {
					let productSum = 0;
					for (let edge of node.outEdges) {
						productSum += edge.weight * edge.toNode.error;
					}
					actDiriv = layer.activation(node.activationHistory[i], true);
					node.error = actDiriv * productSum;
					for (let edge of node.inEdges) {
						edge.partialDirivSum += node.error * edge.fromNode.outputHistory[i];
						edge.partialDirivCount++;
					}
				}
			}
		}
		for (let layer of this.layers) {
			for (let node of layer.nodes) {
				for (let edge of node.inEdges) {
					let gradient = edge.partialDirivSum / edge.partialDirivCount;	
					edge.weight -= this.learningRate * gradient;	
					edge.partialDirivSum = 0;
					edge.partialDirivCount = 0;
				}
			}
		}
	}
}

keras = {};
keras.InputLayer = InputLayer;
keras.DenseLayer = DenseLayer;
keras.SequentialModel = SequentialModel;
