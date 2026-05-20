import { Player } from './slime.js';
import { Box } from './box.js';
import { ProjectBox } from './projectbox.js';
import { Sign } from './sign.js';
import { Pencil } from './pencil.js';
import { Dialogue } from './dialogue.js';
import { initTextures, renderBackgrounds, pixelSize } from './texture.js';
import { mountSketchInstance } from './sketch-module.js';
import { projects } from './projects.js';
import { initSound, startAudioContext, playPororoSound, playJumpSound } from './sound.js';

export function startSketch(containerId = 'canvas-container') {
  // avoid creating multiple p5 instances when called repeatedly
  if (globalThis.__wip_p5_instance) return globalThis.__wip_p5_instance;

  const instance = new p5((p) => {
    // create placeholders for variables that original code expects in global scope
    let tileSize = 52;
    let cols = 9;
    let rows = 9;
    let margin = 4;

    // for entities
    let player;
    let boxes = [];
    let pencil;

    // mock data
    let mockVisitors = 12;
    let mockTotalBounces = 312;
    let currentSessionBounces = 0;

    // for dialogue
    let dialogue;
    let wasPlayerOnSign = false;

    // scale
    let offsetX;
    let offsetY;

    // font
    let customFont;

    // viewMode
    let viewMode = 0;

    
    const createVector = p.createVector.bind(p);
    const floor = p.floor.bind(p);
    const ceil = p.ceil ? p.ceil.bind(p) : Math.ceil; // fallback
    const random = p.random.bind(p);
    const lerp = p.lerp.bind(p);
    const sin = p.sin.bind(p);
    const PI = p.PI;
    const noStroke = p.noStroke.bind(p);
    const rect = p.rect.bind(p);
    const fill = p.fill.bind(p);
    const image = p.image.bind(p);
    const text = p.text.bind(p);
    const textFont = p.textFont.bind(p);
    const textSize = p.textSize.bind(p);
    const textAlign = p.textAlign.bind(p);
    const millis = p.millis.bind(p);
    const triangle = p.triangle.bind(p);
    const push = p.push.bind(p);
    const pop = p.pop.bind(p);
    const stroke = p.stroke.bind(p);
    const strokeWeight = p.strokeWeight.bind(p);
    const constrain = p.constrain ? p.constrain.bind(p) : (v, a, b) => Math.max(a, Math.min(b, v));

  
  globalThis.createCanvas = p.createCanvas.bind(p);
  globalThis.createGraphics = p.createGraphics ? p.createGraphics.bind(p) : undefined;
  globalThis.createVector = p.createVector.bind(p);
  globalThis.floor = p.floor.bind(p);
  globalThis.ceil = p.ceil ? p.ceil.bind(p) : Math.ceil;
  globalThis.random = p.random.bind(p);
  globalThis.lerp = p.lerp.bind(p);
  globalThis.sin = p.sin.bind(p);
  globalThis.PI = p.PI;
  globalThis.noStroke = p.noStroke.bind(p);
  globalThis.userStartAudio = p.userStartAudio ? p.userStartAudio.bind(p) : undefined;
  globalThis.rect = p.rect.bind(p);
  globalThis.fill = p.fill.bind(p);
  globalThis.image = p.image.bind(p);
  globalThis.text = p.text.bind(p);
  globalThis.textFont = p.textFont.bind(p);
  globalThis.textSize = p.textSize.bind(p);
  globalThis.textAlign = p.textAlign.bind(p);
  globalThis.millis = p.millis.bind(p);
  globalThis.triangle = p.triangle.bind(p);
  globalThis.push = p.push.bind(p);
  globalThis.pop = p.pop.bind(p);
  globalThis.stroke = p.stroke.bind(p);
  globalThis.strokeWeight = p.strokeWeight.bind(p);
  globalThis.constrain = p.constrain ? p.constrain.bind(p) : (v, a, b) => Math.max(a, Math.min(b, v));

  
  globalThis.pixelSize = pixelSize;
  globalThis.cols = cols;
  globalThis.rows = rows;
  globalThis.offsetX = 0;
  globalThis.offsetY = 0;
  globalThis.currentSessionBounces = 0;
  globalThis.dialogue = null;

  // additional globals expected by legacy code
  globalThis.translate = p.translate.bind(p);
  globalThis.noise = p.noise ? p.noise.bind(p) : undefined;
  globalThis.textWidth = p.textWidth ? p.textWidth.bind(p) : undefined;
  globalThis.map = p.map ? p.map.bind(p) : undefined;
  globalThis.radians = p.radians ? p.radians.bind(p) : undefined;
  globalThis.CENTER = p.CENTER;
  globalThis.cos = p.cos ? p.cos.bind(p) : undefined;
  Object.defineProperty(globalThis, 'width', { get: () => p.width });
  Object.defineProperty(globalThis, 'height', { get: () => p.height });

  // expose some runtime mocks and sound helpers globally for legacy modules
  try { globalThis.mockVisitors = mockVisitors; } catch (e) { /* noop */ }
  try { globalThis.mockTotalBounces = mockTotalBounces; } catch (e) { /* noop */ }
  try { globalThis.playPororoSound = playPororoSound; } catch (e) { /* noop */ }
  try { globalThis.playJumpSound = playJumpSound; } catch (e) { /* noop */ }

    mountSketchInstance(p, containerId);
  });

  globalThis.__wip_p5_instance = instance;
  return instance;
}
