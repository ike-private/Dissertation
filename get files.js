let img;
let poseNet;
let pose;
let skeleton;
let neuralNetwork;
// let video = 'gait.mp4';
let targetLabel = 'Normal gait';
let state = 'waiting';


async function keyPressed() {
    if (key == 'r') {
      neuralNetwork.normalizeData();
      neuralNetwork.train({epochs: 50}, finished); 
    } else if (key == 's') {
      neuralNetwork.saveData();
    } else {
      // wait 5 seconds before collecting 
        await delay(5000);
        state = 'collecting';

        await delay(10000);
        state = 'waiting';
  }
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



// Upload video to get skeleton
function setup(){
  createCanvas(1200,800);
  video = createVideo(['05_1.mp4'], videoReady);
  video.hide();
//   console.log(video.src);
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
    // console.log(poses.length);
    if (poses.length > 0) {
      pose = poses[0].pose;
      skeleton = poses[0].skeleton;
    //   if (state == 'collecting') {
        let inputs = [];
        for (let i = 0; i < pose.keypoints.length; i++) {
          let x = pose.keypoints[i].position.x;
          let y = pose.keypoints[i].position.y;
          inputs.push(x);
          inputs.push(y);
          console.log(inputs); 
        }
      let target = [targetLabel];
      neuralNetwork.addData(inputs, target);
    // }
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

