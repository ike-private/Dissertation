let img;
let poseNet;
let pose;
let skeleton;
let neuralNetwork;
let targetLabel = 'Normal gait';
let state = 'waiting';


function keyPressed() {
    if (key == 'r') {
      neuralNetwork.normalizeData();
      neuralNetwork.train({epochs: 50}, finished); 
    } else if (key == 's') {
      neuralNetwork.saveData();
    } else {
        targetLabel = key;
        console.log(targetLabel);
        setTimeout(function() {
        console.log('collecting');
        state = 'collecting';
        setTimeout(function() {
          console.log('not collecting');
          state = 'waiting';
        }, 2000);
      }, 1000);
  }
}

// Upload video to get skeleton
function setup(){
  createCanvas(1200,800);
  video = createVideo(['gait1.mp4'], videoReady);
  video.hide();
  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on('pose',gotPoses);

  let options = {
    inputs: 34,
    outputs: 4,
    task: 'classification',
    debug: true
  }
  neuralNetwork = ml5.neuralNetwork(options);
}

function gotPoses(poses){
//   console.log(poses);
  if (poses.length >0) {
    pose = poses[0].pose; 
    skeleton = poses[0].skeleton;
  }
}

function videoReady() {
    video.loop();
    video.volume(0);
}

function modelLoaded(){
  console.log('poseNet ready');
}

function neauralNetworkLoaded() {
    console.log('pose classification ready!');
    classifyPose();
  }

function classifyPose() {
    if (pose) {
      let inputs = [];
      for (let i = 0; i < pose.keypoints.length; i++) {
        let x = pose.keypoints[i].position.x;
        let y = pose.keypoints[i].position.y;
        inputs.push(x);
        inputs.push(y);
      }
      neuralNetwork.classify(inputs, gotResult);
    } else {
      setTimeout(classifyPose, 100);
    }
}

function gotResult(error, results) {  
    if (results[0].confidence > 0.75) {
      poseLabel = 'G';
    }
    classifyPose();
  }
  
function dataReady() {
    neuralNetwork.normalizeData();
    neuralNetwork.train({
      epochs: 50
    }, finished);
  }
  
function finished() {
    console.log('model trained');
    neuralNetwork.save();
    classifyPose();
  }

function gotPoses(poses) {
    // console.log(poses); 
    if (poses.length > 0) {
      pose = poses[0].pose;
      skeleton = poses[0].skeleton;
      if (state == 'collecting') {
        let inputs = [];
        for (let i = 0; i < pose.keypoints.length; i++) {
          let x = pose.keypoints[i].position.x;
          let y = pose.keypoints[i].position.y;
          inputs.push(x);
          inputs.push(y);
        }
      let target = [targetLabel];
      neuralNetwork.addData(inputs, target);
    }
  }
}

function draw(){
  image(video,0,0)
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

