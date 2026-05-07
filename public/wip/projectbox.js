
class ProjectBox extends Box {
  constructor(projectData, spawnGridX, spawnGridY, windSpeed, windDirection, tileSize) {
    super(projectData.link, spawnGridX, spawnGridY, windSpeed, windDirection, tileSize);
    this.project = projectData;
    this.iconRes = 10; // logo res
  }

  draw() {
    const spriteWidth = this.iconRes * pixelSize;
    const spriteHeight = this.iconRes * pixelSize;
    const offsetX = floor((this.currentPos.x + (this.tileSize - spriteWidth) / 2) / pixelSize) * pixelSize;
    const offsetY = floor((this.currentPos.y + (this.tileSize - spriteHeight) / 2) / pixelSize) * pixelSize;

    noStroke();
    // if image exists, sample
    if (this.project.img) {
      let img = this.project.img;
      for (let y = 0; y < this.iconRes; y++) {
        for (let x = 0; x < this.iconRes; x++) {
          let sampleX = floor(map(x, 0, this.iconRes, 0, img.width));
          let sampleY = floor(map(y, 0, this.iconRes, 0, img.height));
          let col = img.get(sampleX, sampleY);
          
          fill(col);
          rect(offsetX + x * pixelSize, offsetY + y * pixelSize, pixelSize, pixelSize);
        }
      }
    }
  }

  // click and show data
  interact() {
    this.showDetails();
  }

  showDetails() {
  }
}