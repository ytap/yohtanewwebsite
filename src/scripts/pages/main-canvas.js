
if (typeof window !== 'undefined') {
  document.fonts.ready.then(() => {
    const wrapper = document.querySelector('.canvas-wrapper');
    if (!wrapper) return;

    let cssWidth = wrapper.clientWidth;
    const dpr = window.devicePixelRatio || 1;
    const base = 120;
    const range = 255 - base;
    
    const fontSizePx = 24;
    const startY = 10; 
    const titleAccumulationSpeed = 0.02;
    const lineHeight = fontSizePx * 1.2;

    const titleText = "Yohta Kitagawa";
    const aboutText = "Yohta Kitagawa is a Japanese critical media artist and HCI researcher. Guided by his vision of Mediating Animacy, he creates intimate interactions that connect humans to an already animate world. Rooted in sound and robotics, his material-led, experimental practice continually takes on new forms.";

    // 本文中でVisionページに飛ばすリンク部分
    const linkText = "Mediating Animacy";
    const linkHref = "/yohtanewwebsite/vision";
    const linkStart = aboutText.indexOf(linkText);
    const linkEnd = linkStart >= 0 ? linkStart + linkText.length : -1;

    const measureCanvas = document.createElement('canvas');
    const measureCtx = measureCanvas.getContext('2d');
    measureCtx.font = `normal ${fontSizePx}px CothamSans, sans-serif`;
    
    // タイトルはHTMLのヘッダーに移したので、about文は行頭から始める
    const titleWidth = 0;
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

    // 本文の実際の高さ (最終行のY + 1行分)。下に続く要素と重ならないよう最初から確保する
    function contentHeight(positions) {
      if (!positions || positions.length === 0) return startY + lineHeight + 5;
      return positions[positions.length - 1].y + lineHeight + 5;
    }

    let isEffectRunning = true;

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
    if (wrapper instanceof HTMLElement) {
      wrapper.style.height = (startY + lineHeight + 5) + 'px';
    }

    let typeProgress = 0;
    const charsPerFrame = 0.9; // 1フレームあたりの文字表示速度（最終的な基準速度）
    const typeStartSpeedMultiplier = 8; // 減速が始まるまでの速度倍率
    // "animate world"までを一気に打ち、その次の文 (Rooted...) から文末にかけて減速する
    const decelAnchorWord = 'Rooted';
    function getDecelIndices(positions) {
      const anchor = aboutText.indexOf(decelAnchorWord);
      const start = anchor >= 0 ? Math.min(anchor, positions.length) : Math.floor(positions.length * 0.8);
      return { start, end: positions.length };
    }
    let { start: typeDecelStart, end: typeDecelEnd } = getDecelIndices(charPositions);
    let frameCount = 0;
    let wrapperLineY = startY; // 直近でwrapperの高さを合わせた行のY座標

    // 青い文字の上に透明な<a>を重ねて、canvasの文字をクリックできるようにする
    function updateLinkHotspots() {
      if (!(wrapper instanceof HTMLElement) || linkStart < 0) return;
      wrapper.querySelectorAll('.about-link').forEach(el => el.remove());

      const slice = charPositions.slice(linkStart, linkEnd);
      if (slice.length === 0) return;

      // 折り返しをまたぐ場合があるので、行 (y座標) ごとに矩形を作る
      const byLine = new Map();
      for (const pos of slice) {
        const line = byLine.get(pos.y);
        const right = pos.x + aboutCtx.measureText(pos.char).width;
        if (!line) {
          byLine.set(pos.y, { left: pos.x, right });
        } else {
          line.left = Math.min(line.left, pos.x);
          line.right = Math.max(line.right, right);
        }
      }

      for (const [y, box] of byLine) {
        const a = document.createElement('a');
        a.className = 'about-link';
        a.href = linkHref;
        a.setAttribute('aria-label', linkText);
        a.style.cssText = `position:absolute;left:${box.left}px;top:${y}px;width:${box.right - box.left}px;height:${lineHeight}px;z-index:2;`;
        wrapper.appendChild(a);
      }
    }

    function renderAbout() {
      if (!isEffectRunning) return;
      frameCount++;

      aboutCtx.clearRect(0, 0, cssWidth, canvasHeight);
      aboutCtx.fillStyle = '#333';
      aboutCtx.font = `normal ${fontSizePx}px CothamSans, sans-serif`;
      aboutCtx.textAlign = 'left';
      aboutCtx.textBaseline = 'top';

      const currentTypeCount = Math.min(Math.floor(typeProgress), charPositions.length);

      // 表示済みの文字を描画 (リンク部分だけ青くする)
      for (let i = 0; i < currentTypeCount; i++) {
        const pos = charPositions[i];
        aboutCtx.fillStyle = (linkStart >= 0 && i >= linkStart && i < linkEnd) ? '#4ac3e1' : '#333';
        aboutCtx.fillText(pos.char, pos.x, pos.y);
      }
      aboutCtx.fillStyle = '#333';

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

      // 改行してカーソルの行が変わったら、wrapperの高さを伸ばして点線を下に追従させる
      // 改行するたびに1行ぶんずつ伸ばす。CSSのtransitionで滑らかに下がる
      if (cursorY !== wrapperLineY) {
        wrapperLineY = cursorY;
        updateLinkHotspots();
        if (wrapper instanceof HTMLElement) {
          const grown = Math.min(cursorY + lineHeight + 5, contentHeight(charPositions));
          wrapper.style.height = grown + 'px';
        }
      }

      // 文字を少しずつ進める (1行目は速く、2行目の間に基準速度まで減速。ランダムな揺らぎも加える)
      if (typeProgress < charPositions.length) {
        let speedMultiplier = typeStartSpeedMultiplier;
        if (typeProgress > typeDecelStart) {
          const span = Math.max(typeDecelEnd - typeDecelStart, 1);
          const t = Math.min((typeProgress - typeDecelStart) / span, 1);
          speedMultiplier = 1 + (typeStartSpeedMultiplier - 1) * (1 - t) * (1 - t);
        }
        typeProgress += charsPerFrame * speedMultiplier * (0.5 + Math.random());
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

  /** @type {{x:number,length:number,text?:string}[]} */
  let lines = [];
  let currentSpeed = 90;
  const targetSpeed = 1.9;
  let brakeForce = 0.05;

        // 点線の合間に時折混ざる「製作中」の文言
        const noticeText = 'Website under construction...';
        const noticeFontSize = 11;
        const noticeFont = `italic ${noticeFontSize}px CothamSans, sans-serif`;
        dividerCtx.font = noticeFont;
        const noticeWidth = dividerCtx.measureText(noticeText).width;
        let sinceLastNotice = 0; // 直近の文言から追加した線の数

        function renderDivider() {
          if (brakeForce < 0.08) {
            brakeForce += 0.0005;
          }
          currentSpeed += (targetSpeed - currentSpeed) * brakeForce;

          dividerCtx.clearRect(0, 0, dividerWidth, dividerCssHeight);
          dividerCtx.strokeStyle = 'rgb(51,51,51)';
          dividerCtx.lineWidth = 1.5;

          dividerCtx.fillStyle = 'rgb(51,51,51)';
          dividerCtx.font = noticeFont;
          dividerCtx.textAlign = 'left';
          dividerCtx.textBaseline = 'middle';

          for (let i = 0; i < lines.length; i++) {
            // currentSpeedを使って左方向に移動させます
            lines[i].x -= currentSpeed;
            if (lines[i].text) {
              dividerCtx.fillText(lines[i].text, lines[i].x, dividerCssHeight / 2);
            } else {
              dividerCtx.beginPath();
              dividerCtx.moveTo(lines[i].x, dividerCssHeight / 2);
              dividerCtx.lineTo(lines[i].x + lines[i].length, dividerCssHeight / 2);
              dividerCtx.stroke();
            }
          }
          
          // 画面の左端より外に出た線を削除します
          lines = lines.filter(line => line.x + line.length > 0);
          
          // 画面の右端に隙間ができたら新しい線を追加します
          if (lines.length > 0) {
            let rightmostLine = lines[lines.length - 1];
            let rightmostX = rightmostLine.x + rightmostLine.length;
            while (rightmostX < dividerWidth) {
              const space = 12 + Math.random() * 36;
              const newX = rightmostX + space;
              // しばらく線が続いたら、時折文言を挟む
              if (sinceLastNotice > 2 && Math.random() < 0.5) {
                lines.push({ x: newX, length: noticeWidth, text: noticeText });
                rightmostX = newX + noticeWidth;
                sinceLastNotice = 0;
              } else {
                const length = 8 + Math.random() * 24;
                lines.push({ x: newX, length: length });
                rightmostX = newX + length;
                sinceLastNotice++;
              }
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
          if (wrapper instanceof HTMLElement) {
            wrapper.style.height = contentHeight(charPositions) + 'px';
          }
          for (let i = 0; i < charPositions.length; i++) {
            const pos = charPositions[i];
            aboutCtx.fillStyle = (linkStart >= 0 && i >= linkStart && i < linkEnd) ? '#4ac3e1' : '#333';
            aboutCtx.fillText(pos.char, pos.x, pos.y);
          }
          aboutCtx.fillStyle = '#333';
          updateLinkHotspots();

          dividerWidth = window.innerWidth;
          dividerCanvas.width = dividerWidth * dpr;
          dividerCanvas.height = dividerCssHeight * dpr;
          dividerCtx.scale(dpr, dpr);
        });
      }
    }

    updateLinkHotspots();
    setTimeout(() => { requestAnimationFrame(renderAbout); }, 700);
  });
}