/* Spelar in demovideorna: kör demon i autoplay i headless Chromium (1080×2340),
 * en gång per språk, och konverterar webm → mp4 (H.264, spelas på mobiler/WhatsApp).
 *
 *   npm run record                 → videos/demo-es.mp4 + videos/demo-sv.mp4
 *   LANGS=es node scripts/...      → bara ett språk
 *   RECORD_SPEED=8 npm run record  → snabb testinspelning (inte för leverans)
 *
 * Saknas mp4-kapabel ffmpeg behålls .webm i out/ och det exakta
 * konverteringskommandot skrivs ut (kör det på valfri annan dator).
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, rmSync, copyFileSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadPlaywright, resolveFfmpeg } from './lib.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DEMO_URL = pathToFileURL(join(ROOT, 'demo', 'index.html')).href;
const OUT = join(ROOT, 'out');
const VIDEOS = join(ROOT, 'videos');
const LANGS = (process.env.LANGS || 'es,sv').split(',').map(s => s.trim()).filter(Boolean);
const SPEED = parseFloat(process.env.RECORD_SPEED || '1') || 1;
const SIZE = { width: 1080, height: 2340 };

const { chromium } = await loadPlaywright();
const ffmpeg = resolveFfmpeg();
mkdirSync(OUT, { recursive: true });
mkdirSync(VIDEOS, { recursive: true });

console.log(`ffmpeg: ${ffmpeg || 'SAKNAS (mp4-konvertering hoppas över)'}`);

const browser = await chromium.launch();
for (const lang of LANGS) {
  const tmpDir = join(OUT, `tmp-${lang}`);
  rmSync(tmpDir, { recursive: true, force: true });

  console.log(`\n▶ Spelar in [${lang}] …`);
  const ctx = await browser.newContext({
    viewport: SIZE,
    recordVideo: { dir: tmpDir, size: SIZE },
    locale: 'es-ES',
    timezoneId: 'Europe/Madrid'
  });
  const page = await ctx.newPage();
  const url = `${DEMO_URL}?autoplay=1&record=1&lang=${lang}` +
    (SPEED !== 1 ? `&speed=${SPEED}` : '');
  await page.goto(url);
  await page.waitForFunction(() => window.__DEMO_DONE === true, null, { timeout: 480000 });
  await page.waitForTimeout(2000 / SPEED); // låt slutkortet vila i bild
  const video = page.video();
  await ctx.close(); // stänger + skriver klart webm-filen
  const webmPath = await video.path();

  if (ffmpeg) {
    const mp4Path = join(VIDEOS, `demo-${lang}.mp4`);
    const args = ['-y', '-i', webmPath, '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
      '-crf', '21', '-preset', 'medium', '-movflags', '+faststart', '-an', mp4Path];
    const res = spawnSync(ffmpeg, args, { stdio: ['ignore', 'ignore', 'pipe'], encoding: 'utf8' });
    if (res.status !== 0) {
      console.error(`✗ ffmpeg misslyckades för [${lang}]:\n${(res.stderr || '').slice(-2000)}`);
      process.exitCode = 1;
    } else {
      const mb = (statSync(mp4Path).size / 1e6).toFixed(1);
      console.log(`✔ ${mp4Path} (${mb} MB)`);
      rmSync(tmpDir, { recursive: true, force: true });
    }
  } else {
    const keep = join(OUT, `demo-${lang}.webm`);
    copyFileSync(webmPath, keep);
    rmSync(tmpDir, { recursive: true, force: true });
    console.log(`⚠ Behöll ${keep} — konvertera själv med:\n` +
      `  ffmpeg -y -i ${keep} -c:v libx264 -pix_fmt yuv420p -crf 21 ` +
      `-preset medium -movflags +faststart -an videos/demo-${lang}.mp4`);
  }
}
await browser.close();
console.log('\nKlart.');
