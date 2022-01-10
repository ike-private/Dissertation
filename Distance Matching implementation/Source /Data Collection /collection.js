var videoTag = document.getElementById('vid');
let poseNet;
let pose;
let poseArray = {};
let targetLabel;
let state = 'waiting';
let array = [];
let video;
let duration = 3000;

/**
 * Function called to save array of poses into a JSON file when s is pressed on the keyboard 
 */
function keyPressed() {
   if (key == 's') {
      console.log('saving');
      download('poses.json', JSON.stringify(array));
   
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
 * Function to remove the HTML elements for setting a label and set the target label
 */
function removeLabelInterface() {
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
 * The video is passed through PoseNet for the poses to be extracted 
 */
function setup(){
  const fileSelector = document.getElementById('fileInterface');
  fileSelector.onchange = async function (event) {
      const fileList = event.target.files;
      for(let i = 0; i < fileList.length ; i++ ) {
          videoElement = document.createElement('video');
          videoElement.setAttribute('id','video');
          videoTag.appendChild(videoElement);
          video = document.getElementById('video');
          video.setAttribute('src', fileList[i].webkitRelativePath )
          await delay(2000);
          video.addEventListener('loadeddata' , await playVideo(video))
          state = 'waiting'; 
          videoTag.removeChild(videoTag.childNodes[0]); 
      }
      console.log('finished');
  }   
}

/**
 * Callback function when a new video has been created 
 * Video is played and video duration set 
 */
function videoReady() {
    video.play();
    video.volume(0);
    duration = video.duration()
    state = 'collecting';
}

/**
 * Function to play the video for its full duration and posenet to collect poses 
 * @param {*} video - Video uploaded by user 
 */
async function playVideo(video) {
  video.width = 1000;
  video.height = 600;
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
 * Function to process and save collected poses into an array
 * @param pose - Pose collected from posenet
 */
function gotPoses(pose) {
  let normalised ;
  if (pose.length > 0) {
    poseArray = {};
    normalised = normalisePoseToVector(pose[0].pose);

    if(state == 'collecting') {
      poseArray['keypoints'] = normalised ;
      poseArray['label'] =  targetLabel ;
      array.push(poseArray);
    }
  }
}

/**
 * Function to normalise the poses as a vector 
 * @param pose - Pose collected from poseNet
 * @returns - Normalised version of the pose 
 */
function normalisePoseToVector(pose){
  let vectorPoseArray = [];
  let c = 0;

  pose.keypoints.forEach((point) => {
    const x = point.position.x;
    const y = point.position.y;
    poseVector = createVector(x,y);
    normalised = poseVector.normalize();
    vectorPoseArray.push(normalised.x)
    vectorPoseArray.push(normalised.y)
  })

  pose.keypoints.forEach((point) => {
    const confidence = point.score;
    c = c + confidence;
    vectorPoseArray.push(confidence);
  })

  vectorPoseArray.push(c);
  return vectorPoseArray;
}

/**
 * Function to download a file 
 * @param {*} file - file name of the file to be saved 
 * @param {*} text - Text to be saved into the file 
 */
function download(file, text) {
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', file);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}
