/**
 * test.js v1.0
 *
 * Test for the distance matching implementation for the abnormal gait identifier application
 * Date: 24/05/2021
 */

import jsdom from 'jsdom';
import fs from 'fs';
import { leaveOneOut } from 'ml-cross-validation';
import searchAndExploration from './distanceMatchingAPI.js';
import pkg from 'jquery';
import KNN from 'ml-knn';

const {JSDOM} = jsdom;
const {document} = (new JSDOM('<!doctype html><html><body></body></html>')).window;
global.document = document;
global.window = document.defaultView;

let poseData = [];
let data = [];
let p = {};
let labels = [];
let posesAndConfidence = [];
const {$,jQuery} = pkg;

/**
 * Function to get the label for the matching pose
 * @param {*} match - Matching pose
 * @returns - Matching pose label
 */
function getOneLabel(match){
	let l;
	posesAndConfidence.forEach( function (item){
		if	(item.keypoints.sort().join('|') === match.slice(0,34).sort().join('|')){
			l = item.label
		}
	});
	return l
}

/**
 * Function to get the pose dataset
 */
function getPoseData(){
	console.log("got pose data");
	data = JSON.parse(fs.readFileSync("CP1.json")) ;
	data = data.concat(JSON.parse(fs.readFileSync("N1.json"))) ;
	data = data.concat(JSON.parse(fs.readFileSync("MS1.json"))) ;
	data = data.concat(JSON.parse(fs.readFileSync("P1.json"))) ;
	data = data.concat(JSON.parse(fs.readFileSync("S1.json"))) ;

	data.forEach( function (i) {
		p = {};
		p.keypoints = i.keypoints.slice(0, 34);
		p.confidences = i.keypoints.slice(34, 51);
		p.confidencesSum = i.keypoints.slice(51, 52) ;
		p.label = i.label;
		posesAndConfidence.push(p);
		poseData.push(i.keypoints.slice(0, 52))
	})
}

/**
 * Function to get all poses and labels from the pose data set
 * @param {*} poseData - Pose dataset
 */
function getPosesAndLabels(poseData){
	poseData.forEach( function (item){
			labels.push(getOneLabel(item));
	})
}

getPoseData();
getPosesAndLabels(poseData);

// Get the confusion matrix using the dataset and distance matching API
const confusionMatrix = leaveOneOut(searchAndExploration, poseData, labels);
const accuracy = confusionMatrix.getMatrix();
console.log(confusionMatrix);

/**
 * Function to print a classification report based on the confusion matrix results
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

// Print a classification report for each label in the dataset
classificationReport(confusionMatrix,confusionMatrix.labels[0]);
classificationReport(confusionMatrix,confusionMatrix.labels[1]);
classificationReport(confusionMatrix,confusionMatrix.labels[2]);
classificationReport(confusionMatrix,confusionMatrix.labels[3]);
classificationReport(confusionMatrix,confusionMatrix.labels[4]);
