// Rendert das Reel: jeden Frame aus reel.html als PNG, dann ffmpeg mit dem Track.
// Aufruf: node render.js <build-ordner mit data.js und track.wav> [test t1 t2 …]
//   ohne "test": alle Frames nach <build>/frames und <build>/reel.mp4
//   mit "test":  nur die genannten Zeitpunkte nach <build>/test_<t>.png
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');

(async () => {
  const [build, mode, ...rest] = process.argv.slice(2);
  const html = path.join(__dirname, 'reel.html');
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  p.on('pageerror', e => console.log('PAGEERROR', e.message));
  p.on('console', m => { if (m.type() === 'error') console.log('CONSOLE', m.text()); });
  await p.goto('file://' + path.resolve(html));
  await p.addScriptTag({ path: path.join(build, 'data.js') });
  const frames = await p.evaluate(() => window.reelInit());
  const png = async t => { await p.evaluate(t => window.renderFrame(t), t); const d = await p.evaluate(() => document.getElementById('c').toDataURL('image/png')); return Buffer.from(d.split(',')[1], 'base64'); };
  if (mode === 'test') {
    for (const t of rest.map(Number)) { fs.writeFileSync(path.join(build, `test_${t.toFixed(2)}.png`), await png(t)); console.log('test', t); }
  } else {
    const dir = path.join(build, 'frames'); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir);
    const fps = 30, t0 = Date.now();
    for (let i = 0; i < frames; i++) { fs.writeFileSync(path.join(dir, `f_${String(i).padStart(4, '0')}.png`), await png(i / fps)); if (i % 150 === 0) console.log('frame', i, '/', frames, Math.round((Date.now() - t0) / 1000) + 's'); }
    console.log('ffmpeg …');
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(fps), '-i', path.join(dir, 'f_%04d.png'), '-i', path.join(build, 'track.wav'),
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '17', '-preset', 'slow', '-profile:v', 'high', '-level', '4.1', '-movflags', '+faststart',
      '-c:a', 'aac', '-b:a', '256k', '-ar', '44100', '-shortest', path.join(build, 'reel.mp4')]);
    console.log('fertig:', path.join(build, 'reel.mp4'));
  }
  await b.close();
})();
