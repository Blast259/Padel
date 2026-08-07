/* Lagring v1.0: en JSON-fil med atomisk skrivning (tmp + rename).
 * Datamängden är trivial (en organisatör, dagsfärska pass) — SQLite kommer
 * med skarpt läge (se docs/ARCHITECTURE.md), inte i piloten. */
import { readFileSync, writeFileSync, renameSync, mkdirSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';

export function load(file) {
  try {
    if (existsSync(file)) return JSON.parse(readFileSync(file, 'utf8'));
  } catch (e) {
    console.error(`Kunde inte läsa ${file} (${e.message}) — börjar tomt.`);
  }
  return { senders: {} };
}

export function save(file, store) {
  mkdirSync(dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  writeFileSync(tmp, JSON.stringify(store, null, 2));
  renameSync(tmp, file);
}
