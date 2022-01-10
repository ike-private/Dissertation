/**
 * deploy.js v1.0
 *
 * The neural network implementation for the abnormal gait identifier application
 * File to deploy the implementation
 * Date: 24/05/2021
 */

let poses = [];
let start;
let pose;
let poseLabels = [];
let finalLabel;
let poseData = [];
let data = [];
let p = {};
let poseNormalised;
let vptree ;
let posesAndConfidence = [];
let video;
let averageConfidence;


/**
 * Setup function to create a canvas
 */
function setup() {
	createCanvas(1200,600);
}

/**
 * Function called when a user selects to upload a video from their file system
 */
function uploadVideo(){
	video = document.getElementById('video');
	let x = document.getElementById("myFile").value;
	document.getElementById('uploadWebcam').style = "display: none";
	document.getElementById('collectVideoPoses').style = "display: inline";
	video.width = 1000;
	video.height = 600;
	video.src = x.split("fakepath").pop();
}

function myFunction() {
	document.getElementById("demo").innerHTML = x;
	console.log(x.split("fakepath").pop())
  }

/**
 * Function called when a user selects to use their webcam as a video input
 */
function uploadWebcam(){
	video = createCapture(VIDEO);
	webcam = true;
	document.getElementById('uploadVideo').style = "display: none";
	document.getElementById('collectWebcamPoses').style = "display: inline";
	video.hide();
}

/**
 * Function to collect the poses from the video uploaded by the user
 */
async function collectVideoPoses() {
	video.addEventListener( 'loadeddata' ,  posenet.load().then(function(n) {
		console.log("loaded");
		net = n;
		requestAnimationFrame(function() {
		  estimateVideoPoses();
		});
	}))
}

/**
 * Function to collect poses using a webcam
 */
async function collectWebcamPoses() {
	 posenet.load().then(function(n) {
		console.log("loaded");
		net = n;
		requestAnimationFrame(function() {
		  estimateWebcamPoses();
		});
	  })
}

/**
 * Function to process the poses being collected from the webcam
 * After all poses are collected, tree is built and most frequent label is found
 */
function estimateWebcamPoses() {
	net.estimateSinglePose(video.elt)
	  .then(function(pose) {
		pose = pose;
		poseNormalised = normalisePoseToVector(pose);
		poses.push(poseNormalised);
		let timestamp = Date.now()

		// When a pose is collected, it is normalised
		if (start === undefined)
			start = timestamp;
			const elapsed = timestamp - start;
			poseNormalised = normalisePoseToVector(pose);
			poses.push(poseNormalised);

		// If the webcam has been collected for less than 5 seconds, poses are continually collected
		if (elapsed < 5000) {
			requestAnimationFrame(function() {
				estimateWebcamPoses();
			});
	    }

		// If webcam has been collecting for more than 5 seconds, poses are processed to find closest match and most frequent label
		else if(elapsed > 5000) {
			console.log('ended');
			for (let i = 0; i < poses.length; i++) {
				buildVPTree1();
				let currentUserPose = poses[i];
				let closestMatchIndex = findMostSimilarMatch(currentUserPose);
				let closestMatch = poseData[closestMatchIndex];
				poseLabels.push(closestMatch);
				if (i == poses.length - 1){
					finalLabel = getLabel(poseLabels);
					averageConfidence = getAverageConfidence(poseLabels)
					document.getElementById("label").innerHTML = "Classification label: " + finalLabel + " || " + "Confidence Score: " + averageConfidence
				}
			}
		}
	  });
  }

/**
 * Function to process the poses being collected from the video uploaded
 * After all poses are collected, tree is built once and most frequent label is found
 */
function estimateVideoPoses() {
	video.addEventListener( 'loadeddata' , net.estimateSinglePose(video)
	.then(function(pose){
		video.play();
		console.log('collecting poses');
		let timestamp = Date.now()

		// When a pose collected, it is normalised
		if (start === undefined)
			start = timestamp;
			const elapsed = timestamp - start;
			poseNormalised = normalisePoseToVector(pose);
			poses.push(poseNormalised);

		// If the video has not played for its full duration, the gotPoses function is called again
		if (elapsed < video.duration * 1000) {
			requestAnimationFrame(function() {
				estimateVideoPoses();

			})
		}

		// Once the video is completed, the VP tree is built, the closest match and most frequent label is found
		else if(elapsed > video.duration*1000) {
			console.log('ended');
			for (let i = 0; i < poses.length; i++) {
				buildVPTree1();
				let currentUserPose = poses[i];
				let closestMatchIndex = findMostSimilarMatch(currentUserPose);
				let closestMatch = poseData[closestMatchIndex];
				poseLabels.push(closestMatch);
				if (i == poses.length - 1){
					finalLabel = getLabel(poseLabels);
					averageConfidence = getAverageConfidence(poseLabels)
					document.getElementById("label").innerHTML = "Classification label: " + finalLabel + " || " + "Confidence Score: " + averageConfidence;
				}
			}
		}
	}));
}

/**
 * Function to get the average confidence score of a video uploaded by a user
 * @param {*} array - Array of poses from user video
 * @returns - Average confidence score
 */
function getAverageConfidence(array){
	let avg = [];
	let average;
	array.forEach((item ) => {
		posesAndConfidence.forEach((element) => {
			if	(element.keypoints.sort().join('|') === item.slice(0,34).sort().join('|')){
				avg.push(element.confidencesSum/element.confidences.length) ;
			}
		});
	})
	average = avg.reduce((a,b) => a + b, 0);
	return average/array.length
}

/**
 * Function to get the label of matched poses
 * @param {*} array - Array of all closest match poses
 * @returns - Most frequent label in the array
 */
function getLabel(array) {
	var dict = {};
	let maxValue = 0;
	let label;

	array.forEach(function (item){
		if (dict[item] == null) {
			dict[item] = 1;
		}
		else {
			dict[item]++;
		}

		if (dict[item] > maxValue) {
			maxValue = dict[item];
			posesAndConfidence.forEach((element) => {
				if	(element.keypoints.sort().join('|') === item.slice(0,34).sort().join('|')){
					label = element.label
				}
			});
		}
	});
	return label;
}


/**
 * Series of functions to load the pose data for the vantage point tree
 */
$.getJSON("S1.json", function(json) {
     data = json ;
});
$.getJSON("CP1.json", function(json) {
	data =  data.concat(json)
});
$.getJSON("N1.json", function(json) {
	data = data.concat(json)
});
$.getJSON("P1.json", function(json) {
	data = data.concat(json)
});
$.getJSON("MS1.json", function(json) {
	data = data.concat(json)
	data.forEach((i) => {
		p = {};
		p.keypoints = i.keypoints.slice(0, 34);
		p.confidences = i.keypoints.slice(34, 51);
		p.confidencesSum = i.keypoints.slice(51, 52) ;
		p.label = i.label;
		posesAndConfidence.push(p);
		poseData.push(i.keypoints.slice(0, 52))
		// poseData.push(p.keypoints)
	})
});

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
function buildVPTree1() {
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

/**
 * Function to draw keypoints and skeleton and webcam video from user
 */
function draw(){
	if (video) { image(video,0,0)}
	if (pose && webcam) {
	  for (let i = 0; i < pose.keypoints.length; i++) {
		let x = pose.keypoints[i].position.x;
		let y = pose.keypoints[i].position.y;
		fill(0,255,0);
		ellipse(x,y,16,16);
	  }

	  for (let i = 0; i < skeleton.length; i++) {
		let a = skeleton[i][0];
		let b = skeleton[i][1];
		strokeWeight(2);
		stroke(255);
		line(a.position.x, a.position.y, b.position.x, b.position.y);
	  }
	}
  }

/**
 * Function to normalise poses
 * @param {*} pose - Pose to be normalised
 * @returns - Normalised pose
 */
function normalisePoseToVector(pose){
	let vectorPoseArray = [];
	let c = 0;

	pose.keypoints.forEach((point) => {
	  const x = point.position.x;
	  const y = point.position.y;
	  poseVector = createVector(x,y);
	  normalised = poseVector.normalize();
	  vectorPoseArray.push(normalised.x)
	  vectorPoseArray.push(normalised.y)
	})

	pose.keypoints.forEach((point) => {
	  const confidence = point.score;
	  c = c + confidence;
	  vectorPoseArray.push(confidence);
	})

	vectorPoseArray.push(c);
	return vectorPoseArray;
}
