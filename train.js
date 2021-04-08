let neuralNetwork;

function keyPressed() {
    if (key == 's') {
       neuralNetwork.saveData();
     } 
};

function setup() {
  createCanvas(640, 480);
  // video = createCapture(VIDEO);
  // video.hide();
  // poseNet = ml5.poseNet(video, modelLoaded);
  // poseNet.on('pose', gotPoses);

  let options = {
    inputs: 34,
    outputs: 4,
    task: 'classification',
    debug: true
  }
  neuralNetwork = ml5.neuralNetwork(options);
  neuralNetwork.loadData('combo.json', dataReady);
}

function dataReady() {
  neuralNetwork.normalizeData();
  neuralNetwork.train({epochs: 150}, finished); 
}

function finished() {
  console.log('model trained');
  neuralNetwork.save();
}