/**
 * test.js
 * 
 * Test for the neural network implementation of the abnormal gait identifier application 
 * 
 * date: 24/05/2021
 */

import { leaveOneOut } from './node_modules/ml-cross-validation/src/index.js';
import poseClassifier from './neuralNetworkAPI.js';

var poseData = [];
let labels = [];
let data = [];

await getPoseData();
getConfustionMatrix();

/**
 * Function to load the pose dataset used for testing 
 * Saves the labels into an array and the pose data into another array 
 */
async function getPoseData(){
    console.log("got pose data");
    await $.getJSON("training.json", function(json) {
        data = json;
        data.data.forEach( function (i) {
            console.log();
            poseData.push(getPoses(i.xs))
            labels.push(i.ys[0])
        })
    })
}

/**
 * Function to get only the poses from the pose data (not the label)
 * @param {*} pose - Pose data with label
 * @returns - Pose data
 */
function getPoses(pose) {
    let inputs = [];
    for (var key in pose){
        inputs.push(pose[key]);
    }   
    return inputs;
}

/**
 * Function to get the confusion matrix and classification report 
 */    
async function getConfustionMatrix() {
    console.log("confusion matrix");

    const confusionMatrix = await leaveOneOut(poseClassifier, poseData, labels);
    const accuracy = confusionMatrix.getAccuracy();
    console.log(confusionMatrix);
    console.log(accuracy)

    classificationReport(confusionMatrix,confusionMatrix.labels[0]);
    classificationReport(confusionMatrix,confusionMatrix.labels[1]);
    classificationReport(confusionMatrix,confusionMatrix.labels[2]);
    classificationReport(confusionMatrix,confusionMatrix.labels[3]);
    classificationReport(confusionMatrix,confusionMatrix.labels[4]);

}

/**
 * Function to print the classification report for each label 
 * @param {*} cm - Confusion matrix 
 * @param {*} label - Label under analysis 
 */
function classificationReport(cm, label){
	let precision
	let recall
	let f1;
	let specificity 

    let tp = cm.getTruePositiveCount(label);
    let fp = cm.getFalsePositiveCount(label);
    let fn = cm.getFalseNegativeCount(label);
    let tn = cm.getTrueNegativeCount(label);

    precision = tp/(tp+fp);
    recall = tp/(tp+fn);
    specificity = tn/(tn+fp);
    f1 = cm.getF1Score(label)

    console.log(label);
    console.log("Precision: " + precision);
    console.log("Recall: " + recall);
    console.log("Specificity: " + specificity);
    console.log("F1 Score: " + f1)
}

  
