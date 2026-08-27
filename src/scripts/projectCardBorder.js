let animationId = null;
const borderStates = [];

// 上部の点線(divider)と同じ減速カーブ: 速い速度から始まり、徐々にこの速度に収束する
// (枠は一周で描き切る必要があるため、divider自体の巡回速度1.9よりは速い値に収束させる)
const REVEAL_INITIAL_SPEED = 90;
const REVEAL_TARGET_SPEED = 14;
const REVEAL_BRAKE_START = 0.05;
const REVEAL_BRAKE_MAX = 0.08;
const REVEAL_BRAKE_STEP = 0.0005;

// 要素の下辺だけに、枠と同じ動く点線を引く (文字幅に合わせたい場合は要素をinline-blockに)
export function initElementUnderline(el) {
    initElementBorder(el, 'underline');
}

export function initElementBorder(el, mode = 'rect') {
    if (!(el instanceof Element)) return;

    // 枠のcanvasは要素基準で配置するため、positionが未指定なら相対配置にしておく
    // (これが無いとcanvasが画面全体に広がり、ページの外周に点線が描かれてしまう)
    if (el instanceof HTMLElement && getComputedStyle(el).position === 'static') {
        el.style.position = 'relative';
    }

    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1;';
    el.appendChild(canvas);

    const state = {
        canvas,
        mode,
        dashArray: makeDashArray(mode),
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

    document.querySelectorAll('.project-block, .intro-photo').forEach(card => {
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

// 下線は文字のスケールに合わせて、枠よりも細かく密な点線にする
function makeDashArray(mode = 'rect') {
    const arr = [];
    const limit = mode === 'underline' ? 600 : 1200;
    for (let total = 0; total < limit;) {
        const d = mode === 'underline' ? 2 + Math.random() * 6 : 8 + Math.random() * 30;
        const g = mode === 'underline' ? 4 + Math.random() * 8 : 20 + Math.random() * 70;
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
        ctx.lineWidth = s.mode === 'underline' ? 1.5 : 2;

        // マーチングアンツは登場中も止めず、常に進めておく
        // 下線は点線が細かいぶん同じ速度だと速く見えるので、見た目を枠と揃えるため半分にする
        s.offset -= s.mode === 'underline' ? 0.75 : 1.5;

        if (!s.revealed) {
            // 上の点線と同じ減速カーブで、枠線を最初は速く・徐々にゆっくり描き込む
            if (s.revealBrake < REVEAL_BRAKE_MAX) {
                s.revealBrake += REVEAL_BRAKE_STEP;
            }
            s.revealSpeed += (REVEAL_TARGET_SPEED - s.revealSpeed) * s.revealBrake;
            s.revealLength += s.revealSpeed;

            const perimeter = s.mode === 'underline' ? Math.max(w, 1) : getPerimeter(w, h, 6);
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
        if (s.mode === 'underline') {
            const y = h - 1;
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
        } else if (ctx.roundRect) {
            ctx.roundRect(1, 1, w - 2, h - 2, 6);
        } else {
            ctx.rect(1, 1, w - 2, h - 2);
        }
        ctx.stroke();
    });

    animationId = requestAnimationFrame(loop);
}
