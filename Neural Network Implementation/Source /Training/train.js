/**
 * train.js
 * 
 * File to train the neural network using the data in the file obtained from collection.js
 * Date: 24/05/2021
 */

let neuralNetwork;


/**
 * Function called to save array of poses into a JSON file when s is pressed on the keyboard 
 */
function keyPressed() {
    if (key == 's') {
      console.log('saving');
       neuralNetwork.saveData();
     } 
};


/**
 * Function to create the neural network and load the data collected 
 * If debug is set to true, loss curve is shown 
 */
function setup() {
  createCanvas(640, 480);
  let options = {
    inputs: 34,
    outputs: 5,
    task: 'classification',
    debug: true
  }
  neuralNetwork = ml5.neuralNetwork(options);
  neuralNetwork.loadData('training.json', dataReady);
}

/**
 * Function to normalise and train the neural network
 * Epochs can be amended depending on data collected
 */ 
function dataReady() {
  neuralNetwork.normalizeData();
  neuralNetwork.train({epochs: 250}, finished); 
}

/**
 * Function to automatically save the training data once training is complete 
 * Three files will be created and saved 
 */
function finished() {
  console.log('model trained');
  neuralNetwork.save();
}