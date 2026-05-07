const tileSize = 52;
const cols = 9;
const rows = 9;
const margin = 4;

//for entities
let player;
let boxes = [];
let pencil;

//mock data visitors and bounces
let mockVisitors = 12;
let mockTotalBounces = 312;
let currentSessionBounces = 0;
let sign;

//for dialogue box
let dialogue;
let wasPlayerOnSign = false;

//scale
let offsetX;
let offsetY;

//font variable
let customFont;

// sketch.js top variables
let viewMode = 0; // 0 is island view, 1 is list view
const switchIcon = [
  [0,0,0,1,1,0,0,0,0],
  [0,0,1,0,0,0,1,1,0],
  [0,1,0,0,0,0,1,1,1],
  [1,0,0,0,0,0,0,1,0],
  [1,0,0,0,0,0,0,0,1],
  [0,1,0,0,0,0,0,0,1],
  [1,1,1,0,0,0,0,1,0],
  [0,1,1,0,0,0,1,0,0],
  [0,0,0,0,1,1,0,0,0]
];
let interactables = []; // array for objects

function preload() {
  customFont = loadFont('/wip/terminal-grotesque.ttf');
  //projects
  for (let p of projects) {
    if (p.coverUrl) {
      p.img = loadImage(p.coverUrl);
    }
  }
}

function setup() {
  const canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("canvas-container"); //html so quote
  
  offsetX = (width - cols * tileSize) / 2;
  offsetY = (height - rows * tileSize) / 2;
  
  // player class
  player = new Player(floor(cols / 2), floor(rows / 2), tileSize);

  //sound class
  initSound();

  //objects
  sign = new Sign(1, 1, tileSize);
  pencil = new Pencil(7, 2, tileSize);
  interactables.push(sign);
  interactables.push(pencil);

  //generate background texture
  initTextures(cols, rows, tileSize, width, height);

  dialogue = new Dialogue();
  dialogue.show(['welcome to my wip page, here you can randomly encounter my wip projects.', 'If you want to see a list of my wips, click the arrow on bottom left!'], width / 2, height * 0.9, 0);
  playPororoSound();
  
  //sound for dialogue box
  playPororoSound();


  // box counter for every 10s
  setInterval(() => {
    if (viewMode === 0) { // 島ビューの時のみ発生
      spawnBoxWithWind();
    }
  }, 10000); // 例: 10秒ごとに発生
}

function draw() {
  //draw backgrounds
  renderBackgrounds(offsetX, offsetY);
  
  if (viewMode === 0) {
    // island and slow view
    push();
    translate(offsetX, offsetY);
    
    // Grids only for inside the island
    stroke(0, 10); 
    strokeWeight(pixelSize); 
    
    for (let i = 0; i <= cols; i++) {
      line(i * tileSize, 0, i * tileSize, rows * tileSize);
    }
    for (let j = 0; j <= rows; j++) {
      line(0, j * tileSize, cols * tileSize, j * tileSize);
    }

    //draw entities
    for (let obj of interactables) {
      obj.draw();
    }
    player.update();
    player.draw();

    //draw boxes
    for (let box of boxes) {
      box.update();
      box.draw();
    }
    
    pop();
  } else {
    // draw in list
    drawListView();
  }

  // switch icon
  drawSwitchIcon();
  
  dialogue.update();
  dialogue.draw();
}

// function to check if an object exists at given grid
function getInteractableAt(x, y) {
  for (let obj of interactables) {
    if (obj.gridX === x && obj.gridY === y) {
      return obj;
    }
  }
  return null;
}

function mousePressed() {
  //audio context
  startAudioContext();

  //icon for changing size
  let iconScale = 8;
  let iconSize = switchIcon.length * iconScale;
  let iconX = 20;
  let iconY = height - iconSize - 20;

  if (mouseX > iconX && mouseX < iconX + iconSize && mouseY > iconY && mouseY < iconY + iconSize) {
    viewMode = 1 - viewMode; // change view mode
    playPororoSound(); 
    return;
  }
  
  if (dialogue.isVisible && dialogue.isManual) {
    dialogue.next();
    return; // do the dialogue first
  }

  // only move when in island view
  if (viewMode === 0) {
    // Clicked pixel into grids
    let targetGridX = floor((mouseX - offsetX) / tileSize);
    let targetGridY = floor((mouseY - offsetY) / tileSize);

    //box interaction
    for (let box of boxes) {
      if (box.isArrived && box.gridX === targetGridX && box.gridY === targetGridY) {
        box.interact();
        return; // cutoff movement
      }
    }

    // Checking if it is a grid
    if (targetGridX >= 0 && targetGridX < cols && targetGridY >= 0 && targetGridY < rows) {
      
      // create path, to send to slime.js
      let newPath = [];
      
      // Starting point, and if moving start from targetPos
      let startX = player.isMoving ? player.targetPos.x : player.x;
      let startY = player.isMoving ? player.targetPos.y : player.y;

      // XAxis direction and obstacle check
      let xDir = targetGridX > startX ? 1 : (targetGridX < startX ? -1 : 0);
      let currentX = startX;
      let foundObstacle = null;

      while (currentX !== targetGridX && xDir !== 0) {
        currentX += xDir;
        let obj = getInteractableAt(currentX, startY);
        if (obj) {
          foundObstacle = obj;
          break;
        }
        newPath.push(createVector(currentX, startY));
      }

      // YAxis direction and obstacle check
      let currentY = startY;
      if (!foundObstacle) {
        let yDir = targetGridY > startY ? 1 : (targetGridY < startY ? -1 : 0);
        while (currentY !== targetGridY && yDir !== 0) {
          currentY += yDir;
          let obj = getInteractableAt(targetGridX, currentY);
          if (obj) {
            foundObstacle = obj;
            break;
          }
          newPath.push(createVector(targetGridX, currentY));
        }
      }

      //send to slime.js
      player.setPath(newPath, foundObstacle);
    }
  }
}

// helper function for keyboard movement
function tryMove(dx, dy) {
  let nextX = player.x + dx;
  let nextY = player.y + dy;
  let obj = getInteractableAt(nextX, nextY);
  
  if (obj) {
    player.setPath([], obj);
  } else if (nextX >= 0 && nextX < cols && nextY >= 0 && nextY < rows) {
    player.setPath([createVector(nextX, nextY)]);
  }
}

// if key is pressed, cancel path
function keyPressed() {
  if (player.isMoving) return;

  if (keyCode === LEFT_ARROW) tryMove(-1, 0);
  if (keyCode === RIGHT_ARROW) tryMove(1, 0);
  if (keyCode === UP_ARROW) tryMove(0, -1);
  if (keyCode === DOWN_ARROW) tryMove(0, 1);

  //for demo
  if (keyCode === 13) {
    spawnBoxWithWind(); //use weather.js
  }
}

// for window resize
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  offsetX = (width - cols * tileSize) / 2;
  offsetY = (height - rows * tileSize) / 2;
  initTextures(cols, rows, tileSize, width, height);
}

function drawSwitchIcon() {
  let iconScale = 8;
  let iconSize = switchIcon.length * iconScale;
  let x = 20;
  let y = height - iconSize - 20;

  noStroke();
  for (let i = 0; i < switchIcon.length; i++) {
    for (let j = 0; j < switchIcon[i].length; j++) {
      if (switchIcon[i][j] === 1) {
        fill(0);
        rect(x + j * iconScale, y + i * iconScale, iconScale, iconScale);
      }
    }
  }
}

function drawListView() {
  push();
  // paper back
  let listX = width / 4;
  let listY = height / 4;
  let paperW = width / 2;
  let paperH = height / 2;
  let padding = 40; 

  noStroke();
  fill(0);
  rect(listX - padding, listY - padding + pixelSize, paperW, paperH - 2 * pixelSize);
  rect(listX - padding + pixelSize, listY - padding, paperW - 2 * pixelSize, paperH);

  fill(245);
  rect(listX - padding + pixelSize, listY - padding + pixelSize, paperW - 2 * pixelSize, paperH - 2 * pixelSize);

  // text
  textAlign(LEFT, TOP);
  textFont(customFont); 
  fill(0);
  
  let currentY = listY;

  for (let i = 0; i < projects.length; i++) {
    let proj = projects[i];
    
    // 1. title
    textSize(32);
    text(`${i + 1}. ${proj.title}`, listX, currentY);
    currentY += 45;

    // 2. image
    if (proj.img) {
      let displayWidth = 180;
      let displayHeight = (proj.img.height / proj.img.width) * displayWidth;
      
      image(proj.img, listX, currentY, displayWidth, displayHeight);
      currentY += displayHeight + 20;
    }

    // 3. text
    textSize(22);
    let maxTextWidth = paperW - padding * 2;
    text(proj.description, listX, currentY, maxTextWidth);
    
    currentY += 100; 
  }
  
  pop();
}