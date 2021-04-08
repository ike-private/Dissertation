// python3 -m http.server run  local server
let video;
let poseNet;
let pose;
let skeleton;
let confidence;
let gaitType;
let total = 0;
let state = "not collecting";
let label;
let max = 0;

let neuralNetwork;
let poseLabel;
var collectedPoses = [];
var averages = [];

function keyPressed() {
  if (key == 'r') {
  setTimeout(function() {
    console.log('collecting');
    state = 'collecting';
    setTimeout(function() {
      console.log('not collecting');
      state = 'waiting';
    }, 3000);
  }, 1000);
  }
}

function setup() {
  createCanvas(1000,2000);
  // video = createCapture(VIDEO);
  // video = createVideo(['Videos/gait1.mp4'], videoReady);
  // video.hide();
  img = loadImage('Post-stroke gait /ezgif-3-f0ccd1b37abf-jpg/ezgif-frame-011.jpg');
  poseNet = ml5.poseNet('single', modelLoaded);
  poseNet.on('pose', gotPoses);

  let options = {
    inputs: 34,
    outputs: 4,
    task: 'classification',
    debug: true
  }
  neuralNetwork = ml5.neuralNetwork(options);
  const modelInfo = {
    model: 'model/model.json',
    metadata: 'model/model_meta.json',
    weights: 'model/model.weights.bin',
  };
  neuralNetwork.load(modelInfo, NNLoaded);
}

function NNLoaded() {
  console.log('pose classification ready!');
  classifyPose();
}


// Classifies all inputs from the video in comparison to those collected 
function classifyPose() {
  console.log('classify Pose')
  if (pose) {
    let inputs = [];
        for (let i = 0; i < pose.keypoints.length; i++) {
        let x = pose.keypoints[i].position.x;
        let y = pose.keypoints[i].position.y;
        inputs.push(x);
        inputs.push(y);
        }
        neuralNetwork.classify(inputs, collectResult);
  }else {
    setTimeout(classifyPose, 1000);
  }
}

// Function to collect all the results into an array of poses 
function collectResult(error, result) {
  console.log(result[0].label);
    collectedPoses.push(result);
}

function gotResult() {
  console.log('Got results function');
  //Loop through all collected poses 
  for (let i = 0; i < collectedPoses.length; i++) {
    label = collectedPoses[i][0].label;
    confidence = collectedPoses[i][0].confidence; 
    index  = averages.findIndex(p => p.key == label);
    // If the label already exists in the array, collect and calculate its confidence 
    if (index != -1) {
      averages[index].cumulativeConfidence +=  confidence ; 
      averages[index].count += 1 ;
      averages[index].averageConfidence = averages[index].cumulativeConfidence / averages[index].count;
    }
    // if the label is not in the array, add it to the array of labels 
    else {
      averages.push({
        key: label,
        // add the value of its confidence to the total of that label 
        cumulativeConfidence: confidence,
        // count the number of times that label exists 
        count: 1})
    }
  }
  console.log(averages);

  // Finds the largest confidence score
  for (let i = 0; i < averages.length; i++) {
      confidence = averages[index].averageConfidence;
      if (confidence > max) {
          max = confidence
      }
  }

  // Assigns a label to the largest confidence score 
  if (max > 0.85) {
      index  = averages.findIndex(p => p.averageConfidence == max);
      poseLabel = averages[index].key;
  }
      console.log(poseLabel)
}

// Checks the state to see if it should classify the poses or display results
function gotPoses(poses) {
  if (poses.length > 0) {
      pose = poses[0].pose;
      skeleton = poses[0].skeleton;
      classifyPose();
  }
  else if (state == 'waiting') {
      gotResult();
      state = "not collecting";
  }
}

function modelLoaded() {
  console.log('poseNet ready');
  poseNet.singlePose(img);
}

function draw(){
  image(img,0,0)
  if (pose) {
    // key points in skeleton 
    for (let i = 0; i < pose.keypoints.length; i++) {
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      fill(0,255,0);
      ellipse(x,y,16,16);
    }

    // Lines in skeleton
    for (let i = 0; i < skeleton.length; i++) {
      let a = skeleton[i][0];
      let b = skeleton[i][1];
      strokeWeight(2);
      stroke(255);
      line(a.position.x, a.position.y, b.position.x, b.position.y);
    }
  }
}

  