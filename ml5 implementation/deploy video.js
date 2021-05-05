// python3 -m http.server run  local server
var video = document.getElementById('video');
video.width = 1000;
video.height = 600;
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


function setup() {
  createCanvas(1000,600);
  video.addEventListener('loadeddata' , () =>{
//  video = createCapture(VIDEO);
  // video = createVideo(['./N12.mp4'], videoReady);
  console.log('video loaded');
  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on('pose', gotPoses);  
  })
  let options = {
    inputs: 34,
    outputs: 5,
    task: 'classification',
    debug: true
  }
  // ignore points with low confidence score 
  neuralNetwork = ml5.neuralNetwork(options);

  const modelInfo = {
    model: 'model/model.json',
    metadata: 'model/model_meta.json',
    weights: 'model/model.weights.bin',
  };
  neuralNetwork.load(modelInfo, NNLoaded);
}

function videoReady() {
    video.hide();
    video.loop();
    video.volume(0);
}

function NNLoaded() {
  console.log('pose classification ready!');
  classifyPose();
}

function delay(time){
  return new Promise((resolve, reject) => {
    if( isNaN(time)){
      reject(new Error('Delay requires a valid number'));
    } else {
      setTimeout(resolve, time);
    }
  });
}

// Once the r key is pressed, the poses will be collected for a set time 
async function keyPressed() {
    if (key == 'r') {
      video.play();
      state = 'collecting';
      console.log('collecting')
      // poseNet = ml5.poseNet(video, modelLoaded);
      // poseNet.on('pose', gotPoses);  

      await delay(video.duration * 1000);
      state = 'waiting'; 
      console.log('waiting');
  }
}

// Classifies all inputs from the video in comparison to those collected 
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

// Function to collect all the results into an array of poses 
function collectResult(error, result) {
    collectedPoses.push(result);
    console.log(collectedPoses);
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
        if (max > 0.7) {
            index  = averages.findIndex(p => p.averageConfidence == max);
            poseLabel = averages[index].key;
        }
            console.log(poseLabel)
}

// Checks if the state of to see if it should classify the poses or display results
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


function modelLoaded() {
  console.log('poseNet ready');
}

// function draw(){
//   if(video)image(video,0,0)
//   if (pose) {
//     // key points in skeleton 
//     for (let i = 0; i < pose.keypoints.length; i++) {
//       let x = pose.keypoints[i].position.x;
//       let y = pose.keypoints[i].position.y;
//       fill(0,255,0);
//       ellipse(x,y,16,16);
//     }

//     // Lines in skeleton
//     for (let i = 0; i < skeleton.length; i++) {
//       let a = skeleton[i][0];
//       let b = skeleton[i][1];
//       strokeWeight(2);
//       stroke(255);
//       line(a.position.x, a.position.y, b.position.x, b.position.y);
//     }
//   }
// }

  