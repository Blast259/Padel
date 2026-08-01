/* Delade hjälpfunktioner för skripten: hitta Playwright + ffmpeg utan installation. */
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

/* Playwright: lokal node_modules om den finns, annars den globala installationen.
 * Kör ALDRIG "playwright install" — Chromium är förinstallerad
 * (PLAYWRIGHT_BROWSERS_PATH pekas ut nedan om den inte redan är satt). */
export async function loadPlaywright() {
  if (!process.env.PLAYWRIGHT_BROWSERS_PATH && existsSync('/opt/pw-browsers')) {
    process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
  }
  try {
    return await import('playwright');
  } catch {
    const globalNodeModules = join(dirname(process.execPath), '..', 'lib', 'node_modules');
    const req = createRequire(join(globalNodeModules, 'noop.js'));
    return req('playwright');
  }
}

/* ffmpeg med mp4/H.264-stöd. OBS: Playwrights medföljande ffmpeg är
 * VP8/webm-only och kan INTE användas — därför kedjan:
 * $FFMPEG_PATH → ffmpeg på PATH → npm-paketet ffmpeg-static → null. */
export function resolveFfmpeg() {
  const candidates = [];
  if (process.env.FFMPEG_PATH) candidates.push(process.env.FFMPEG_PATH);
  candidates.push('ffmpeg');
  try {
    const req = createRequire(import.meta.url);
    const p = req('ffmpeg-static');
    if (p) candidates.push(p);
  } catch { /* ffmpeg-static ej installerad — ok */ }

  for (const c of candidates) {
    const probe = spawnSync(c, ['-version'], { encoding: 'utf8' });
    if (probe.status === 0 && /ffmpeg version/i.test(probe.stdout || '')) return c;
  }
  return null;
}
