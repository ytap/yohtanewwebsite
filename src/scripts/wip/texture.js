// texture.js
export const pixelSize = 4;
let oceanBg;
let sandBg;
let woodBg;

// setup() color
export function initTextures(cols, rows, tileSize, canvasWidth, canvasHeight) {
  oceanBg = createGraphics(canvasWidth, canvasHeight);
  drawOceanTexture(oceanBg);

  sandBg = createGraphics(cols * tileSize, rows * tileSize);
  drawSandTexture(sandBg);

  woodBg = createGraphics(220, 140); // panel size
  drawWoodTexture(woodBg);
}

// draw() each frame
export function renderBackgrounds(offsetX, offsetY) {
  image(oceanBg, 0, 0);
  
  push();
  translate(offsetX, offsetY);
  image(sandBg, 0, 0);
  pop();
}

// Drawing logic
function drawOceanTexture(pg){
  const pixelSize = 4; // same resolution as slime
  pg.noStroke();
  
  for (let y = 0; y < pg.height; y += pixelSize) {
    for (let x = 0; x < pg.width; x += pixelSize) {
      // random white
      if (pg.random() < 0.01) {
        pg.fill(255, 255, 255); 
      } else {
        pg.fill(105, 176, 205);
      }
      pg.rect(x, y, pixelSize, pixelSize);
    }
  }
}

// Drawing sand
function drawSandTexture(pg) {
  pg.noStroke();
  
  for (let y = 0; y < pg.height; y += pixelSize) {
    for (let x = 0; x < pg.width; x += pixelSize) {
      if (pg.random() < 0.9) {
        pg.fill(245, 220, 180); // bright
      } else {
        pg.fill(215, 205, 155); // dark
      }
      pg.rect(x, y, pixelSize, pixelSize);
    }
  }
}


//drawing wood
function drawWoodTexture(pg) {
  pg.noStroke();
  for (let y = 0; y < pg.height; y += pixelSize) {
    for (let x = 0; x < pg.width; x += pixelSize) {
      // base
      let r = 139, g = 90, b = 43;
      let n = noise(x * 0.05, y * 0.01);
      if (n > 0.6) {
        r -= 20; g -= 15; b -= 10;
      } else if (n < 0.3) {
        r += 10; g += 5;
      }
      pg.fill(r, g, b);
      pg.rect(x, y, pixelSize, pixelSize);
    }
  }
}