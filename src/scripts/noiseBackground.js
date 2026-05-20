export function initNoiseBackground(pixelSize = 4) {
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
    canvas.style.zIndex = '9999';
    canvas.style.opacity = '0.08';
    
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
    let maxSpread = 1000; // リサイズ時に画面対角線の長さに更新されます
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
        
        // 画面の対角線の長さを計算し、ページ全体を覆える最大半径を定義します
        maxSpread = Math.ceil(Math.sqrt(width * width + height * height));
    }

    window.addEventListener('resize', resize);
    resize();

    function render() {
        const dx = mouseX - prevMouseX;
        const dy = mouseY - prevMouseY;
        
        if (Math.abs(dx) < 1 && Math.abs(dy) < 1) {
            // 上限を maxSpread まで許容し、継続的に広げます
            spread = Math.min(maxSpread, spread + spreadIncrease);
        } else {
            spread = minSpread;
        }
        
        prevMouseX = mouseX;
        prevMouseY = mouseY;

        // 範囲拡大時の密度低下を防ぎつつ、過度な計算負荷を避けるため生成数に上限（5000）を設けます
        const newDots = Math.min(Math.floor(spread * 5), 5000); 
        for (let i = 0; i < newDots; i++) {
            const rx = mouseX + (Math.random() - 0.5) * spread * 2;
            const ry = mouseY + (Math.random() - 0.5) * spread * 2;
            
            if (Math.pow(rx - mouseX, 2) + Math.pow(ry - mouseY, 2) <= spread * spread) {
                const ix = Math.floor(rx);
                const iy = Math.floor(ry);
                
                if (ix >= 0 && ix < width && iy >= 0 && iy < height) {
                    const idx = iy * width + ix;
                    
                    const colorType = Math.floor(Math.random() * 6);
                    let r = 0, g = 0, b = 0;
                    
                    if (colorType === 0) { r = 255; g = Math.random() * 255; }
                    else if (colorType === 1) { g = 255; r = Math.random() * 255; }
                    else if (colorType === 2) { b = 255; r = Math.random() * 255; }
                    else if (colorType === 3) { r = 255; g = 255; b = Math.random() * 255; }
                    else if (colorType === 4) { r = 255; b = 255; g = Math.random() * 255; }
                    else { g = 255; b = 255; r = Math.random() * 255; }

                    colorMap[idx] = (255 << 24) | (b << 16) | (g << 8) | r;
                }
            }
        }

        const len = buffer32.length;
        const base = 210; 
        const range = 255 - base;

        // 2. 画面全体の描画
        for (let i = 0; i < len; i++) {
            // ベースとなるグレースケールノイズを生成
            const gray = base + Math.random() * range;
            let pixel = (255 << 24) | (gray << 16) | (gray << 8) | gray;

            // カラーノイズが蓄積されている場所であれば、そちらを優先して描画
            if (colorMap[i] !== 0) {
                pixel = colorMap[i];
                
                // 蓄積の減衰処理（ここが動いているか再確認）
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