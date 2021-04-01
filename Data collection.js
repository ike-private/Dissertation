let img;
let poseNet;
let pose;
let skeleton;
let neuralNetwork;
let targetLabel;
let state = 'waiting';
let i;
let array = [];

async function keyPressed() {
    if (key == 't') {
      console.log('training');
      neuralNetwork.normalizeData();
      neuralNetwork.train({epochs: 50}, finished); 
    } else if (key == 's') {
      console.log('saving');
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

function preload() {
  let options = {
    inputs: 34,
    outputs: 4,
    task: 'classification',
    debug: true
  }
  neuralNetwork = ml5.neuralNetwork(options);
}

function hideUpload() {
  document.getElementById('labelInterface').style.display = 'none';
  document.getElementById('fileInterface').style.display = 'block';
  document.getElementById('returnInterface').style.display = 'block';
  targetLabel = document.getElementById('target-label').value;
  console.log(targetLabel);
}

function returnInterface(){
  document.getElementById('labelInterface').style.display = 'block';
  document.getElementById('fileInterface').style.display = 'none';
  document.getElementById('returnInterface').style.display = 'none';
  state = 'waiting';
  setup();
}


// Upload video to get skeleton
function setup(){

  img = loadImage('MS gait frames/' + 'ezgif-frame-002.jpg');
  const fileSelector = document.getElementById('file-selector');
  fileSelector.onchange = async function (event) {
      const fileList = event.target.files;
      for(let i = 0; i < fileList.length ; i++ ) {
          // console.log(fileList[i].name);
          state = 'collecting';
          console.log(state);
          img = loadImage(fileList[i].webkitRelativePath);
          await delay(2000);
        
          createCanvas(1200,800);
          poseNet = ml5.poseNet('single', modelLoaded);
          poseNet.on('pose',gotPoses);
      }
  }   
}

function videoReady() {
    video.loop();
    video.volume(0);
}

function modelLoaded(){
  console.log('poseNet ready');
  poseNet.singlePose(img);
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

function gotResults(error, results) {
  console.log(results);
  console.log(results[0].label);
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
      console.log(inputs);
      console.log(target);
      neuralNetwork.addData(inputs, target);
      }
  }
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
