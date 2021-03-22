let img;
let poseNet;
let pose;
let skeleton;
let neuralNetwork;
let state = 'waiting';
let video ;
let poses;
// const fs = require('fs');

function keyPressed() {
    if (key == 't') {
      neuralNetwork.normalizeData();
      neuralNetwork.train({epochs: 100}, finished); 
    } else if (key == 's') {
      neuralNetwork.saveData();
    }
}

function stateCollecting(){
        if (state != 'collecting') {
        setTimeout(function() {
          console.log('collecting');
          state = 'collecting';
          setTimeout(function() {
            console.log('not collecting');
            state = 'waiting';
          }, 20000);
        }, 15000);
      }
}

function getExt(filename) {
    return filename.split('.').pop();
}

function setup(){
  createCanvas(640, 480);
  var files = ['MS Gait.mp4','gait2.mp4'];
  files.forEach((item) => { 
    if (getExt(item) == 'mp4' && state != 'collecting') {
        console.log(item);
        video = createVideo(item, videoReady);
        video.hide();
        poseNet = ml5.poseNet(video, modelLoaded);
        state = 'collecting';
        poseNet.on('pose', (results) => {gotPoses(results, item)});
        console.log(state);
    }   
  });

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
    poseLabel = results[0].label.toUpperCase();
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

async function gotPoses(poses, label) {
    //   if (poses.length > 0) {
    //     pose = poses[0].pose;
    //     skeleton = poses[0].skeleton;
    //     if (state == 'collecting') {
    //       let inputs = [];
    //       for (let i = 0; i < pose.keypoints.length; i++) {
    //         let x = pose.keypoints[i].position.x;
    //         let y = pose.keypoints[i].position.y;
    //         inputs.push(x);
    //         inputs.push(y);
    //       }
    //       let target = [label];
    //       console.log(target)
    //       neuralNetwork.addData(inputs, target);
    //     }
    //  }
    //  setTimeout(function() {
    //   state = 'waiting', 10000})


      setTimeout(function() {
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
            let target = [label];
            console.log(target)
            neuralNetwork.addData(inputs, target);
          }
       }
        // After 20 seconds the state will be changed to waiting
        setTimeout(function() {
          if (state == 'collecting') {
          console.log('not collecting');
          state = 'waiting'; }
        }, 20000);
        
        // After 15 seconds status will become collecting 
      }, 15000);
    
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

