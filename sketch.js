var video;

function setup() {
  // createCanvas(500, 500);
  video = createVideo('gait1.mp4', videoReady);
  // video.hide();
  console.log(video.src);
  
}

function draw() {
  image(video, 0, 0, width, height);
}

function videoReady() {
  video.loop();
  video.play();
}