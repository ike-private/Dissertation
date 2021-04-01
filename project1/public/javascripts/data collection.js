// var fs = require("./fs");
// import fs from "fs";
let img;
let poseNet;
let pose;
let skeleton;
let neuralNetwork;
let targetLabel = 'MS gait';
let state = 'waiting';
let i;
// let images = fs.readdirSync('public/images/MS gait frames');


let images = ['ezgif-frame-001.jpg',
    'ezgif-frame-002.jpg',
    'ezgif-frame-003.jpg',
    'ezgif-frame-004.jpg',
    'ezgif-frame-005.jpg',
    'ezgif-frame-006.jpg',
    'ezgif-frame-007.jpg',
    'ezgif-frame-008.jpg',
    'ezgif-frame-009.jpg',
    'ezgif-frame-010.jpg',
    'ezgif-frame-011.jpg',
    'ezgif-frame-012.jpg',
    'ezgif-frame-013.jpg',
    'ezgif-frame-014.jpg',
    'ezgif-frame-015.jpg',
    'ezgif-frame-016.jpg',
    'ezgif-frame-017.jpg',
    'ezgif-frame-018.jpg',
    'ezgif-frame-019.jpg',
    'ezgif-frame-020.jpg',
    'ezgif-frame-021.jpg',
    'ezgif-frame-022.jpg',
    'ezgif-frame-023.jpg',
    'ezgif-frame-024.jpg',
    'ezgif-frame-025.jpg',
    'ezgif-frame-026.jpg',
    'ezgif-frame-027.jpg',
    'ezgif-frame-028.jpg',
    'ezgif-frame-029.jpg',
    'ezgif-frame-030.jpg',
    'ezgif-frame-031.jpg',
    'ezgif-frame-032.jpg',
    'ezgif-frame-033.jpg',
    'ezgif-frame-034.jpg',
    'ezgif-frame-035.jpg',
    'ezgif-frame-036.jpg',
    'ezgif-frame-037.jpg',
    'ezgif-frame-038.jpg',
    'ezgif-frame-039.jpg',
    'ezgif-frame-040.jpg',
    'ezgif-frame-041.jpg',
    'ezgif-frame-042.jpg',
    'ezgif-frame-043.jpg',
    'ezgif-frame-044.jpg',
    'ezgif-frame-045.jpg',
    'ezgif-frame-046.jpg',
    'ezgif-frame-047.jpg',
    'ezgif-frame-048.jpg',
    'ezgif-frame-049.jpg',
    'ezgif-frame-050.jpg',
    'ezgif-frame-051.jpg']


async function keyPressed() {
    if (key == 'r') {
        neuralNetwork.normalizeData();
        neuralNetwork.train({epochs: 50}, finished);
    } else if (key == 's') {
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


async function preload() {
    // let array = ['MS gait frames/ezgif-frame-001.jpg','MS gait frames/ezgif-frame-002.jpg']
    for (i = 0; i < images.length ; i++) {
        img = loadImage('MS gait frames/' + images[i]);
        await delay(2000);
        setup();
    }
}
// Upload video to get skeleton
function setup(){
    createCanvas(1200,800);
    poseNet = ml5.poseNet('single', modelLoaded);

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
    poseNet.singlePose(img,gotPoses);
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

function gotResult(error, results) {
    if (results[0].confidence > 0.75) {
        poseLabel = 'G';
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

function gotPoses(poses) {
    // console.log(poses);
    if (poses.length > 0) {
        pose = poses[0].pose;
        skeleton = poses[0].skeleton;
        let inputs = [];
        for (let i = 0; i < pose.keypoints.length; i++) {
            let x = pose.keypoints[i].position.x;
            let y = pose.keypoints[i].position.y;
            inputs.push(x);
            inputs.push(y);
        }
        let target = [targetLabel + " " + i];
        console.log(inputs + ' ' + target);
        neuralNetwork.addData(inputs, target);

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

