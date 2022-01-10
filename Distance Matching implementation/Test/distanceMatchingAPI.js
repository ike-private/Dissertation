/**
 * distanceMatchingAPI.js v1.0
 *
 * API for the distance matching implementation for the abnormal gait identifier application
 * Date: 24/05/2021
 */

import VPTreeFactory from 'vptree'
let vptree;

/**
 * Exported class for the distance matching implementation
 */
export default class searchAndExploration {
  /**
   * @param {Array} dataset
   * @param {Array} labels
   */
   constructor(dataset, labels) {
    this.vptree = buildVPTree1(dataset);
    this.dataset = dataset;
    this.labels = labels;
  }


  /**
   * Function to make a prediction based on a dataset
   * @param {*} dataset - Dataset to make prediction
   * @returns - Closest match prediction
   */
  predict(dataset) {
      if (Array.isArray(dataset)) {
        if (typeof dataset[0] === 'number') {
          return getPrediction(this, dataset);
        } else if (
          Array.isArray(dataset[0]) &&
          typeof dataset[0][0] === 'number'
        ) {
          const predictions = new Array(dataset.length);
          for (var i = 0; i < dataset.length; i++) {
            predictions[i] = getPrediction(this, dataset[i]);
          }
          return predictions;
        }
      }
      throw new TypeError('dataset to predict must be an array or a matrix');
    }


}

/**
 * Function to get the label for the closest match prediction
 * @param {*} p - Pose dataset
 * @param {*} pose - Pose to get closest match for
 * @returns - Closest match label
 */
function getPrediction(p, pose){
    let finalLabel;
    let closestMatchIndex = findMostSimilarMatch(pose, p);
    finalLabel = p.labels[closestMatchIndex]
    return finalLabel;
}

/**
 * Function to calculate the weighted distance between two poses
 * @param {*} pose1 - Pose from either the tree or the user
 * @param {*} pose2 -  Pose from either the tree or the user
 * @returns - The distance value between 0 and 1
 */
function weightedDistance(pose1, pose2) {
	let vector1 = pose1.slice(0, 34);
	let vector1Confidences = pose1.slice(34, 51);
	let vector1ConfidenceSum = pose1.slice(51, 52);

	let vector2 = pose2.slice(0, 34);

	// Sum of pose1 vectors
	let vector1Sum = 1 / vector1ConfidenceSum;

	// Sum of pose2 vectors
	let vector2Sum = 0;
	for (let i = 0; i < vector1.length; i++) {
	  let tempConf = Math.floor(i / 2);
	  let tempSum = vector1Confidences[tempConf] * Math.abs(vector1[i] - vector2[i]);
	  vector2Sum = vector1Sum + tempSum;
	}

	return vector1Sum * vector2Sum;
}

/**
 * Function to calculate the cosine distance between two poses
 * @param {*} poseVector1 -   Pose from either the tree or the user
 * @param {*} poseVector2 -  Pose from either the tree or the user
 * @returns - Cosine distance value between 0 and 1
 */
 function cosineDistanceMatching(poseVector1, poseVector2) {
	let cosine;
	cosine = pns.poseSimilarity(poseVector1, poseVector2, { strategy: 'cosineDistance' });
	return cosine;
}

/**
 * Function to get the weighted distance value
 * @param {*} poseVector1 -   Pose from either the tree or the user
 * @param {*} poseVector2  -  Pose from either the tree or the user
 * @returns - Weighted distance between two poses between 0 and 1
 */
 function weightedDistanceMatching(poseVector1, poseVector2) {
	let weight;
	weight = weightedDistance(poseVector1, poseVector2);
    return weight;
}

/**
 * Function to initialize vptree with loaded pose data and a distance function
 */
 function buildVPTree1(poseData) {
	vptree = VPTreeFactory.build(poseData, weightedDistanceMatching);
	// vptree = VPTreeFactory.build(poseData, cosineDistanceMatching);
 }

/**
 * Function to find the closest match in the tree from a users input
 * @param {*} userPose - Pose obtained from user
 * @returns - Nearest match index
 */
function findMostSimilarMatch(userPose) {
	let nearestImage = vptree.search(userPose);
	return nearestImage[0].i;
}
