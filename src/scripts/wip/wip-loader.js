// Client-side loader for the WIP page. Keeps code out of inline Astro scripts.

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('failed to load ' + src));
    document.head.appendChild(s);
  });
}

(async () => {
  try {
    if (!window.p5) {
      await loadScript('https://cdn.jsdelivr.net/npm/p5@1.4.0/lib/p5.min.js');
      await loadScript('https://cdn.jsdelivr.net/npm/p5@1.4.0/lib/addons/p5.sound.min.js');
    }

    // Import the module that creates the p5 instance. It's in the same folder.
    const mod = await import('./startSketch.js');
    if (mod && typeof mod.startSketch === 'function') {
      mod.startSketch('canvas-container');
    }
  } catch (err) {
    console.error('WIP loader error', err);
  }
})();
