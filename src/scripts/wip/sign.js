const signSprite = [
  [0,0,0,0,0,0,0,0],
  [0,1,1,1,1,1,1,0],
  [0,1,0,0,0,0,1,0],
  [0,1,0,1,1,0,1,0],
  [0,1,0,0,0,0,1,0],
  [0,1,1,1,1,1,1,0],
  [0,0,0,1,1,0,0,0],
  [0,0,0,1,1,0,0,0]
];

export class Sign {
  constructor(gridX, gridY, tileSize) {
    this.gridX = gridX;
    this.gridY = gridY;
    this.tileSize = tileSize;
  }

  //you can show text here.
  interact() {
    let totalBounces = mockTotalBounces + currentSessionBounces;
    dialogue.show(["Hmm, something is written on this sign...", 'Visitors: ' + mockVisitors + ' Bounces: ' + totalBounces], offsetX + this.gridX * this.tileSize + this.tileSize / 2, offsetY + this.gridY * this.tileSize, 0);
  }
  
  draw() {
    const spriteWidth = signSprite[0].length * pixelSize;
    const spriteHeight = signSprite.length * pixelSize;
    const localOffsetX = this.gridX * this.tileSize + (this.tileSize - spriteWidth) / 2;
    const localOffsetY = this.gridY * this.tileSize + (this.tileSize - spriteHeight) / 2;
    noStroke();
    for (let y = 0; y < signSprite.length; y++) {
      for (let x = 0; x < signSprite[y].length; x++) {
        if (signSprite[y][x] === 1) {
          fill(0);
          rect(localOffsetX + x * pixelSize, localOffsetY + y * pixelSize, pixelSize, pixelSize);
        }
      }
    }
  }
}