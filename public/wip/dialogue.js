class Dialogue {
  constructor() {
    this.messages = [];
    this.currentIndex = 0;
    this.isVisible = false;
    this.targetX = 0;
    this.targetY = 0;
    this.displayTime = 0;
    this.startTime = 0;
    this.isManual = false;
    this.onComplete = null;
  }

  show(msgs, x, y, duration = 0, onComplete = null) {
    if (Array.isArray(msgs)) {
      this.messages = msgs;
    } else {
      this.messages = [msgs];
    }
    
    this.currentIndex = 0;
    this.targetX = x;
    this.targetY = y;
    this.onComplete = onComplete;
    
    if (duration > 0) {
      this.displayTime = duration;
      this.isManual = false;
      this.startTime = millis();
    } else {
      this.isManual = true;
    }
    
    this.isVisible = true;
  }

  next() {
    if (!this.isVisible) return;
    
    this.currentIndex++;
    if (this.currentIndex >= this.messages.length) {
      this.isVisible = false;
      if (this.onComplete) {
        this.onComplete();
        this.onComplete = null;
      }
    } else {
      playPororoSound(); 
    }
  }

  update() {
    if (this.isVisible && !this.isManual && millis() - this.startTime > this.displayTime) {
      this.isVisible = false;
      if (this.onComplete) {
        this.onComplete();
        this.onComplete = null;
      }
    }
  }

  draw() {
    if (!this.isVisible) return;

    push();
    textFont(customFont);
    textSize(40);
    
    let currentMessage = this.messages[this.currentIndex];
    
    let padding = 40;
    let textW = textWidth(currentMessage);
    let boxW = textW + padding * 2;
    let boxH = 100;
    
    let drawX = this.targetX - boxW / 2;
    let drawY = this.targetY - boxH - 24;

    fill(0);
    rect(drawX - pixelSize, drawY - pixelSize, boxW + pixelSize * 2, boxH + pixelSize * 2);
    
    fill(255);
    rect(drawX, drawY, boxW, boxH);
    
    fill(0);
    rect(this.targetX - pixelSize, drawY + boxH, pixelSize * 2, pixelSize * 2);

    fill(0);
    textAlign(CENTER, CENTER);
    text(currentMessage, this.targetX, drawY + boxH / 2 - 4);
    
    if (this.isManual) {
      fill(0);
      let triX = drawX + boxW - 24;
      let triY = drawY + boxH - 24;
      triangle(triX, triY, triX + 16, triY, triX + 8, triY + 8);
    }
    
    pop();
  }
}