// Slime dots
const slimeSprite = [
  [0,0,0,1,1,1,1,0,0,0],
  [0,0,1,0,0,0,0,1,0,0],
  [0,1,0,0,0,0,0,0,1,0],
  [1,0,0,1,0,0,1,0,0,1],
  [1,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,1],
  [0,1,1,1,1,1,1,1,1,0]
];

export class Player {
  constructor(startX, startY, tileSize) {
    this.tileSize = tileSize;
    this.x = startX;
    this.y = startY;
    
    this.currentPos = createVector(this.x * tileSize, this.y * tileSize);
    this.targetPos = createVector(this.x, this.y);
    
    this.isMoving = false;
    this.moveProgress = 0;
    this.moveSpeed = 0.1;
    this.path = [];
    this.targetInteractable = null;
  }

  // Path planning
  setPath(newPath, targetInteractable = null) {
    this.path = newPath;
    this.targetInteractable = targetInteractable;
    if (!this.isMoving && this.path.length > 0) {
      this.startNextStep();
    } else if (!this.isMoving && this.path.length === 0 && this.targetInteractable) {
      this.targetInteractable.interact();
      this.targetInteractable = null;
    }
  }

  // Start movement
  startNextStep() {
    let nextStep = this.path.shift();
    this.targetPos.x = nextStep.x;
    this.targetPos.y = nextStep.y;
    this.isMoving = true;
    currentSessionBounces++; // counts bounces hehe
    playJumpSound(); // in sketch.js
  }

  update() {
    if (this.isMoving) {
      this.moveProgress += this.moveSpeed;

      if (this.moveProgress >= 1.0) {
        // One box
        this.isMoving = false;
        this.moveProgress = 0;
        this.x = this.targetPos.x;
        this.y = this.targetPos.y;
        this.currentPos.x = this.x * this.tileSize;
        this.currentPos.y = this.y * this.tileSize;

        // Keep going
        if (this.path.length > 0) {
          this.startNextStep();
        } else {
          if (this.targetInteractable) {
            this.targetInteractable.interact();
            this.targetInteractable = null;
          }
        }
      } else {
        // While moving
        this.currentPos.x = lerp(this.x * this.tileSize, this.targetPos.x * this.tileSize, this.moveProgress);
        this.currentPos.y = lerp(this.y * this.tileSize, this.targetPos.y * this.tileSize, this.moveProgress);
          
        let jumpHeight = sin(this.moveProgress * PI) * 20;
        this.currentPos.y -= jumpHeight;
      }
    }
  }

  draw() {
    const spriteWidth = slimeSprite[0].length * pixelSize;
    const spriteHeight = slimeSprite.length * pixelSize;

    const offsetX = this.currentPos.x + (this.tileSize - spriteWidth) / 2;
    const offsetY = this.currentPos.y + (this.tileSize - spriteHeight) / 2;

    noStroke();
    for (let y = 0; y < slimeSprite.length; y++) {
      for (let x = 0; x < slimeSprite[y].length; x++) {
        if (slimeSprite[y][x] === 1) {
          fill(0); 
          rect(offsetX + x * pixelSize, offsetY + y * pixelSize, pixelSize, pixelSize);
        }
      }
    }
  }
}