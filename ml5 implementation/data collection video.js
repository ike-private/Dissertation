var videoTag = document.getElementById('vid');
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
let video = null;
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
  createCanvas(1000,600);  
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
  const fileSelector = document.getElementById('file-selector');
  fileSelector.onchange = async function (event) {
      const fileList = event.target.files;
      for(let i = 0; i < fileList.length ; i++ ) {
          // console.log(fileList[i].name);
          videoElement = document.createElement('video');
          videoElement.setAttribute('id','video');
          videoTag.appendChild(videoElement);
          video = document.getElementById('video');
          video.setAttribute('src', fileList[i].webkitRelativePath )
          await delay(2000);
          video.addEventListener('loadeddata' , await playVideo(video))
          // await delay(2500);
          state = 'waiting'; 
          console.log(state);
          videoTag.removeChild(videoTag.childNodes[0]); 
      }
      console.log('finished');
  }   
}

async function playVideo(video) {
      video.width = 1000;
      video.height = 600;
      // await delay(200);
      video.play();
    //  video = createCapture(VIDEO);
      state = 'collecting';
      console.log(state);
      poseNet = ml5.poseNet(video, modelLoaded);
      poseNet.on('pose', gotPoses);  
      if (Number.isInteger(video.duration )){
        await delay(video.duration * 1000);
      }
      else {
        await delay(2000);
      }
      // state = 'waiting'; 



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
      console.log(count);
      }
  }
}

// function draw(){
//   if (video) { image(video,0,0)}
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
