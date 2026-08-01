/* Preflight före inspelning: Chromium startar, färg-emoji renderas, ffmpeg kan H.264.
 *   npm run check
 * Avslutar med kod ≠ 0 om något hårt krav fallerar. */
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { loadPlaywright, resolveFfmpeg } from './lib.mjs';

let failures = 0;
const ok = (msg) => console.log(`✔ ${msg}`);
const bad = (msg) => { console.error(`✗ ${msg}`); failures++; };

/* 1) Chromium */
let chromium;
try {
  ({ chromium } = await loadPlaywright());
  ok(`Playwright laddad, Chromium: ${chromium.executablePath()}`);
} catch (e) {
  bad(`Playwright/Chromium hittas inte: ${e.message}`);
  process.exit(1);
}

/* 2) Färg-emoji: rita i canvas och räkna mättade (icke-gråa) pixlar */
{
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const colored = await page.evaluate(() => {
    const c = document.createElement('canvas');
    c.width = 320; c.height = 90;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.font = '64px "Noto Color Emoji", sans-serif';
    ctx.fillText('✅‼️🎾🇸🇪', 8, 70);
    const d = ctx.getImageData(0, 0, c.width, c.height).data;
    let n = 0;
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i], g = d[i + 1], b = d[i + 2];
      if (Math.max(r, g, b) - Math.min(r, g, b) > 40) n++;
    }
    return n;
  });
  await browser.close();
  if (colored > 500) ok(`Färg-emoji renderas (${colored} färgade pixlar för ✅‼️🎾🇸🇪)`);
  else bad(`Emoji verkar renderas utan färg (${colored} färgade pixlar) — saknas Noto Color Emoji?`);
}

/* 3) ffmpeg med H.264/mp4 (Playwrights medföljande duger INTE — den är webm-only) */
{
  const ffmpeg = resolveFfmpeg();
  if (!ffmpeg) {
    bad('Ingen mp4-kapabel ffmpeg hittad ($FFMPEG_PATH / PATH / ffmpeg-static). ' +
      'Installera: apt-get install -y ffmpeg  ELLER  npm i -D ffmpeg-static');
  } else {
    const dir = mkdtempSync(join(tmpdir(), 'ffm-'));
    const out = join(dir, 't.mp4');
    const res = spawnSync(ffmpeg, ['-y', '-f', 'lavfi', '-i', 'color=c=red:s=320x240:d=1',
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', out], { encoding: 'utf8' });
    const good = res.status === 0 && statSync(out, { throwIfNoEntry: false })?.size > 0;
    rmSync(dir, { recursive: true, force: true });
    if (good) ok(`ffmpeg kan H.264/mp4: ${ffmpeg}`);
    else bad(`ffmpeg (${ffmpeg}) klarade inte H.264-testkodning:\n${(res.stderr || '').slice(-800)}`);
  }
}

console.log(failures ? `\n${failures} problem — åtgärda före inspelning.` : '\nAllt grönt — kör npm run record.');
process.exit(failures ? 1 : 0);
