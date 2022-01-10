/**
 * neuralNetworkAPI.js
 * 
 * Neural network API that can be exported to make predictions
 * 
 * date: 24/05/2021
 */

let neuralNetwork;
let prediction;
setup();

/**
 * Exported class for neural network implementation
 */
export default class poseClassifier {
    /**
     * @param {Array} dataset
     * @param {Array} labels
     */
     constructor(dataset, labels) {
      this.dataset = dataset;
      this.labels = labels;
    };

    /**
     * Function to make a prediction based on the input dataset 
     * @param {*} dataset - Dataset to make prediction
     * @returns - Prediction result 
     */
    async predict(dataset) {
        if (Array.isArray(dataset)) {
            if (typeof dataset[0] === 'number') {
              return makePrediction(dataset);
            } else if (
              Array.isArray(dataset[0]) &&
              typeof dataset[0][0] === 'number'
            ) {
              const predictions = new Array(dataset.length);
              for (var i = 0; i < dataset.length; i++) {
                await makePrediction(dataset[i]).then((j) => {
                    predictions[i] = j;

                });
                return predictions;
              }
            }
          }
        throw new TypeError('dataset to predict must be an array or a matrix');
      }
               
}
      
/**
 * Function to make a classification prediction 
 * @param {*} dataset - pose dataset
 * @returns - Model classification result 
 */
async function makePrediction(dataset){
    await neuralNetwork.classify(dataset, (error, result) =>{
        if (result[0].confidence > 0.5) {
            prediction = result[0].label;
            }
        })
   return prediction;
}
  
/**
 * Function to load the ml5 neural network 
 */
function setup() {
    let options = {
      inputs: 34,
      outputs: 5,
      task: 'classification',
      debug: true
    }
    neuralNetwork = ml5.neuralNetwork(options);
  
    const modelInfo = {
        model: 'model/model.json',
        metadata: 'model/model_meta.json',
        weights: 'model/model.weights.bin',
      };
    neuralNetwork.load(modelInfo, NNLoaded());
}

/**
 * Callback function to inform the user the neural network is loaded 
 */
function NNLoaded() {
  console.log('pose classification ready!');
}
  