// var video = document.getElementById('video');
// // let array = [];
// video.addEventListener('loadeddata', async () => {
//                 video.loop = true;
//                 setup();
//               })

//     // For more detailed Posenet setup, please refer its own document.
//     // Load Posenet model
// function setup() {
//     posenet.load().then(function(net) {
//       // Estimate the two poses
//       return Promise.all([
//         net.estimateSinglePose(video),
//       ])
//     }).then(function(poses){
//       // Calculate the weighted distance between the two poses
//       console.log(poses);
//     });

// }

let img;
let poseNet;
let pose;
let poseArray = {};
let skeleton;
let neuralNetwork;
let targetLabel;
let state = 'waiting';
let i;
let array = [];
let count = 0;
let video;
let duration = 3000;

async function keyPressed() {
   if (key == 's') {
      console.log('saving');
        // Start file download.
      console.log(array);
      download('test.json', JSON.stringify(array));
   
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
          createCanvas(1200,600);
          await delay(500);
          console.log(state);
          video = createVideo([fileList[i].webkitRelativePath], videoReady);
          video.hide()
          console.log(duration);
          poseNet = ml5.poseNet(video ,modelLoaded);
          poseNet.on('pose',gotPoses);
          await delay(duration + 1000);
          state = 'waiting';
      }
      console.log('ended');

  }   
}

function videoReady() {
    video.play();
    video.volume(0);
    duration = video.duration()
    state = 'collecting';
}

function modelLoaded(){
  console.log('poseNet ready');
}

function gotPoses(pose) {
  let normalised ;
    if (pose.length > 0) {
      // poseArray = {};
      normalised = normalisePoseToVector(pose[0].pose);
      if(state == 'collecting') {
      poseArray = {};
        // console.log(JSON.stringify(poses[0].pose));
      poseArray['keypoints'] = normalised ;
      poseArray['label'] =  targetLabel ;
      // console.log(poseArray);
      if (!array.includes(poseArray)){
         array.push(poseArray);
         console.log(array);
       }
      }
  }
}

function normalisePoseToVector(pose){
  let vectorPoseArray = [];
  let c = 0;
  // console.log(pose);
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
    // console.log(vectorPoseArray);
    return vectorPoseArray;
  }

function draw(){
  if (video) {
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
}

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
  }
