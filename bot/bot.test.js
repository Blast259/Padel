/* Testsvit v1.0 — kör med: npm run bot:test
 * Går igenom en hel Paco-dag via responder.handle (integrationsnivå) plus
 * riktade parser-/motorfall. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parse, parseHora, norm } from './parser.js';
import * as engine from './engine.js';
import { handle } from './responder.js';

function fresh() { return { senders: {} }; }
const say = (store, text) => handle(store, 'paco', text);

test('parseHora förstår Pacos alla tidsformat', () => {
  for (const [input, canon] of [["9'30", '930'], ['9:30', '930'], ['9.30', '930'], ['11', '1100'], ["11'00", '1100']]) {
    assert.equal(parseHora(input).canon, canon, input);
  }
});

test('norm struntar i accenter och versaler', () => {
  assert.equal(norm('  JOSÉ  Luis  Cañasveras '), 'jose luis canasveras');
});

test('pull-kommandot tolkas med tvåords-nivå', () => {
  const c = parse("pull sabado 11'00 cuarta alta padelfly 12");
  assert.equal(c.action, 'crear');
  assert.equal(c.dia, 'sabado');
  assert.equal(c.hora.canon, '1100');
  assert.equal(c.nivel, 'cuarta alta');
  assert.equal(c.lugar, 'padelfly');
  assert.equal(c.plazas, 12);
});

test('en hel dag: skapa, apunta, bekräfta, fullt, reserva, avhopp, lista', () => {
  const store = fresh();

  assert.match(say(store, "pull lunes 9'30 tercera fly 8"), /Creada la pull del lunes/);

  const r1 = say(store, 'apunta a machete y gamez');
  assert.match(r1, /machete apuntado \(nº 1/);
  assert.match(r1, /gamez apuntado \(nº 2/);

  assert.match(say(store, 'machete confirmado'), /✅ machete confirmado/);

  say(store, 'apunta a patiño y tellez y antonio y ale');
  const full = say(store, 'apunta a chichi y domingo');
  assert.match(full, /🔒 PULL CERRADA — 2 pistas/);

  /* nionde spelaren → reserva */
  assert.match(say(store, 'apunta a juan gonzalez'), /1º reserva/);

  /* avhopp → reserven lyfts in bekräftad på samma plats */
  const drop = say(store, 'se cae chichi');
  assert.match(drop, /chichi se cae ➡️ entra juan gonzalez \(1º reserva\) ✅/);
  assert.match(drop, /7-juan gonzalez✅/);

  const lista = say(store, 'lista');
  assert.match(lista, /Pull lunes\nHora 9'30\nLugar fly\nNivel tercera/);
  assert.match(lista, /1-machete✅/);
  assert.match(lista, /2-gamez\n/);        /* apuntad av Paco = utan ✅ */
});

test('två pulls → naket kommando ger enordsfrågan, tidssvar löser den', () => {
  const store = fresh();
  say(store, "pull lunes 9'30 tercera fly 8");
  say(store, "pull lunes 11'00 cuarta alta padelfly 8");

  const q = say(store, 'apunta a franco');
  assert.match(q, /¿Para las 9'30 o las 11'00\? 😊/);

  const done = say(store, "11'00");
  assert.match(done, /franco apuntado \(nº 1/);
  assert.match(say(store, "lista 11'00"), /1-franco/);

  /* tid direkt i kommandot behöver ingen fråga */
  assert.match(say(store, "apunta a tedy a las 11'00"), /tedy apuntado \(nº 2/);
  assert.doesNotMatch(say(store, "lista 9'30"), /franco/);
});

test('namnbaserad härledning: confirmar utan tid hittar rätt pull själv', () => {
  const store = fresh();
  say(store, "pull lunes 9'30 tercera fly 8");
  say(store, "pull lunes 11'00 cuarta alta padelfly 8");
  say(store, "apunta a machete a las 9'30");
  say(store, "apunta a franco a las 11'00");

  /* machete finns bara i 9'30 → ingen fråga behövs */
  const r = say(store, 'machete confirmado');
  assert.match(r, /✅ machete confirmado/);
  assert.match(say(store, "lista 9'30"), /1-machete✅/);

  /* "se cae franco" → 11'00 hittas själv */
  assert.match(say(store, 'se cae franco'), /franco se cae/);
});

test('lista utan tid med två pulls ger klistra-in-färdig dubbellista', () => {
  const store = fresh();
  say(store, "pull lunes 9'30 tercera fly 8");
  say(store, "pull lunes 11'00 cuarta alta padelfly 8");
  const dual = say(store, 'lista');
  assert.match(dual, /Hora 9'30[\s\S]*————————[\s\S]*Hora 11'00/);
});

test('sorteo: validerar par och skriver Pista-block i riktiga formatet', () => {
  const store = fresh();
  say(store, "pull sabado 9'30 tercera fly 8");
  say(store, 'apunta a machete y gamez y patiño y tellez y ale y borja y loren y marcos');

  const s = store.senders.paco.sessions[0];

  const fel = engine.sorteo(s, [['machete', 'gamez']]);
  assert.match(fel.reply, /has puesto 1 y necesito 4/);
  assert.match(fel.reply, /Sin pareja: .*patiño/);

  const ok = engine.sorteo(s, [['machete', 'gamez'], ['patiño', 'tellez'], ['ale', 'borja'], ['loren', 'marcos']], () => 0);
  assert.match(ok.reply, /Pull sabado 9'30/);
  assert.match(ok.reply, /Pista 1\n\S+ - \S+/);
  assert.match(ok.reply, /Pista 2/);            /* 8 spelare = 4 par = 2 pistas */
  assert.doesNotMatch(ok.reply, /Pista 3/);
  assert.match(ok.reply, /🍀 Suerte a todos/);
});

test('fuzzy-namn: dellträff funkar, dubbelträff ber om förtydligande', () => {
  const store = fresh();
  say(store, "pull lunes 9'30 tercera fly 8");
  say(store, 'apunta a jose luis cañasveras y jose villalobos');
  assert.match(say(store, 'cañasveras confirmado'), /✅ jose luis cañasveras confirmado/);
  assert.match(say(store, 'jose confirmado'), /Hay varios que encajan/);
});

test('okänt kommando och hjälp', () => {
  const store = fresh();
  say(store, 'hola');                       /* första kontakt → välkomst */
  assert.match(say(store, 'qué tal el tiempo'), /No te he entendido/);
  assert.match(say(store, 'ayuda'), /GUÍA RÁPIDA/);
});

test('borrar todo nollställer', () => {
  const store = fresh();
  say(store, "pull lunes 9'30 tercera fly 8");
  assert.match(say(store, 'borrar todo'), /de cero/);
  assert.match(say(store, 'lista'), /No hay ninguna pull creada/);
});
