let img;
let poseNet;
let pose;
let skeleton;
let neuralNetwork;
let state = 'waiting';
let video ;
let poses;
let uploadedVid;
// const fs = require('fs');

function keyPressed() {
    if (key == 't') {
      neuralNetwork.normalizeData();
      neuralNetwork.train({epochs: 100}, finished); 
    } else if (key == 's') {
      neuralNetwork.saveData();
    }
}

// Function to get video from youtube 
// function play(){
//     var url = document.getElementById("path").value;
//     uploadedVid = document.getElementById('show');
//     // innerHTML='<iframe type="text/html"  width="640" height="385"  style="display: none" src="' +url + '" frameborder="0"> </iframe>'
//     uploadedVid.src = url;

//   }

function getExt(filename) {
    return filename.split('.').pop();
}

function run(){
  //play next video without refreshing
  $.ajax({
      url: "data.php",
      success: function(response){
          //refresh data on page
          $('#content').html(response);
      }
  })
};

function setup(){
  createCanvas(1200,800);
  document.getElementById('defaultCanvas0').style.position = 'absolute';
  // var url = document.getElementById("path").value;
   uploadedVid = document.getElementById('show');
  // uploadedVid.src = url;

  var v = uploadedVid.getElementsByClassName('video-stream html5-main-video');
  console.log(v.width);
  // var ctx = c.getContext('2d');
  video = createVideo(v, videoReady);
  // video.hide();
    poseNet = ml5.poseNet(video, modelLoaded);
    poseNet.on('pose',gotPoses);
    draw();

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
  console.log(poses);
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
     setTimeout(function() {
      state = 'waiting', 10000})


      // setTimeout(function() {
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
      //   // After 20 seconds the state will be changed to waiting
      //   setTimeout(function() {
      //     if (state == 'collecting') {
      //     console.log('not collecting');
      //     state = 'waiting'; }
      //   }, 20000);
        
      //   // After 15 seconds status will become collecting 
      // }, 15000);
    
}

function draw(){
  if (video){
    // image(video,0,0)
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
}

