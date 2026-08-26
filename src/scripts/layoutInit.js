import { initNoiseBackground } from './noiseBackground.js';
import { initElementBorder } from './projectCardBorder.js';

function setupLayoutScripts() {
    const isWip = document.body.dataset.isWip === 'true';
    const isHome = document.body.dataset.isHome === 'true';

    if (!isWip && !isHome) {
        try {
            initNoiseBackground(2);
        } catch (e) {
            console.error('Failed to init noiseBackground:', e);
        }
    }

    if (!isHome) {
        const projectImageWrapper = document.querySelector('.project-image-wrapper');
        if (projectImageWrapper) {
            initElementBorder(projectImageWrapper);
        }

        const dividerCanvas = document.getElementById('divider-canvas');
        if (dividerCanvas && dividerCanvas instanceof HTMLCanvasElement && dividerCanvas.dataset.initialized !== 'true') {
            dividerCanvas.dataset.initialized = 'true';
            const dividerCtx = dividerCanvas.getContext('2d');
            if (!dividerCtx) return;
            // create a local non-null binding so downstream closures see a definite CanvasRenderingContext2D
            const ctx = /** @type {CanvasRenderingContext2D} */ (dividerCtx);

            const dpr = window.devicePixelRatio || 1;
            const dividerCssHeight = 20;
            let dividerWidth = window.innerWidth;

            dividerCanvas.width = dividerWidth * dpr;
            dividerCanvas.height = dividerCssHeight * dpr;
            dividerCanvas.style.height = dividerCssHeight + 'px';
            ctx.scale(dpr, dpr);

            let lines = /** @type {Array<{x:number,length:number}>} */ ([]);
            let currentSpeed = 90;
            const targetSpeed = 1.9;
            let brakeForce = 0.05;

            function renderDivider() {
                if (!document.getElementById('divider-canvas') || document.body.dataset.isHome === 'true') {
                    return;
                }

                if (brakeForce < 0.08) {
                    brakeForce += 0.0005;
                }
                currentSpeed += (targetSpeed - currentSpeed) * brakeForce;

                ctx.clearRect(0, 0, dividerWidth, dividerCssHeight);
                ctx.strokeStyle = 'rgb(51,51,51)';
                ctx.lineWidth = 1.5;

                for (let i = 0; i < lines.length; i++) {
                    lines[i].x -= currentSpeed;
                    ctx.beginPath();
                    ctx.moveTo(lines[i].x, dividerCssHeight / 2);
                    ctx.lineTo(lines[i].x + lines[i].length, dividerCssHeight / 2);
                    ctx.stroke();
                }

                lines = lines.filter(line => line.x + line.length > 0);

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
                if (document.body.dataset.isHome === 'true') return;
                dividerWidth = window.innerWidth;
                dividerCanvas.width = dividerWidth * dpr;
                dividerCanvas.height = dividerCssHeight * dpr;
                ctx.scale(dpr, dpr);
            });
        }
    }
}

document.addEventListener('astro:page-load', setupLayoutScripts);
setupLayoutScripts();
