/**
 * deloy.js 
 * 
 * Neural network implementation of the abnormal gait identifier 
 * This file deploys the application 
 * 
 * date: 24/05/2021
 */

let poseNet;
let pose;
let skeleton;
let confidence;
let state = "not collecting";
let label;
let max = 0;
let video = null;
let neuralNetwork;
let poseLabel;
var collectedPoses = [];
var averages = [];
let maxConfidence = 0;
let webcam = false;

/**
 * Function called when a user selected to upload a video from their file system 
 * Function loads the video into poseNet
 */
function uploadVideo(){
  video = document.getElementById('video');
  let x = document.getElementById("myFile").value;
  document.getElementById('uploadWebcam').style = "display: none";
  document.getElementById('collectVideoPoses').style = "display: inline";
  video.width = 1000;
  video.height = 600;
  video.src = x.split("fakepath").pop();
  video.addEventListener('loadeddata' , () =>{
      console.log('video loaded');
      poseNet = ml5.poseNet(video, modelLoaded);
      poseNet.on('pose', gotPoses);  
      })
}

/**
 * Function called when a user selects to use their webcam as a video input
 * Loads webcam input into poseNet
 */
function uploadWebcam(){
  webcam = true;
  document.getElementById('uploadVideo').style = "display: none";
  document.getElementById('collectWebcamPoses').style = "display: inline";
  video = createCapture(VIDEO);
  video.hide();
  console.log('webcam loaded');
  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on('pose', gotPoses);  
}

/**
 * Function creates ml5 neural network and loads the trained model as specified 
 */
function setup() {
  createCanvas(1000,600);
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
  neuralNetwork.load(modelInfo, NNLoaded);
}


/**
 * Callback function to begin classification once the neural network has been loaded 
 */
function NNLoaded() {
  console.log('pose classification ready!');
  classifyPose();
}


/**
 * Function to delay the execution of code for a specified amount of time
 * @param {*} time - Time to delay the function by
 * @returns - A promise with the arguments being call back functions if the promise is resolved or rejected
 */
function delay(time){
  return new Promise((resolve, reject) => {
    if( isNaN(time)){
      reject(new Error('Delay requires a valid number'));
    } else {
      setTimeout(resolve, time);
    }
  });
}

/**
 * Function to collect the poses from the video uploaded by the user for the duration of the video 
 */
async function collectVideoPoses() {
      video.play();
      state = 'collecting';
      console.log(state)  

      await delay(video.duration * 1000);
      state = 'waiting'; 
      console.log(state);
}

/**
 * Function to collect poses using a webcam
 */
async function collectWebcamPoses() {
    state = 'collecting';
    console.log('collecting')

    await delay(5000);
    state = 'waiting'; 
    console.log('waiting');
}

/**
 * Function to classify each pose collected from poseNet 
 */
function classifyPose() {
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

/**
 * Callback function to push all the classification results into an array 
 * @param {*} result - Classification result
 * @param {*} error
 */
function collectResult(error,result) {
    collectedPoses.push(result);
}

/**
 * Function to get the classification label of the result with the highest average confidence score
 */
function gotResult() {
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
      // Finds the largest confidence score
      for (let i = 0; i < averages.length; i++) {
          confidence = averages[index].averageConfidence;
          count = averages[index].count;
          if (count > max) {
              max = count;
              maxConfidence = confidence;
      }

      // Assigns a label to the largest confidence score if the confidence score is above 0.5
      if (maxConfidence > 0.5) {
          index  = averages.findIndex(p => p.averageConfidence == maxConfidence);
          poseLabel = averages[index];
      } else {
        poseLabel = 'Unclassifiable';
      }

      document.getElementById("label").innerHTML = "Classification label: " + poseLabel.key+ " | Confidence Score: " + poseLabel.averageConfidence;   
      }
}


/**
 * Function to checks if the state 
 * If state is collecting, collected poses are classified and results are displayed
 */
function gotPoses(poses) {
    if (poses.length > 0 && state == 'collecting') {
        pose = poses[0].pose;
        skeleton = poses[0].skeleton;
        classifyPose();
    }
    else if (state == 'waiting') {
        gotResult();
        video.pause();
        state = "not collecting";
    }
}

/**
 * Callback function to inform user that pose net is successfully loaded 
 */
function modelLoaded() {
  console.log('poseNet ready');
}

/**
 * Function to draw keypoints and skeleton and webcam video from user
 * The final pose label and classification score will also be shown to the user if they select webcam input
 */
function draw(){
  if(video && webcam) image(video,0,0)
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

  if (poseLabel) {
      if (poseLabel.key) {
      fill(255, 0, 255);
      noStroke();
      textSize(50);
      textAlign(CENTER, TOP);
      text("Classification label: " + poseLabel.key , width / 2, height / 2);
      }
      if (poseLabel.averageConfidence) {
        fill(255, 0, 0);
        noStroke();
        textSize(50);
        textAlign(CENTER, BASELINE);
        text(" Confidence score: " + poseLabel.averageConfidence, width / 2, height / 2);
        }
  }
}