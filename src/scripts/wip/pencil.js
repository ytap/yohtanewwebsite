const pencilSprite = [
  [0,0,0,0,0,0,1,1],
  [0,0,0,0,0,1,1,1],
  [0,0,0,0,1,1,1,1],
  [0,0,0,1,1,1,1,0],
  [0,0,1,1,1,1,0,0],
  [0,1,1,1,1,0,0,0],
  [1,0,1,1,0,0,0,0],
  [1,1,1,0,0,0,0,0]
];

export class Pencil {
  constructor(gridX, gridY, tileSize) {
    this.gridX = gridX;
    this.gridY = gridY;
    this.tileSize = tileSize;
  }

  interact() {
    dialogue.show(
      ['Theres a pen...', 'I can use it to write something....', 'For what though?'],
      offsetX + this.gridX * this.tileSize + this.tileSize / 2,
      offsetY + this.gridY * this.tileSize,
      0,
      () => {
        this.showChoices();
      }
    );
  }

  showChoices() {
    playPororoSound();
    let container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.top = '50%';
    container.style.left = '50%';
    container.style.transform = 'translate(-50%, -50%)';
    container.style.backgroundColor = '#fff';
    container.style.border = '8px solid #000';
    container.style.padding = '40px';
    container.style.zIndex = '1000';
    container.style.fontFamily = "'TerminalGrotesque', sans-serif";
    container.style.minWidth = '500px';

    let title = document.createElement('p');
    title.innerText = 'For what though?';
    title.style.fontSize = '40px';
    title.style.textAlign = 'center';
    title.style.marginTop = '0';
    title.style.marginBottom = '30px';
    container.appendChild(title);

    let btn1 = document.createElement('button');
    btn1.className = 'pixel-button';
    btn1.innerText = 'Send an email to Yohta';
    btn1.onclick = () => {
      playPororoSound();
      document.body.removeChild(container);
      let text = window.prompt('Enter your message to Yohta:');
      if (text) {
         window.location.href = 'mailto:yohtapublic@gmail.com?subject=Message from WIP Island&body=' + encodeURIComponent(text);
      }
    };
    container.appendChild(btn1);

    let btn2 = document.createElement('button');
    btn2.className = 'pixel-button';
    btn2.innerText = 'Write something for this island';
    btn2.onclick = () => {
      playPororoSound();
      document.body.removeChild(container);
      let text = window.prompt('Enter your message for the island:');
      if (text) {
         dialogue.show(['I wrote something for the island...', '(I will implement the release feature later!)'], width / 2, height / 2, 0);
      }
    };
    container.appendChild(btn2);

    let btn3 = document.createElement('button');
    btn3.className = 'pixel-button';
    btn3.innerText = 'Write something for myself';
    btn3.onclick = () => {
      playPororoSound();
      document.body.removeChild(container);
      let text = window.prompt('Enter your personal note:');
      if (text) {
        let a = document.createElement('a');
        a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(text);
        let now = new Date();
        let y = now.getFullYear();
        let m = String(now.getMonth() + 1).padStart(2, '0');
        let d = String(now.getDate()).padStart(2, '0');
        a.download = y + '_' + m + '_' + d + '.txt';
        a.click();
      }
    };
    container.appendChild(btn3);

    let cancelBtn = document.createElement('button');
    cancelBtn.className = 'pixel-button';
    cancelBtn.innerText = 'Cancel';
    cancelBtn.style.marginTop = '20px';
    cancelBtn.onclick = () => {
      playPororoSound();
      document.body.removeChild(container);
    };
    container.appendChild(cancelBtn);

    document.body.appendChild(container);
  }

  draw() {
    const spriteWidth = pencilSprite[0].length * pixelSize;
    const spriteHeight = pencilSprite.length * pixelSize;
    
    const localOffsetX = this.gridX * this.tileSize + (this.tileSize - spriteWidth) / 2;
    const localOffsetY = this.gridY * this.tileSize + (this.tileSize - spriteHeight) / 2;

    noStroke();
    for (let y = 0; y < pencilSprite.length; y++) {
      for (let x = 0; x < pencilSprite[y].length; x++) {
        if (pencilSprite[y][x] === 1) {
          fill(0);
          rect(localOffsetX + x * pixelSize, localOffsetY + y * pixelSize, pixelSize, pixelSize);
        }
      }
    }
  }
}