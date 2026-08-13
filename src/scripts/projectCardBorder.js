let animationId = null;
const borderStates = [];

// 上部の点線(divider)と同じ減速カーブ: 速い速度から始まり、徐々にこの速度に収束する
// (枠は一周で描き切る必要があるため、divider自体の巡回速度1.9よりは速い値に収束させる)
const REVEAL_INITIAL_SPEED = 90;
const REVEAL_TARGET_SPEED = 14;
const REVEAL_BRAKE_START = 0.05;
const REVEAL_BRAKE_MAX = 0.08;
const REVEAL_BRAKE_STEP = 0.0005;

export function initElementBorder(el) {
    if (!(el instanceof Element)) return;

    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1;';
    el.appendChild(canvas);

    const state = {
        canvas,
        dashArray: makeDashArray(),
        offset: 0,
        revealLength: 0,
        revealSpeed: REVEAL_INITIAL_SPEED,
        revealBrake: REVEAL_BRAKE_START,
        revealed: false,
        observer: new ResizeObserver(() => fit(canvas, el)),
    };

    state.observer.observe(el);
    fit(canvas, el);
    borderStates.push(state);

    if (animationId === null) loop();
}

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
            revealLength: 0,
            revealSpeed: REVEAL_INITIAL_SPEED,
            revealBrake: REVEAL_BRAKE_START,
            revealed: false,
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

function getPerimeter(w, h, radius) {
    const rectW = w - 2;
    const rectH = h - 2;
    const r = Math.min(radius, rectW / 2, rectH / 2);
    const straight = 2 * (rectW - 2 * r) + 2 * (rectH - 2 * r);
    const corners = 2 * Math.PI * r;
    return Math.max(straight + corners, 1);
}

// dashArrayの点線テクスチャを先頭からrevealLength分だけ切り出し、残りは描画されない巨大な隙間にする
function buildRevealDash(dashArray, revealLength, perimeter) {
    if (revealLength <= 0) return [0, perimeter];

    const result = [];
    let remaining = revealLength;
    let i = 0;
    while (remaining > 0) {
        const segment = dashArray[i % dashArray.length];
        const piece = Math.min(segment, remaining);
        result.push(piece);
        remaining -= piece;
        if (piece < segment) break;
        i++;
    }

    const restGap = Math.max(perimeter - revealLength, 1);
    if (result.length % 2 === 1) {
        // 最後が線(dash)で終わっているので、隙間(gap)を追加して残りを覆う
        result.push(restGap);
    } else {
        // 最後が隙間(gap)で終わっているので、そのまま残りを覆うよう延長する
        result[result.length - 1] += restGap;
    }
    return result;
}

function loop() {
    borderStates.forEach(s => {
        const { canvas } = s;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        if (!w || !h) return;

        ctx.clearRect(0, 0, w, h);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;

        // マーチングアンツは登場中も止めず、常に進めておく
        s.offset -= 1.5;

        if (!s.revealed) {
            // 上の点線と同じ減速カーブで、枠線を最初は速く・徐々にゆっくり描き込む
            if (s.revealBrake < REVEAL_BRAKE_MAX) {
                s.revealBrake += REVEAL_BRAKE_STEP;
            }
            s.revealSpeed += (REVEAL_TARGET_SPEED - s.revealSpeed) * s.revealBrake;
            s.revealLength += s.revealSpeed;

            const perimeter = getPerimeter(w, h, 6);
            if (s.revealLength >= perimeter) {
                s.revealLength = perimeter;
                s.revealed = true;
            }
            ctx.setLineDash(buildRevealDash(s.dashArray, s.revealLength, perimeter));
        } else {
            ctx.setLineDash(s.dashArray);
        }
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
