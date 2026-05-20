// sound.js

let osc;
let env;
let isAudioInitialized = false;

// setup() will call this
export function initSound() {
  env = new p5.Envelope();
  env.setADSR(0.01, 0.05, 0.02, 0.02); 
  env.setRange(0.5, 0);

  osc = new p5.Oscillator();
  osc.setType('saw');
  osc.amp(env);
  osc.start();
}

// audio context so suddnely sound doesnt play
export function startAudioContext() {
  if (!isAudioInitialized) {
    userStartAudio();
    isAudioInitialized = true;
  }
}

// play jump sound
export function playJumpSound() {
  if (!isAudioInitialized) return; 

  let freq = random(200, 300);
  osc.freq(freq);
  env.play();
}


//for dialogue..
export function playPororoSound() {
if (!isAudioInitialized) return;

const sequence = [128, 128, 256, 256, 400, 400]; // get higher
sequence.forEach((freq, index) => {
setTimeout(() => {
osc.freq(freq);
env.play();
}, index * 90); // 90ms interval
});
}