// Box dot...!
const boxSprite = [
  [0,0,0,0,0,0,0,0,0,0],
  [0,0,1,1,1,1,1,1,0,0],
  [0,1,0,0,0,0,0,0,1,0],
  [1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1],
  [0,0,0,0,0,0,0,0,0,0]
];

class Box {
  constructor(linkUrl, spawnGridX, spawnGridY, windSpeed, windDirection, tileSize) {
    this.url = linkUrl;
    this.tileSize = tileSize;
    
    this.gridX = spawnGridX;
    this.gridY = spawnGridY;
    
    // Goal
    this.targetGridX = spawnGridX;
    this.targetGridY = spawnGridY;
    
    // Movement
    this.currentPos = createVector(this.gridX * tileSize, this.gridY * tileSize);
    
    // Change direction to rad, calculate vector
    let rad = radians(windDirection);
    let vx = -sin(rad); 
    let vy = cos(rad);  
    
    // Vector movement
    this.stepX = Math.round(vx);
    this.stepY = Math.round(vy);
    
    // If it's 0, 0, make it slightly move
    if (this.stepX === 0 && this.stepY === 0) {
       this.stepX = vx > 0 ? 1 : -1;
    }

    // Same movement system as slime
    this.isMoving = false;
    this.moveProgress = 0;
    
    // Wind speed = how much you move per frame
    this.moveSpeed = constrain(windSpeed * 0.01, 0.02, 0.1); 
    this.isArrived = false;
  }

update() {
    if (this.isArrived) return; // if arrived, don't move

    if (this.isMoving) {
      this.moveProgress += this.moveSpeed;

      // Per each movement
      if (this.moveProgress >= 1.0) {
        this.isMoving = false;
        this.moveProgress = 0;
        this.gridX = this.targetGridX;
        this.gridY = this.targetGridY;
        this.currentPos.x = this.gridX * this.tileSize;
        this.currentPos.y = this.gridY * this.tileSize;

        // If you are in island, stop
        if (this.gridX >= 0 && this.gridX < cols && this.gridY >= 0 && this.gridY < rows) {
          this.isArrived = true;
        }
      } else {
        // lerp while moving
        this.currentPos.x = lerp(this.gridX * this.tileSize, this.targetGridX * this.tileSize, this.moveProgress);
        this.currentPos.y = lerp(this.gridY * this.tileSize, this.targetGridY * this.tileSize, this.moveProgress);
          
        // wave animation
        let waveHeight = sin(this.moveProgress * PI) * 5;
        this.currentPos.y -= waveHeight;
      }
    } else {
      // If stopping, reference wind and create goal
      this.targetGridX = this.gridX + this.stepX;
      this.targetGridY = this.gridY + this.stepY;
      this.isMoving = true;
    }
  }

draw() {
    const spriteWidth = boxSprite[0].length * pixelSize;
    const spriteHeight = boxSprite.length * pixelSize;

    // set in center of tile
    const offsetX = floor((this.currentPos.x + (this.tileSize - spriteWidth) / 2) / pixelSize) * pixelSize;
    const offsetY = floor((this.currentPos.y + (this.tileSize - spriteHeight) / 2) / pixelSize) * pixelSize;
    noStroke();
    for (let y = 0; y < boxSprite.length; y++) {
      for (let x = 0; x < boxSprite[y].length; x++) {
        if (boxSprite[y][x] === 1) {
          fill(0); 
          rect(offsetX + x * pixelSize, offsetY + y * pixelSize, pixelSize, pixelSize);
        }
      }
    }
  }
}