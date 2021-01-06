//Main Document to process all events (need to setup timers and promises but fuck knows how to do that)


let r, g, b; //who cares

const textList = ["hi how r u?", "can u see me?", "ily", "pls dont go", "i miss u", "y do u h8 me?", "copy this statement"]; //should be a json


const clickPlayer = new Tone.Player({ //setup sounds 
  "url" : "sound/click1.mp3",
  "autostart" : false, 
}).toMaster();

const pianoPlayer1 = new Tone.Player({ //setup sounds 
  "url" : "sound/piano_ping1.wav",
  "autostart" : false, 
}).toMaster();

const backgroundPlayer = new Tone.Player({ //setup sounds 
  "url" : "sound/amarrage.wav",
  "autostart" : false, 
  "loop" : true,
}).toMaster();

let listLength;
let in_action;
let mode; 

var message = [];
var message2 = []

let capture = null;
let tracker = null;
let positions = null;
let w = 0, h = 0;

function setup() {

  createCanvas(this.windowWidth, this.windowHeight);
  
  r = 255;
  g = 255;
  b = 255;
  

  //setup text font for auto-typed content

  background(10);
  

  strokeWeight(.01);
  stroke(255, 255, 255);
  fill(255,255,255);

  in_action = false;
  
  listLength = textList.length - 1;
  mode = 3;

  w = windowWidth;
  h = windowHeight;
  capture = createCapture(VIDEO);
  createCanvas(w, h);
  capture.size(w, h);
  capture.hide();

  frameRate(10);
  background(10);

  tracker = new clm.tracker();
  tracker.init();
  tracker.start(capture.elt);

  textSize(100);
  textAlign(LEFT, LEFT);
  textFont('courier new');

}

function draw() {

  

  if (mode == 0){
    colorMode(RGB);
    
    strokeWeight(.01);
    stroke(255, 255, 255);
    fill(255,255,255);

    clearCanvas();
    showMode();
    
  }

  if (mode == 1){
    colorMode(RGB);
    strokeWeight(.01);
    stroke(255, 255, 255);
    fill(255,255,255);

    clearCanvas();
    showMode();
    textAlign(CENTER);

    text(message.join(""), this.windowWidth/2, centerHeight());
    
  }


  if (mode ==2){
    colorMode(RGB);
    strokeWeight(.01);
    stroke(255, 255, 255);
    fill(255,255,255);
    

    clearCanvas();
    showMode();
    textAlign(LEFT);

    text(message2.join(""), centerWidth(message2.length), centerHeight());
    
    
  }

  if (mode == 3){
    
    translate(w, 0);
    colorMode(RGB)
    noFill();
    background(10);
    strokeWeight(1);
    showMode();

    colorMode(HSB);


    
    scale(-1, 1);
  // Uncomment the line below to see the webcam image (and no trail)
    //image(capture, 0, 0, w, h);
    positions = tracker.getCurrentPosition();

  if (positions.length > 0) {

    // Eye points from clmtrackr:
    // https://www.auduno.com/clmtrackr/docs/reference.html
    const eye1 = {
      outline: [23, 63, 24, 64, 25, 65, 26, 66].map(getPoint),
      center: getPoint(27),
      top: getPoint(24),
      bottom: getPoint(26)
    };
    const eye2 = {
      outline: [28, 67, 29, 68, 30, 69, 31, 70].map(getPoint),
      center: getPoint(32),
      top: getPoint(29),
      bottom: getPoint(31)
    }
    
    const irisColor = color(50, 80, 80, 0.4);
    drawEye(eye1, irisColor);
		drawEye(eye2, irisColor);
  }

  }


  
}




// When the user clicks the mouse
function mousePressed() {

  backgroundPlayer.start();
  
}



function keyPressed() {

  if (key == 'Enter') {
    
    if (mode == 1) {
      message = [];
    }

    if (mode == 2) {
      temp = textList[int(random(0,textList.length))];
      message2 = temp.split('');
    }
    clearCanvas();
    pianoPlayer1.start();

    

  }

  if (key == 'End') {
    mode += 1;
    message = [];

    temp = textList[int(random(0,textList.length))];
    message2 = temp.split('');

    if (mode > 3) {
      mode = 0;
    }
    clearCanvas();
    pianoPlayer1.start();
  }


  if (mode == 0) { //automatic typing mode (for developer purposes)
    if (key == 'Q') {
      autotype();
    }
  }
  
  if (mode == 1) { //typing in text from user

    if (key == 'Backspace') {
      if (message.length) {
        clickPlayer.start();
      }
      message.pop();
    } 
    

  }
   
  if (mode == 2) { //copying statement

    
  }
}

function keyTyped(){

  if(in_action == false) {

    if (mode == 1) { //free typing
      
      if (key) {
        typeLetter(key[0]);
        
      } 
    }

    if (mode == 2) { //copy text
      if (key[0][0] == message2[0]) {
        makeAction();
        
        message2.shift();
        clickPlayer.start();
        setTimeout(notAction, 200);
      }

    }
  }
}



function typeLetter(keyLetter) {

  if (in_action == false) {

    makeAction();
    
    if (keyLetter) {
      clickPlayer.start();
      message.push(keyLetter);
      
    }
    
    setTimeout(notAction, 200);

  }
}

function autotype() {
  if (in_action == false) {
  
    clearCanvas();
    makeAction(); //start action
    sentence = textList[int(random(0,textList.length))];
    typeWriter(sentence, 0, centerWidth(sentence.length), centerHeight(), 200);
    setTimeout(notAction, 2000);
  }
}

//types words onto screen (takes position x, y)
function typeWriter(sentence, n, x, y, speed) {
    if (n < (sentence.length)) {
      if (sentence[n] != " "){
        clickPlayer.start()
      }
      text(sentence.substring(0, n+1), x, y);
      n++;
      setTimeout(function() {
        typeWriter(sentence, n, x, y, random(100, speed+30))
      }, speed);
    } 
}




////////////////////////////////////////////////////////////////////////////////////// Helper functions

function centerWidth(length) { //calculates approximately the center of the canvas 
  if (length == 1) {
    return this.windowWidth/2
  }
  return (this.windowWidth/2) - (50 * length/2);
}

function centerHeight() {return this.windowHeight/2;}

function notAction() {
  in_action = false;
}

function makeAction() {
  in_action = true; 
  
}

function clearCanvas() {
  makeAction();
  clear();
  colorMode(RGB);
  background(10);
  notAction();

}

function showMode() { //for debugging process
  textAlign(LEFT);
  text(mode, 60, 60);
}

function getPoint(index) {
  return createVector(positions[index][0], positions[index][1]);
}

function drawEye(eye, irisColor) {
  colorMode(HSB);
  noFill();
  stroke(255, 0.4);
  drawEyeOutline(eye);
  
  const irisRadius = min(eye.center.dist(eye.top), eye.center.dist(eye.bottom));
  const irisSize = irisRadius * 2;
  noStroke();
  fill(irisColor);
  ellipse(eye.center.x, eye.center.y, irisSize, irisSize);
  
  const pupilSize = irisSize / 3;
  fill(0, 0.6);
  ellipse(eye.center.x, eye.center.y, pupilSize, pupilSize);
}

function drawEyeOutline(eye) {
  beginShape();
  colorMode(HSB);
  const firstPoint = eye.outline[0];
  eye.outline.forEach((p, i) => {
    curveVertex(p.x, p.y);
    if (i === 0) {
      // Duplicate the initial point (see curveVertex documentation)
      curveVertex(firstPoint.x , firstPoint.y );
    }
    if (i === eye.outline.length - 1) {
      // Close the curve and duplicate the closing point
      curveVertex(firstPoint.x , firstPoint.y );
      curveVertex(firstPoint.x , firstPoint.y );
    }
  });
  endShape();
}

function windowResized() {
  w = windowWidth;
  h = windowHeight;
  resizeCanvas(w, h);
  background(10);
}
