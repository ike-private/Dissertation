/**
 * collection.js v1.0
 *
 * The neural network implementation for the abnormal gait identifier application
 * File to collect poses for dataset using posenet
 * Date: 24/05/2021
 */

var videoTag = document.getElementById('vid');
let poseNet;
let pose;
let skeleton;
let neuralNetwork;
let targetLabel;
let state = 'waiting';
let video = null;


/**
 * Function called to save array of poses into a JSON file when s is pressed on the keyboard
 */
function keyPressed() {
   if (key == 's') {
      console.log('saving');
      neuralNetwork.saveData();
  }
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
 * Function to load the nl5 neural network with the neural network options
 */
function preload() {
  createCanvas(1000,600);
  let options = {
    inputs: 34,
    outputs: 5,
    task: 'classification',
    debug: true
  }
  neuralNetwork = ml5.neuralNetwork(options);
}

/**
 * Function to remove the HTML elements for setting a label and set the target label
 */
function hideUpload() {
  document.getElementById('labelInterface').style.display = 'none';
  document.getElementById('fileInterface').style.display = 'block';
  document.getElementById('returnInterface').style.display = 'block';
  targetLabel = document.getElementById('target-label').value;
}

/**
 * Function to return back to the interface for setting a label
 */
function returnInterface(){
  document.getElementById('labelInterface').style.display = 'block';
  document.getElementById('fileInterface').style.display = 'none';
  document.getElementById('returnInterface').style.display = 'none';
  state = 'waiting';
  setup();
}


/**
 * Function to loop through the folder uploaded
 * Each video in the folder is used to create an HTML element for the duration of the video
 */
function setup(){
  const fileSelector = document.getElementById('selectFile');
  fileSelector.onchange = async function (event) {
      const fileList = event.target.files;
      for(let i = 0; i < fileList.length ; i++ ) {
          videoElement = document.createElement('video');
          videoElement.setAttribute('id','video');
          videoTag.appendChild(videoElement);
          video = document.getElementById('video');
          video.setAttribute('src', fileList[i].webkitRelativePath )
          await delay(2000);
          video.addEventListener('loadeddata' , await playVideo(video));
          state = 'waiting';
          videoTag.removeChild(videoTag.childNodes[0]);
      }
      console.log('finished');
  }
}

/**
 * Callback function to play a video and collect the poses using PoseNet
 * @param {} video - Video for poses to be collected from
 */
async function playVideo(video) {
      video.width = 1000;
      video.height = 600;;
      video.play();
      state = 'collecting';
      poseNet = ml5.poseNet(video, modelLoaded);
      poseNet.on('pose', gotPoses);

      if (Number.isInteger(video.duration )){
        await delay(video.duration * 1000);
      }
      else {
        await delay(2000);
      }
}

/**
 * Callback function to inform a user pose net is ready
 */
function modelLoaded(){
  console.log('poseNet ready');
}

/**
 * Function to process and save poses into an array while poses are being collected from a video
 * @param pose - Pose collected from posenet
 */
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
      neuralNetwork.addData(inputs, target);
      }
  }
}
