export function initNoiseBackground() {
    // Create Canvas artifacts
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none'; 
    canvas.style.zIndex = '-1';          // back
    canvas.style.opacity = '0.08';       // noise opacity here

    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let width, height;
    let imageData, buffer32;

    // Resize
    function resize() {
        width = Math.floor(window.innerWidth / 2);
        height = Math.floor(window.innerHeight / 2);
        canvas.width = width;
        canvas.height = height;
        
        imageData = ctx.createImageData(width, height);
        buffer32 = new Uint32Array(imageData.data.buffer);
    }

    window.addEventListener('resize', resize);
    resize();

    // draw loop
    function render() {
        const len = buffer32.length;
        //above certain brightness
        const base = 120; 
        const range = 255 - base;
        for (let i = 0; i < len; i++) {
            //create r, g, b and then join it to an integer- like cs1230!
            const r = base + Math.random() * range;
            const g = base + Math.random() * range;
            const b = base + Math.random() * range;

            buffer32[i] = (255 << 24) | (b << 16) | (g << 8) | r;
        }
        ctx.putImageData(imageData, 0, 0);
        
        requestAnimationFrame(render);
    }

    render();
}