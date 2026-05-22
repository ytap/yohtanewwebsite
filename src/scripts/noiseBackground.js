export function initNoiseBackground(pixelSize = 4, theme = 'default') {
    const existingCanvas = document.getElementById('global-noise-canvas');
    if (existingCanvas) existingCanvas.remove();

    const canvas = document.createElement('canvas');
    canvas.id = 'global-noise-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '-1';
    // canvas.style.opacity = '0.08';
    
    canvas.style.imageRendering = 'pixelated';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let width, height;
    let imageData, buffer32;
    let colorMap; 

    let mouseX = -1000;
    let mouseY = -1000;
    let prevMouseX = -1000;
    let prevMouseY = -1000;
    
    let spread = 5;
    const minSpread = 5;
    let maxSpread = 1000;
    const spreadIncrease = 0.5; 

    window.addEventListener('mousemove', (e) => {
        mouseX = Math.floor(e.clientX / pixelSize);
        mouseY = Math.floor(e.clientY / pixelSize);
    });

    function resize() {
        width = Math.floor(window.innerWidth / pixelSize);
        height = Math.floor(window.innerHeight / pixelSize);
        canvas.width = width;
        canvas.height = height;
        
        imageData = ctx.createImageData(width, height);
        buffer32 = new Uint32Array(imageData.data.buffer);
        colorMap = new Uint32Array(width * height);
        
        maxSpread = Math.ceil(Math.sqrt(width * width + height * height));
    }

    window.addEventListener('resize', resize);
    resize();

    function render() {
        const dx = mouseX - prevMouseX;
        const dy = mouseY - prevMouseY;
        
        if (Math.abs(dx) < 1 && Math.abs(dy) < 1) {
            spread = Math.min(maxSpread, spread + spreadIncrease);
        } else {
            spread = minSpread;
        }
        
        prevMouseX = mouseX;
        prevMouseY = mouseY;

        const newDots = Math.min(Math.floor(spread * 5), 5000); 
        for (let i = 0; i < newDots; i++) {
            const rx = mouseX + (Math.random() - 0.5) * spread * 2;
            const ry = mouseY + (Math.random() - 0.5) * spread * 2;
            
            if (Math.pow(rx - mouseX, 2) + Math.pow(ry - mouseY, 2) <= spread * spread) {
                const ix = Math.floor(rx);
                const iy = Math.floor(ry);
                
                if (ix >= 0 && ix < width && iy >= 0 && iy < height) {
                    const idx = iy * width + ix;
                    
                    let r = 0, g = 0, b = 0;

                    if (theme === 'green') {
                        g = 255;
                        r = Math.random() * 150;
                        b = Math.random() * 150;
                    } else {
                        const colorType = Math.floor(Math.random() * 6);
                        if (colorType === 0) { r = 255; g = Math.random() * 255; }
                        else if (colorType === 1) { g = 255; r = Math.random() * 255; }
                        else if (colorType === 2) { b = 255; r = Math.random() * 255; }
                        else if (colorType === 3) { r = 255; g = 255; b = Math.random() * 255; }
                        else if (colorType === 4) { r = 255; b = 255; g = Math.random() * 255; }
                        else { g = 255; b = 255; r = Math.random() * 255; }
                    }

                    colorMap[idx] = (255 << 24) | (b << 16) | (g << 8) | r;
                }
            }
        }

        const len = buffer32.length;
        const base = 80;
        const range = 255 - base;
        // 追加: 不透明度の設定（255を最大値とする）
        const bgAlpha = Math.floor(255 * 0.08);   // 背景のノイズ (従来通り)
        const colorAlpha = Math.floor(255 * 0.4); // カラーノイズの不透明度（0.4の部分で調整）

        for (let i = 0; i < len; i++) {
            const gray = base + Math.random() * range;
            
            let r_bg = gray;
            let g_bg = gray;
            let b_bg = gray;

            if (theme === 'green') {
                g_bg = Math.min(255, gray + 30); 
                r_bg = Math.max(0, gray - 10);
                b_bg = Math.max(0, gray - 10);
            }

            // 変更: 255の代わりにbgAlphaを使用
            let pixel = (bgAlpha << 24) | (b_bg << 16) | (g_bg << 8) | r_bg;

            if (colorMap[i] !== 0) {
                // 変更: colorMapからRGB要素を抽出し、colorAlphaを付与して再構成する
                const r_c = colorMap[i] & 0xff;
                const g_c = (colorMap[i] >> 8) & 0xff;
                const b_c = (colorMap[i] >> 16) & 0xff;

                pixel = (colorAlpha << 24) | (b_c << 16) | (g_c << 8) | r_c;
                
                if (Math.random() < 0.02) {
                    colorMap[i] = 0;
                }
            }
            
            buffer32[i] = pixel;
        }
        
        ctx.putImageData(imageData, 0, 0);
        requestAnimationFrame(render);
    }

    render();
}