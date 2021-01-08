
const textList = hello; //should be a json
const commandList = commands;
const questionList = questions;
const answerList = answers;


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

let in_action;
let mode = 0; 
let phase = 1
let havewestarted = false;
let scene = 0;


let userMessage = []; // message input from user
let computerMessage = []; //message input displayed by computer
let overlayMessage = []; //Overlay over Display texted
let iterMessage = []; //iterator for Overlay Displayed Text (to be manipulated for counting)

let capture = null;
let tracker = null;
let positions = null;
let w = 0, h = 0;

let debug = false;

let isCameraOn = false;

function setup() {

  createCanvas(this.windowWidth, this.windowHeight);

  //setup text font for auto-typed content

  background(10);
  

  strokeWeight(.01);
  stroke(255, 255, 255);
  fill(255,255,255);

  in_action = false;
  
  listLength = textList.length - 1;
  mode = 0;
  scene = 0;

  w = windowWidth;
  h = windowHeight;
  capture = createCapture(VIDEO);
  createCanvas(w, h);
  capture.size(w, h);
  capture.hide();

  frameRate(30);
  background(10);

  tracker = new clm.tracker();
  tracker.init();
  tracker.start(capture.elt);

  textSize(100);
  textAlign(LEFT, LEFT);
  textFont('courier new');

  setTimeout(enterAutotype, 3000);

}

function draw() {


  if (mode == 0)
  {
    colorMode(RGB);
    
    strokeWeight(.01);
    stroke(255, 255, 255);
    fill(255,255,255);

    //clearCanvas();
    showMode();
    
  } 
  else if (mode == 1)
  {
    setDrawRGB();
    clearCanvas();
    showMode();
    textAlign(CENTER);

    text(userMessage.join(""), this.windowWidth/2, centerHeight());
    
  } else if (mode ==2)
  {
    setDrawRGB();
    clearCanvas();
    showMode();

    textAlign(RIGHT);
    text(iterMessage.join(""), centerWidthRight(computerMessage.length), centerHeight());

    /////////////////////////////
    textAlign(LEFT);
    stroke(255, 50, 0);
    fill(255,50,0);
    
    text(overlayMessage.join(""), centerWidth(computerMessage.length), centerHeight());


  } else if (mode == 3) 
  {
    setDrawRGB();
    clearCanvas();
    showMode();
    textAlign(CENTER);
    text(overlayMessage.join(""), this.windowWidth/2, centerHeight());

  } else if (mode == 4)
  {
    translate(w, 0);

    colorMode(RGB)
    noFill();
    background(10);
    strokeWeight(1); //makes outlines
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

  //backgroundPlayer.start();
  //console.log(overlayMessage);
}



function keyPressed() {



  if(in_action == false) {

    if (debug) {
      if (key == 'End') { //for debug purposes
        mode += 1;
        resetMessages();
        
        if (mode > 4) {
          mode = 0;
        }
        clearCanvas();
    }
  }

  if (key == 'Enter') {

    if (!havewestarted) {
      backgroundPlayer.start();
      havewestarted = true;
      clearCanvas();

      setTimeout(function(){
        autotype("copy this statement");
      }, 2000)

      setTimeout(function(){
        changeMode(2);
      }, 10000)
      
    }

    if (havewestarted && mode == 0) {
      setTimeout(function(){
        changeMode(2);
      }, 5000)
      sendMessage("copy this statement");
    }
    if (havewestarted && mode == 1) {
      askQuestion();
      scene++;
      userMessage = [];
      pianoPlayer1.start();
    }
    if (havewestarted && mode == 2) {
      if (!iterMessage.length) {
        resetMessages();
        sendMessage(getMessage(commandList, scene));
        scene++
        pianoPlayer1.start();
      }
      
    }
    
  }
  if (debug) {
    if (key == 'End') { //for debug purposes
      mode += 1;
      resetMessages();
      
      if (mode > 4) {
        mode = 0;
      }
      clearCanvas();
  }
}

  
  if (mode == 1) { //typing in text from user

    if (key == 'Backspace') {
      if (userMessage.length) {
        clickPlayer.start();
      }
      userMessage.pop();
    } 
  }
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
      
      if (key[0] == iterMessage[0]) {
        makeAction();
        
        iterMessage.shift();
        overlayMessage.push(key[0][0]);
    
        clickPlayer.start();
        setTimeout(notAction, 200);

      
      }

    }

    if (mode == 3) {
      
      if (!iterMessage.length) { //empty message - must as a new question; 
        
        resetMessages();

        if (scene == answerList.length) {
          nextPhase();
        } else {
          sendMessage(getMessage(answerList, scene)); //this should break into scene4
           askForcedQuestion(); //should type up


        scene ++; //next scene after retrieving from 2 lists
        console.log('tried asking forced question');
        //console.log(overlayMessage);
        pianoPlayer1.start();


        }
        

      } else {

        makeAction();
        temp = iterMessage[0];
        //console.log(overlayMessage);
        overlayMessage.push(temp);
        iterMessage.shift();
        clickPlayer.start();
        setTimeout(notAction, 200);

      }
      
      
      
    }
  }
}



function typeLetter(keyLetter) {

  if (in_action == false) {

    if (mode == 1) {

      makeAction();
      if (keyLetter) {
        clickPlayer.start();
        userMessage.push(keyLetter);
      }
      setTimeout(notAction, 200);

    }

  }
}

function enterAutotype(){
  autotype("Enter");
}

function autotype(sentence) {
  if (in_action == false) {
  
    clearCanvas();
    makeAction(); //start action
    //sentence = textList[int(random(0,textList.length))];
    computerMessage = sentence;
    textAlign(LEFT);
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

function centerWidthRight(length) {
  if (length == 1) {
    return this.windowWidth/2
  }
  return (this.windowWidth/2) + (70 * length/2);
}

function centerHeight() {return this.windowHeight/2;}

function notAction() {in_action = false;}

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

function setDrawRGB() {
    colorMode(RGB);
    strokeWeight(.01);
    stroke(255, 255, 255);
    fill(255,255,255);
}

function resetMessages() {
  userMessage = [];
  //temp = textList[int(random(0,textList.length))];
  //computerMessage = temp.split('');
  //iterMessage = [...computerMessage];
  overlayMessage = [];
  
}

function getMessage(list, sceneIndex) {

  if (sceneIndex == list.length)
  {
    
    nextPhase();
    return "" //no message
  } else if (sceneIndex  < list.length)
  {
    tempMessage = list[sceneIndex];
    return tempMessage

  } 
}


function nextPhase(){
  phase ++;
  scene = 0;
  pianoPlayer1.start();
  if (phase == 1) {
    copyMe();
  } else if (phase == 2) {
    askQuestion();
  } else if (phase == 3) {
    forcefulQuestions();
  } else if (phase == 4) {
    seeIT();
  } else if (phase == 5) {
    phase = 1;
    copyMe();
  }
}

function seeIT() {
  changeMode(4);
}

function copyMe(){
  changeMode(2)
}

function forcefulQuestions(){
  changeMode(3);
}

function showMode() { //for debugging process
  if (debug) {
    textAlign(LEFT);
    text(mode, 60, 60);
  }
}

function sendMessage(sentence) {
  
  if (sentence.length == 0) {
    
  } else
  {
  computerMessage = sentence.split('');
  iterMessage = [...computerMessage];
  overleyMessage = [];
  }
  
}

function askQuestion() {

  changeMode(0); 
  question = getMessage(questionList, scene);
  if (question) {
    autotype(question);
    setTimeout(function(){
      changeMode(1);
    }, 4000)
  }
  
}

function askForcedQuestion() {
  changeMode(0); 
  question = getMessage(questionList, scene);

  if (question) {
    autotype(question);

    setTimeout(function(){
      changeMode(3);
    }, 4000)
  }
}

function getPoint(index) {
  return createVector(positions[index][0] * 3 - w, positions[index][1] * 3 - (3 * h/4));
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
    curveVertex(p.x, p.y );
    if (i === 0) {
      // Duplicate the initial point (see curveVertex documentation)
      curveVertex(firstPoint.x , firstPoint.y );
    }
    if (i === eye.outline.length - 1) {
      // Close the curve and duplicate the closing point
      curveVertex(firstPoint.x , firstPoint.y );
      curveVertex(firstPoint.x  , firstPoint.y );
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

function changeMode(n){ mode = n}


