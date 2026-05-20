let animationId = null;
const borderStates = [];

export function initProjectCardBorders() {
    if (animationId !== null) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    borderStates.forEach(s => {
        s.observer.disconnect();
        s.canvas.remove();
    });
    borderStates.length = 0;

    document.querySelectorAll('.project-block').forEach(card => {
        const canvas = document.createElement('canvas');
        canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1;';
        card.appendChild(canvas);

        const state = {
            canvas,
            dashArray: makeDashArray(),
            offset: 0,
            observer: new ResizeObserver(() => fit(canvas, card)),
        };

        state.observer.observe(card);
        fit(canvas, card);
        borderStates.push(state);
    });

    loop();
}

function fit(canvas, card) {
    const r = card.getBoundingClientRect();
    canvas.width = r.width;
    canvas.height = r.height;
}

function makeDashArray() {
    const arr = [];
    for (let total = 0; total < 1200;) {
        const d = 8 + Math.random() * 30;
        const g = 20 + Math.random() * 70;
        arr.push(d, g);
        total += d + g;
    }
    return arr;
}

function loop() {
    borderStates.forEach(s => {
        s.offset -= 1.5;

        const { canvas } = s;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        if (!w || !h) return;

        ctx.clearRect(0, 0, w, h);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.setLineDash(s.dashArray);
        ctx.lineDashOffset = s.offset;

        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(1, 1, w - 2, h - 2, 6);
        } else {
            ctx.rect(1, 1, w - 2, h - 2);
        }
        ctx.stroke();
    });

    animationId = requestAnimationFrame(loop);
}
