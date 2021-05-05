let img;
let poseNet;
let pose;
let skeleton;
let neuralNetwork;
let targetLabel;
let state = 'waiting';
let i;
let array = [];
let count = 0;
let video;
let duration;

async function keyPressed() {
   if (key == 's') {
      console.log('saving');
      neuralNetwork.saveData();
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
//   video = createVideo(['normal gait.mov'], videoReady);
  let options = {
    inputs: 34,
    outputs: 4,
    task: 'classification',
    debug: true
  }
  neuralNetwork = ml5.neuralNetwork(options);
}


// Upload video to get skeleton
async function setup(){
          state = 'collecting';
          console.log(state);
          video = createVideo("Normal videos/N8.mp4", videoReady);
          video.hide()
          console.log(video.duration());
          await delay(1000);
          
        
          createCanvas(1000,1200);
          poseNet = ml5.poseNet(video ,modelLoaded);
          poseNet.on('pose',gotPoses);
          await delay(2500); 
}

function videoReady() {
    video.play();
    video.volume(0);
    duration = video.duration()
}

function modelLoaded(){
  console.log('poseNet ready');
//   poseNet.multiPose(img);
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
      count++;
      console.log(inputs +'  ' + target );
      neuralNetwork.addData(inputs, target);
      }
  }
}

function draw(){
  if (video) { image(video,0,0)}
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
