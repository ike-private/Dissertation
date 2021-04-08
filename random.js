const video = document.getElementById("video");

// Create a new poseNet method
const poseNet = ml5.poseNet(video, modelLoaded);

// When the model is loaded
function modelLoaded() {
  console.log("Model Loaded!");
}
// Listen to new 'pose' events
poseNet.on("pose", function(results) {
  poses = results;
});