
if (typeof window !== 'undefined') {
  document.fonts.ready.then(() => {
    const wrapper = document.querySelector('.canvas-wrapper');
    if (!wrapper) return;

    let cssWidth = wrapper.clientWidth;
    const dpr = window.devicePixelRatio || 1;
    const base = 120;
    const range = 255 - base;
    
    const fontSizePx = 32; 
    const startY = 10; 
    const titleAccumulationSpeed = 0.02;
    const lineHeight = fontSizePx * 1.2;

    const titleText = "Yohta Kitagawa";
    const aboutText = "is a Japanese critical media artist. His works aims to reframe existing values and assumptions in technology, through personal and intimate interaction. Yohta's primary mediums are sound and robotics. However, he consistently experiments with various mediums such as games, sculpture, creative coding and choreography. He is currently studying abroad at Brown university.";

    const measureCanvas = document.createElement('canvas');
    const measureCtx = measureCanvas.getContext('2d');
    measureCtx.font = `normal ${fontSizePx}px CothamSans, sans-serif`;
    
    const titleWidth = measureCtx.measureText(titleText + " ").width;
    const words = aboutText.split(' ');
    
    function calculateCanvasHeight(targetWidth) {
      let tempLine = '';
      let currentY = startY;
      let firstLine = true;
      
      for (let n = 0; n < words.length; n++) {
        let testLine = tempLine === '' ? words[n] : tempLine + ' ' + words[n];
        let testWidth = measureCtx.measureText(testLine).width;
        let allowedWidth = firstLine ? targetWidth - titleWidth : targetWidth;

        if (testWidth > allowedWidth && tempLine !== '') {
          tempLine = words[n];
          currentY += lineHeight;
          firstLine = false;
        } else {
          tempLine = testLine;
        }
      }
      return currentY + lineHeight + 5; 
    }

    let canvasHeight = calculateCanvasHeight(cssWidth);

    if (wrapper instanceof HTMLElement) {
      wrapper.style.height = canvasHeight + 'px';
    }

    // TITLE CANVAS
    const titleCanvas = document.getElementById('title-canvas');
    if (!(titleCanvas instanceof HTMLCanvasElement)) return;
    const titleCtx = titleCanvas.getContext('2d');
    if (!titleCtx) return;

    titleCanvas.width = cssWidth * dpr;
    titleCanvas.height = canvasHeight * dpr;
    titleCanvas.style.width = cssWidth + 'px';
    titleCanvas.style.height = canvasHeight + 'px';
    titleCtx.scale(dpr, dpr);

    const titleOffCanvas = document.createElement('canvas');
    titleOffCanvas.width = titleCanvas.width;
    titleOffCanvas.height = titleCanvas.height;
    const titleOffCtx = titleOffCanvas.getContext('2d', { willReadFrequently: true });
    titleOffCtx.scale(dpr, dpr);

    titleOffCtx.font = `normal ${fontSizePx}px CothamSans, sans-serif`;
    titleOffCtx.textAlign = 'left';
    titleOffCtx.textBaseline = 'top';
    titleOffCtx.fillStyle = '#4ac3e1';
    titleOffCtx.fillText(titleText, 0, startY);

    const titleMaskData = titleOffCtx.getImageData(0, 0, titleOffCanvas.width, titleOffCanvas.height).data;
    const titleDisplayData = titleCtx.createImageData(titleOffCanvas.width, titleOffCanvas.height);
    const titleBuffer32 = new Uint32Array(titleDisplayData.data.buffer);
    const titleAccumulation = new Float32Array(titleBuffer32.length);

    let isEffectRunning = true;

    function renderTitle() {
      if (!isEffectRunning) return;
      let isFinished = true;
      for (let i = 0; i < titleBuffer32.length; i++) {
        const maskAlpha = titleMaskData[i * 4 + 3];
        if (maskAlpha > 0) {
          if (titleAccumulation[i] < 1.0) {
            isFinished = false;
            const r = base + Math.random() * range;
            const g = base + Math.random() * range;
            const b = base + Math.random() * range;
            titleAccumulation[i] += Math.random() * titleAccumulationSpeed;
            if (titleAccumulation[i] > 1.0) titleAccumulation[i] = 1.0;
            const acc = titleAccumulation[i];
            const targetR = titleMaskData[i * 4 + 0];
            const targetG = titleMaskData[i * 4 + 1];
            const targetB = titleMaskData[i * 4 + 2];
            const currentR = r * (1 - acc) + targetR * acc;
            const currentG = g * (1 - acc) + targetG * acc;
            const currentB = b * (1 - acc) + targetB * acc;
            const alpha = Math.min(255, Math.floor(acc * maskAlpha));
            titleBuffer32[i] = alpha * 16777216 + Math.floor(currentB) * 65536 + Math.floor(currentG) * 256 + Math.floor(currentR);
          }
        } else {
          titleBuffer32[i] = 0;
        }
      }
      titleCtx.putImageData(titleDisplayData, 0, 0);
      if (!isFinished) requestAnimationFrame(renderTitle);
      else {
        titleCtx.clearRect(0, 0, cssWidth, canvasHeight);
        titleCtx.drawImage(titleOffCanvas, 0, 0, titleOffCanvas.width / dpr, titleOffCanvas.height / dpr);
      }
    }

    // ABOUT CANVAS
    const aboutCanvas = document.getElementById('about-canvas');
    if (!(aboutCanvas instanceof HTMLCanvasElement)) return;
    const aboutCtx = aboutCanvas.getContext('2d');
    if (!aboutCtx) return;
   
    aboutCanvas.width = cssWidth * dpr;
    aboutCanvas.height = canvasHeight * dpr;
    aboutCanvas.style.width = cssWidth + 'px';
    aboutCanvas.style.height = canvasHeight + 'px';
    aboutCtx.scale(dpr, dpr);

    // テキストごとの座標を事前に計算する関数
    function calculateCharPositions(context, text, x, y, maxWidth, lineHeight, initialOffsetX) {
      const positions = [];
      const textWords = text.split(' ');
      let currentX = x + initialOffsetX;
      let currentY = y;
      let firstLine = true;

      for (let n = 0; n < textWords.length; n++) {
        const word = textWords[n];
        const wordWidth = context.measureText(word).width;
        const allowedWidth = firstLine ? maxWidth - initialOffsetX : maxWidth;

        // 単語が現在の行に収まらない場合は改行 (ただし行の先頭でない場合のみ)
        if (currentX + wordWidth > maxWidth && currentX > (firstLine ? x + initialOffsetX : x)) {
          currentX = x;
          currentY += lineHeight;
          firstLine = false;
        }

        // 単語内の各文字の座標を記録
        for (let i = 0; i < word.length; i++) {
          const char = word[i];
          const charWidth = context.measureText(char).width;
          positions.push({ char, x: currentX, y: currentY });
          currentX += charWidth;
        }

        // 最後の単語以外はスペースを追加
        if (n < textWords.length - 1) {
          const spaceWidth = context.measureText(' ').width;
          positions.push({ char: ' ', x: currentX, y: currentY });
          currentX += spaceWidth;
        }
      }
      return positions;
    }

    // タイピングアニメーション用の変数設定
    aboutCtx.font = `normal ${fontSizePx}px CothamSans, sans-serif`;
    let charPositions = calculateCharPositions(aboutCtx, aboutText, 0, startY, cssWidth, lineHeight, titleWidth);
    
    let typeProgress = 0; 
    const charsPerFrame = 0.6; // 1フレームあたりの文字表示速度（調整可能）
    let frameCount = 0;

    function renderAbout() {
      if (!isEffectRunning) return;
      frameCount++;

      aboutCtx.clearRect(0, 0, cssWidth, canvasHeight);
      aboutCtx.fillStyle = '#333';
      aboutCtx.font = `normal ${fontSizePx}px CothamSans, sans-serif`;
      aboutCtx.textAlign = 'left';
      aboutCtx.textBaseline = 'top';

      const currentTypeCount = Math.min(Math.floor(typeProgress), charPositions.length);

      // 表示済みの文字を描画
      for (let i = 0; i < currentTypeCount; i++) {
        const pos = charPositions[i];
        aboutCtx.fillText(pos.char, pos.x, pos.y);
      }

      // カーソルの位置計算
      let cursorX, cursorY;
      if (currentTypeCount < charPositions.length) {
        cursorX = charPositions[currentTypeCount].x;
        cursorY = charPositions[currentTypeCount].y;
      } else {
        const lastPos = charPositions[charPositions.length - 1];
        cursorX = lastPos.x + aboutCtx.measureText(lastPos.char).width;
        cursorY = lastPos.y;
      }

      // カーソルの点滅描画 (約0.5秒ごとに表示/非表示を切り替え)
      if (Math.floor(frameCount / 30) % 2 === 0) {
        aboutCtx.fillRect(cursorX + 2, cursorY + 2, 2, fontSizePx - 4);
      }

      // 文字を少しずつ進める (ランダムな揺らぎを入れて人間らしさを出す)
      if (typeProgress < charPositions.length) {
        typeProgress += charsPerFrame * (0.5 + Math.random());
      }
      
      // アニメーションを継続 (全て表示した後もカーソル点滅を維持するため)
      requestAnimationFrame(renderAbout);
    }

    // DIVIDER CANVAS
    const dividerCanvas = document.getElementById('divider-canvas');
    if (dividerCanvas instanceof HTMLCanvasElement) {
      const dividerCtx = dividerCanvas.getContext('2d');
      if (dividerCtx) {
        const dividerCssHeight = 20;
        let dividerWidth = window.innerWidth;

        dividerCanvas.width = dividerWidth * dpr;
        dividerCanvas.height = dividerCssHeight * dpr;
        dividerCanvas.style.height = dividerCssHeight + 'px';
        dividerCtx.scale(dpr, dpr);

  /** @type {{x:number,length:number}[]} */
  let lines = [];                
  let currentSpeed = 90;
  const targetSpeed = 1.9;
  let brakeForce = 0.05;

        function renderDivider() {
          if (brakeForce < 0.08) {
            brakeForce += 0.0005;
          }
          currentSpeed += (targetSpeed - currentSpeed) * brakeForce;

          dividerCtx.clearRect(0, 0, dividerWidth, dividerCssHeight);
          dividerCtx.strokeStyle = 'rgb(51,51,51)';
          dividerCtx.lineWidth = 1.5;

          for (let i = 0; i < lines.length; i++) {
            // currentSpeedを使って左方向に移動させます
            lines[i].x -= currentSpeed;
            dividerCtx.beginPath();
            dividerCtx.moveTo(lines[i].x, dividerCssHeight / 2);
            dividerCtx.lineTo(lines[i].x + lines[i].length, dividerCssHeight / 2);
            dividerCtx.stroke();
          }
          
          // 画面の左端より外に出た線を削除します
          lines = lines.filter(line => line.x + line.length > 0);
          
          // 画面の右端に隙間ができたら新しい線を追加します
          if (lines.length > 0) {
            let rightmostLine = lines[lines.length - 1];
            let rightmostX = rightmostLine.x + rightmostLine.length;
            while (rightmostX < dividerWidth) {
              const space = 12 + Math.random() * 36;
              const length = 8 + Math.random() * 24;
              const newX = rightmostX + space;
              lines.push({ x: newX, length: length });
              rightmostX = newX + length;
            }
          } else {
            const length = 8 + Math.random() * 24;
            lines.push({ x: dividerWidth, length: length });
          }
          
          requestAnimationFrame(renderDivider);
        }
        renderDivider();

        window.addEventListener('resize', () => {
          isEffectRunning = false; 

          if (wrapper instanceof HTMLElement) {
            cssWidth = wrapper.clientWidth;
          }
          canvasHeight = calculateCanvasHeight(cssWidth);

          if (wrapper instanceof HTMLElement) {
            wrapper.style.height = canvasHeight + 'px';
          }

          titleCanvas.width = cssWidth * dpr;
          titleCanvas.height = canvasHeight * dpr;
          titleCanvas.style.width = cssWidth + 'px';
          titleCanvas.style.height = canvasHeight + 'px';
          titleCtx.scale(dpr, dpr);
          titleCtx.font = `normal ${fontSizePx}px CothamSans, sans-serif`;
          titleCtx.fillStyle = '#4ac3e1';
          titleCtx.textAlign = 'left';
          titleCtx.textBaseline = 'top';
          titleCtx.fillText(titleText, 0, startY);

          // リサイズイベント内の aboutCanvas 更新部分
          aboutCanvas.width = cssWidth * dpr;
          aboutCanvas.height = canvasHeight * dpr;
          aboutCanvas.style.width = cssWidth + 'px';
          aboutCanvas.style.height = canvasHeight + 'px';
          aboutCtx.scale(dpr, dpr);
          aboutCtx.font = `normal ${fontSizePx}px CothamSans, sans-serif`;
          aboutCtx.fillStyle = '#333';
          aboutCtx.textAlign = 'left';
          aboutCtx.textBaseline = 'top';

          // リサイズ時は再計算して全文字を即時描画する
          aboutCtx.clearRect(0, 0, cssWidth, canvasHeight);
          charPositions = calculateCharPositions(aboutCtx, aboutText, 0, startY, cssWidth, lineHeight, titleWidth);
          for (let i = 0; i < charPositions.length; i++) {
            const pos = charPositions[i];
            aboutCtx.fillText(pos.char, pos.x, pos.y);
          }

          dividerWidth = window.innerWidth;
          dividerCanvas.width = dividerWidth * dpr;
          dividerCanvas.height = dividerCssHeight * dpr;
          dividerCtx.scale(dpr, dpr);
        });
      }
    }

    setTimeout(() => { requestAnimationFrame(renderTitle); }, 200);
    setTimeout(() => { requestAnimationFrame(renderAbout); }, 700);
  });
}