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
          await delay(1000);
          state = 'collecting';
          console.log(state);
          video = createVideo([fileList[i].webkitRelativePath], videoReady);
          video.hide()
          console.log(duration);
          
        
          createCanvas(1200,600);
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
      poseArray['score'] = normalised.score ;
      poseArray['keypoints'] = normalised.keypoints ;
      poseArray['label'] =  targetLabel ;
      console.log(poseArray);
      array.push(poseArray);
      console.log(array);
      }
  }
}

// function normalisePoseToVector(pose){
// 	let count = 0;
// 	let poseVector;
// 	let poseVectorXY = [];
// 	let array = {};
// 	let position = {};
// 	let normalised;
// 	let poseVectorArray = {};
// 	pose.keypoints.forEach((point) => {
// 		array = {};
// 		const x = point.position.x;
// 		const y = point.position.y;
// 		poseVector = createVector(x,y);
// 		normalised = poseVector.normalize();
// 		position['x'] = normalised.x;
// 		position['y'] = normalised.y;
//         // console.log(JSON.stringify(poses[0].pose));
// 		array['part'] = point.part;
// 		array['position'] = position;
// 		array['score'] =  point.score;
// 		// console.log(array);
// 		poseVectorXY.push(array);
// 		count++;
// 	})
// 	poseVectorArray['score'] = pose.score;
// 	poseVectorArray['keypoints'] = poseVectorXY;
// // poseVectorArray[num] = poseVectorXY;
// // num++
// 	return poseVectorArray;
// }

function normalisePoseToVector(pose){
  pose.keypoints.forEach((point) => {
    const x = point.position.x;
    const y = point.position.y;
    poseVector = createVector(x,y);
    normalised = poseVector.normalize();
    point.position['x'] = normalised.x
    point.position['y'] = normalised.y
  })
    return pose;
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
