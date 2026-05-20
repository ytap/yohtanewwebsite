if (typeof window !== 'undefined') {
  document.fonts.ready.then(() => {
    const paddingLeft = window.innerWidth * 0.03;
    const cssWidth = window.innerWidth - paddingLeft - 40;
    const canvasHeight = 220; 
    const dpr = window.devicePixelRatio || 1;
    const base = 120;
    const range = 255 - base;
    
    const fontSizePx = 32; 
    const startY = 10; 
    const titleAccumulationSpeed = 0.02;

    // --- TITLE CANVAS ---
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
    
    const titleText = "Yohta Kitagawa";
    titleOffCtx.fillText(titleText, 0, startY);
    
    const titleWidth = titleOffCtx.measureText(titleText + " ").width;

    const titleMaskData = titleOffCtx.getImageData(0, 0, titleOffCanvas.width, titleOffCanvas.height).data;
    const titleDisplayData = titleCtx.createImageData(titleOffCanvas.width, titleOffCanvas.height);
    const titleBuffer32 = new Uint32Array(titleDisplayData.data.buffer);
    const titleAccumulation = new Float32Array(titleBuffer32.length);

    function renderTitle() {
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

    // --- ABOUT CANVAS ---
    const aboutCanvas = document.getElementById('about-canvas');
    if (!(aboutCanvas instanceof HTMLCanvasElement)) return;
    const aboutCtx = aboutCanvas.getContext('2d');
    if (!aboutCtx) return;

    const aboutText = "is a Japanese critical media artist. His works aims to reframe existing values and powerbalances in technology, through personal experience. His primary mediums are sound and robotics, however he consistently experiments with different mediums such as games, sculpture, choreography and more. He is currently studying abroad at Brown university.";
   
    aboutCanvas.width = cssWidth * dpr;
    aboutCanvas.height = canvasHeight * dpr;
    aboutCanvas.style.width = cssWidth + 'px';
    aboutCanvas.style.height = canvasHeight + 'px';
    aboutCtx.scale(dpr, dpr);

    const aboutOffCanvas = document.createElement('canvas');
    aboutOffCanvas.width = aboutCanvas.width;
    aboutOffCanvas.height = aboutCanvas.height;
    const aboutOffCtx = aboutOffCanvas.getContext('2d', { willReadFrequently: true });
    aboutOffCtx.scale(dpr, dpr);

    aboutOffCtx.font = `normal ${fontSizePx}px CothamSans, sans-serif`;
    aboutOffCtx.textAlign = 'left';
    aboutOffCtx.textBaseline = 'top';
    aboutOffCtx.fillStyle = '#333';

    function wrapText(context, text, x, y, maxWidth, lineHeight, initialOffsetX) {
      const words = text.split('');
      let line = '';
      let currentY = y;
      let firstLine = true;

      for (let n = 0; n < words.length; n++) {
        let testLine = line + words[n];
        let metrics = context.measureText(testLine);
        let testWidth = metrics.width;
        let allowedWidth = firstLine ? maxWidth - initialOffsetX : maxWidth;
        
        if (testWidth > allowedWidth && n > 0) {
          context.fillText(line, firstLine ? x + initialOffsetX : x, currentY);
          line = words[n];
          currentY += lineHeight;
          firstLine = false;
        } else {
          line = testLine;
        }
      }
      context.fillText(line, firstLine ? x + initialOffsetX : x, currentY);
    }

    wrapText(aboutOffCtx, aboutText, 0, startY, cssWidth, fontSizePx * 1.2, titleWidth);
    
    const aboutMaskData = aboutOffCtx.getImageData(0, 0, aboutOffCanvas.width, aboutOffCanvas.height).data;
    const aboutDisplayData = aboutCtx.createImageData(aboutOffCanvas.width, aboutOffCanvas.height);
    const aboutBuffer32 = new Uint32Array(aboutDisplayData.data.buffer);
    const aboutAccumulation = new Float32Array(aboutBuffer32.length);

    const blockSize = 4;
    const aboutAccumulationSpeed = titleAccumulationSpeed / 2;
    const w = aboutOffCanvas.width;
    const h = aboutOffCanvas.height;
    const cols = Math.ceil(w / blockSize);
    const rows = Math.ceil(h / blockSize);
    const blockAccum = new Float32Array(cols * rows);

    function renderAbout() {
      let isFinished = true;
      for (let by = 0, yy = 0; yy < h; yy += blockSize, by++) {
        for (let bx = 0, xx = 0; xx < w; xx += blockSize, bx++) {
          const accIdx = by * cols + bx;
          let hasMask = false;
          for (let y = 0; y < blockSize && yy + y < h && !hasMask; y++) {
            for (let x = 0; x < blockSize && xx + x < w; x++) {
              const idx = ((yy + y) * w + (xx + x)) * 4;
              if (aboutMaskData[idx + 3] > 0) { hasMask = true; break; }
            }
          }

          if (hasMask) {
            if (blockAccum[accIdx] < 1.0) {
              isFinished = false;
              const r = base + Math.random() * range;
              const g = base + Math.random() * range;
              const b = base + Math.random() * range;
              blockAccum[accIdx] += Math.random() * aboutAccumulationSpeed;
              if (blockAccum[accIdx] > 1.0) blockAccum[accIdx] = 1.0;
              const acc = blockAccum[accIdx];
              const currentR = Math.round(r * (1 - acc) + 51 * acc);
              const currentG = Math.round(g * (1 - acc) + 51 * acc);
              const currentB = Math.round(b * (1 - acc) + 51 * acc);
              const alpha = Math.min(255, Math.floor(acc * 255));
              for (let y = 0; y < blockSize && yy + y < h; y++) {
                for (let x = 0; x < blockSize && xx + x < w; x++) {
                  const offset = ((yy + y) * w + (xx + x));
                  const maskAlpha = aboutMaskData[offset * 4 + 3];
                  if (maskAlpha > 0) {
                    aboutBuffer32[offset] = alpha * 16777216 + currentB * 65536 + currentG * 256 + currentR;
                  }
                }
              }
            }
          }
        }
      }
      aboutCtx.putImageData(aboutDisplayData, 0, 0);
      if (!isFinished) requestAnimationFrame(renderAbout);
      else {
        aboutCtx.clearRect(0, 0, cssWidth, canvasHeight);
        aboutCtx.drawImage(aboutOffCanvas, 0, 0, aboutOffCanvas.width / dpr, aboutOffCanvas.height / dpr);
      }
    }

    // --- DIVIDER CANVAS ---
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

        let lines = [];
        let currentX = 0;
        while (currentX < dividerWidth) {
          const length = 8 + Math.random() * 24;
          const space = 12 + Math.random() * 36;
          lines.push({ x: currentX, length: length });
          currentX += length + space;
        }
        const speed = 1.2;

        function renderDivider() {
          dividerCtx.clearRect(0, 0, dividerWidth, dividerCssHeight);
          dividerCtx.strokeStyle = 'rgb(51,51,51)';
          dividerCtx.lineWidth = 1.5;
          for (let i = 0; i < lines.length; i++) {
            lines[i].x += speed;
            dividerCtx.beginPath();
            dividerCtx.moveTo(lines[i].x, dividerCssHeight / 2);
            dividerCtx.lineTo(lines[i].x + lines[i].length, dividerCssHeight / 2);
            dividerCtx.stroke();
          }
          lines = lines.filter(line => line.x < dividerWidth);
          if (lines.length > 0) {
            let leftmostX = lines[0].x;
            while (leftmostX > 0) {
              const space = 12 + Math.random() * 36;
              const length = 8 + Math.random() * 24;
              const newX = leftmostX - space - length;
              lines.unshift({ x: newX, length: length });
              leftmostX = newX;
            }
          } else {
            lines.push({ x: -40, length: 20 });
          }
          requestAnimationFrame(renderDivider);
        }
        renderDivider();

        window.addEventListener('resize', () => {
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
