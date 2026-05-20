import { Player } from './slime.js';
import { Sign } from './sign.js';
import { Pencil } from './pencil.js';
import { Dialogue } from './dialogue.js';
import { initTextures, renderBackgrounds, pixelSize } from './texture.js';
import { projects } from './projects.js';
import { initSound, playPororoSound, startAudioContext } from './sound.js';
import fontUrl from './terminal-grotesque.ttf';
import { updateWeatherData, spawnBoxWithWind, getCurrentWeather } from './weather.js';
import { ProjectBox } from './projectbox.js';

export function mountSketchInstance(p, containerId = 'canvas-container') {
  
  const tileSize = 52;
  const cols = 9;
  const rows = 9;

  // view mode and icon for switching view (used in mousePressed)
  let viewMode = 0;
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

  // state
  let player;
  let interactables = [];
  let boxes = [];
  let dialogue;

  p.preload = function () {
    
    try {
  p.font = p.loadFont(fontUrl);
  // expose font globally for other modules (e.g., dialogue)
  try { globalThis.customFont = p.font; } catch (e) { /* noop */ }
    } catch (e) {
      // noop
    }

    if (Array.isArray(projects)) {
      projects.forEach((pr) => {
        if (pr.coverUrl) {
          const url = pr.coverUrl && pr.coverUrl.src ? pr.coverUrl.src : pr.coverUrl;
          pr.img = p.loadImage(url);
        }
      });
    }
  };

  p.setup = function () {
  const container = document.getElementById(containerId);
  const w = container ? container.clientWidth : p.windowWidth;
  const h = container ? container.clientHeight : p.windowHeight;
  const canvas = p.createCanvas(w, h);
  canvas.parent(containerId);

    initSound();

    player = new Player(Math.floor(cols / 2), Math.floor(rows / 2), tileSize);

    const sign = new Sign(1, 1, tileSize);
    const pencil = new Pencil(7, 2, tileSize);
    interactables.push(sign, pencil);

    initTextures(cols, rows, tileSize, p.width, p.height);

    dialogue = new Dialogue();
    dialogue.show([
      'welcome to my wip page, here you can randomly encounter my wip projects.',
      'If you want to see a list of my wips, click the arrow on bottom left!'
    ], p.width / 2, p.height * 0.9, 0);

    if (typeof playPororoSound === 'function') playPororoSound();

  globalThis.dialogue = dialogue;

    // update weather immediately and then periodically
    updateWeatherData().then(() => {});
    setInterval(() => updateWeatherData(), 600000);

    // spawn boxes periodically based on weather
    setInterval(() => {
      if (typeof spawnBoxWithWind === 'function') {
        spawnBoxWithWind({
          floor: Math.floor,
          random: p.random.bind(p),
          margin: 4,
          cols: 9,
          rows: 9,
          projects,
          boxes,
          ProjectBox,
          tileSize: 52
        });
      }
    }, 10000);
  };

  p.draw = function () {
    p.background(245);

    if (viewMode === 0) {
      const offsetX = (p.width - cols * tileSize) / 2;
      const offsetY = (p.height - rows * tileSize) / 2;
      renderBackgrounds(offsetX, offsetY);

      p.push();
      p.translate(offsetX, offsetY);

      for (let obj of interactables) {
        if (typeof obj.draw === 'function') obj.draw();
      }

      for (let box of boxes) {
        if (typeof box.draw === 'function') box.draw();
      }

      if (player) {
        if (typeof player.update === 'function') player.update();
        if (typeof player.draw === 'function') player.draw();
      }

      p.pop();

      drawWeatherPanel();
    } else {
      drawListView();
    }

    drawSwitchIcon();

    if (dialogue && typeof dialogue.update === 'function') dialogue.update();
    if (dialogue && typeof dialogue.draw === 'function') dialogue.draw();
  };

  p.windowResized = function () {
    const container = document.getElementById(containerId);
    if (container) {
      p.resizeCanvas(container.clientWidth, container.clientHeight);
      initTextures(cols, rows, tileSize, p.width, p.height);
    }
  };

  
  function getInteractableAt(x, y) {
    for (let obj of interactables) {
      if (obj.gridX === x && obj.gridY === y) {
        return obj;
      }
    }
    for (let box of boxes) {
      if (box.isArrived && box.gridX === x && box.gridY === y) {
        return box;
      }
    }
    return null;
  }

  function tryMove(dx, dy) {
    let nextX = player.x + dx;
    let nextY = player.y + dy;
    let obj = getInteractableAt(nextX, nextY);

    if (obj) {
      player.setPath([], obj);
    } else if (nextX >= 0 && nextX < cols && nextY >= 0 && nextY < rows) {
      player.setPath([p.createVector(nextX, nextY)]);
    }
  }

  p.mousePressed = function () {
    // audio context
    startAudioContext();

    // icon for changing size
    let iconScale = 8;
    let iconSize = switchIcon.length * iconScale;
    let iconX = 20;
    let iconY = p.height - iconSize - 20;

    if (p.mouseX > iconX && p.mouseX < iconX + iconSize && p.mouseY > iconY && p.mouseY < iconY + iconSize) {
      viewMode = 1 - viewMode; // change view mode
      playPororoSound();
      return;
    }

    if (dialogue.isVisible && dialogue.isManual) {
      dialogue.next();
      return; // do the dialogue first
    }

    if (viewMode === 0) {
      let targetGridX = Math.floor((p.mouseX - (p.width - cols * tileSize) / 2) / tileSize);
      let targetGridY = Math.floor((p.mouseY - (p.height - rows * tileSize) / 2) / tileSize);

      if (targetGridX >= 0 && targetGridX < cols && targetGridY >= 0 && targetGridY < rows) {
        let newPath = [];
        let startX = player.isMoving ? player.targetPos.x : player.x;
        let startY = player.isMoving ? player.targetPos.y : player.y;

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
          newPath.push(p.createVector(currentX, startY));
        }

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
            newPath.push(p.createVector(targetGridX, currentY));
          }
        }

        player.setPath(newPath, foundObstacle);
      }
    } else if (viewMode === 1) {
      // List view click handling: check which project was clicked and open link
      let listX = p.width / 4;
      let listY = p.height / 4;
      let paperW = p.width / 2;
      let padding = 40;
      
      let currentY = listY;
      
      for (let i = 0; i < projects.length; i++) {
        let proj = projects[i];
        
        // calculate item height
        let itemHeight = 45;
        if (proj.img) {
          let displayWidth = 180;
          let displayHeight = (proj.img.height / proj.img.width) * displayWidth;
          itemHeight += displayHeight + 20;
        }
        itemHeight += 100;
        
        if (p.mouseX >= listX - padding && p.mouseX <= listX + paperW &&
            p.mouseY >= currentY && p.mouseY < currentY + itemHeight) {
          
          if (proj.link) {
            if (typeof playPororoSound === 'function') playPororoSound();
            window.open(proj.link, '_blank');
          }
          break;
        }
        currentY += itemHeight;
      }
    }
  };

  p.keyPressed = function () {
    if (player.isMoving) return;

    if (p.keyCode === p.LEFT_ARROW) tryMove(-1, 0);
    if (p.keyCode === p.RIGHT_ARROW) tryMove(1, 0);
    if (p.keyCode === p.UP_ARROW) tryMove(0, -1);
    if (p.keyCode === p.DOWN_ARROW) tryMove(0, 1);

    if (p.keyCode === 13) {
      if (typeof spawnBoxWithWind === 'function') {
        spawnBoxWithWind({
          floor: Math.floor,
          random: p.random.bind(p),
          margin: 4,
          cols,
          rows,
          projects,
          boxes,
          ProjectBox,
          tileSize
        });
      }
    }
  };

  function drawSwitchIcon() {
    let iconScale = 8;
    let iconSize = switchIcon.length * iconScale;
    let x = 20;
    let y = p.height - iconSize - 20;

    p.noStroke();
    for (let i = 0; i < switchIcon.length; i++) {
      for (let j = 0; j < switchIcon[i].length; j++) {
        if (switchIcon[i][j] === 1) {
          p.fill(0);
          p.rect(x + j * iconScale, y + i * iconScale, iconScale, iconScale);
        }
      }
    }
  }

  function drawListView() {
    p.push();
    let listX = p.width / 4;
    let listY = p.height / 4;
    let paperW = p.width / 2;
    let paperH = p.height / 2;
    let padding = 40;

    p.noStroke();
    p.fill(0);
    p.rect(listX - padding, listY - padding + pixelSize, paperW, paperH - 2 * pixelSize);
    p.rect(listX - padding + pixelSize, listY - padding, paperW - 2 * pixelSize, paperH);

    p.fill(245);
    p.rect(listX - padding + pixelSize, listY - padding + pixelSize, paperW - 2 * pixelSize, paperH - 2 * pixelSize);

    p.textAlign(p.LEFT, p.TOP);
    p.textFont(p.font);
    p.fill(0);

    let currentY = listY;

    for (let i = 0; i < projects.length; i++) {
      let proj = projects[i];
      p.textSize(32);
      p.text(`${i + 1}. ${proj.title}`, listX, currentY);
      currentY += 45;

      if (proj.img) {
        let displayWidth = 180;
        let displayHeight = (proj.img.height / proj.img.width) * displayWidth;
        p.image(proj.img, listX, currentY, displayWidth, displayHeight);
        currentY += displayHeight + 20;
      }

      p.textSize(22);
      let maxTextWidth = paperW - padding * 2;
      p.text(proj.description, listX, currentY, maxTextWidth);

      currentY += 100;
    }

    p.pop();
  }

  function drawWeatherPanel() {
    const currentWeather = getCurrentWeather();
    if (!currentWeather) return;

    let pWidth = Math.max(220, Math.floor(p.width * 0.2));
    let pHeight = Math.max(140, Math.floor(p.height * 0.15));
    let x = p.width - pWidth - 20;
    let y = 20;

    if (typeof globalThis.woodBg !== 'undefined' && globalThis.woodBg) {
      p.image(globalThis.woodBg, x, y, pWidth, pHeight);
    } else {
      p.fill(139, 90, 43);
      p.rect(x, y, pWidth, pHeight);
    }

    p.noFill();
    p.stroke(0);
    p.strokeWeight(pixelSize);
    p.rect(x, y, pWidth, pHeight);

    p.noStroke();
    p.fill(255);
    p.textFont(p.font);
    p.textAlign(p.LEFT, p.TOP);

    let margin = 15;
    p.textSize(18);
    p.text("It is " + currentWeather.time + " at Providence RI,", x + margin, y + margin);
    p.text("where Yohta is at." , x + margin, y + margin + (pHeight - margin * 2) / 4 * 0.6);

    p.textSize(18);
    p.text(`TEMP: ${currentWeather.temp}C`, x + margin, y + margin + (pHeight - margin * 2) / 4 * 1.6);
    p.text(`SKY: ${currentWeather.condition}`, x + margin, y + margin + (pHeight - margin * 2) / 4 * 2.4);
    p.text(`WIND: ${currentWeather.windDeg}deg`, x + margin, y + margin + (pHeight - margin * 2) / 4 * 3.2);
  }
}
