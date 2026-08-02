# Teknisk arkitektur: "Asistente de Paco" i drift

Detta dokument beskriver hur lösningen sätts upp på riktigt om Paco säger
"vamos" — komponenter, hosting, drift och kostnader. Strategin (varför
1:1-sekreterare och inte gruppbot) motiveras i ROADMAP.md; här står *hur*.

## Översikt

```
                      ┌────────────────────────────────┐
 Spelare ─WhatsApp──▶ │  Meta WhatsApp Business        │ ◀──WhatsApp─ Paco
 1:1: "yo", frågor,   │  Cloud API (officiellt,        │  1:1: kommandon,
 tillgänglighet,      │  botens EGNA spanska nummer)   │  "dale", justeringar
 EN/SV/ES             └───────────────┬────────────────┘
                                      │ webhook (inkommande)
                                      │ Graph API (utgående)
                                      ▼
                      ┌────────────────────────────────┐
                      │  Backend "asistente"           │
                      │  en (1) Node.js/TS-tjänst      │
                      │  ├─ Webhook-mottagare          │
                      │  ├─ Kommandotolk (regex/mallar)│
                      │  ├─ LLM-fallback (Claude API:  │
                      │  │   fritext, es/en/sv, namn)  │
                      │  ├─ Passmotor: lista, ✅,      │
                      │  │   reservas, sorteo, rond 2, │
                      │  │   resumé, flexibel storlek  │
                      │  ├─ Tillgänglighetsregister    │
                      │  └─ Schemaläggare (cron):      │
                      │      nudgeförslag, resumé      │
                      └───────┬──────────────┬─────────┘
                              ▼              ▼
                      ┌────────────┐   ┌────────────────┐
                      │ SQLite     │   │ Claude API      │
                      │ (pass,     │   │ (Haiku-klass:   │
                      │  spelare,  │   │  NLU + språk)   │
                      │  parönske- │   └────────────────┘
                      │  mål)      │
                      └────────────┘

 Gruppen då? Paco vidarebefordrar botens färdiga listtexter till gruppen,
 precis som han vidarebefordrar sina egna idag ("Vidarebefordrat"-fyndet).
 Ingen gruppautomation = noll bannrisk och noll beteendeförändring.
```

## Komponenterna

### 1. WhatsApp-kopplingen — Meta Cloud API (officiell)

- **Eget nummer till boten** — ett dedikerat spanskt nummer (prepaid/eSIM/
  virtuellt), aldrig Pacos privata. Registreras i Meta Business och kan
  därefter inte användas i vanliga WhatsApp-appen.
- **Meta Business-konto + app** med WhatsApp-produkten. Utvecklingsfasen körs
  mot Metas **testnummer** (sandbox): fungerar direkt, får bara skriva till
  i förväg registrerade mottagare — perfekt för pilot med Tommy + Paco + ett
  par spelare.
- **Trafikmodell:** inkommande meddelanden öppnar ett 24-timmars
  servicefönster där botens svar i praktiken är gratis. Mallmeddelanden
  (bot-initierat utanför fönstret, t.ex. morgonpåminnelser) kostar några
  cent styck — designen håller dem få (spelarna skriver in sig själva).
- **Verifiering:** utan företagsverifiering gäller en gräns på ~250
  bot-initierade konversationer/dygn — mer än nog här eftersom flödet är
  användarinitierat. Visningsnamnet ("Asistente de Paco") kräver en enkel
  granskning.
- *Alternativ:* Twilio WhatsApp API ger enklare onboarding men kostar per
  meddelande — rimlig genväg om Meta-byråkratin strular, annars direkt mot
  Meta (billigast).

### 2. Backend — en enda liten tjänst

Node.js/TypeScript (samma stack som demon), storleksordning: samma kodmängd
som `demo/`-katalogen. Moduler:

| Modul | Gör | Not |
|---|---|---|
| Webhook-mottagare | Tar emot Metas POST, verifierar signatur | Fastify/Express |
| Kommandotolk | Regex/mallar för 90 % av trafiken: `pull sabado 9'30 tercera fly 16`, `yo`, `me caigo`, `sorteo`, `apunta a X`, resultat `p1 X y Y` | Deterministisk, mallarna = strängarna i `demo/scenario.js` |
| LLM-fallback | Fritext som inte matchar: turistfrågor (EN/SV/ES), tillgänglighet ("estoy hasta el domingo"), luddiga namn ("compi de pepe") | Claude API (Haiku-klass), struktur­erat svar → samma interna kommandon; alla utgående texter byggs ur mallar, aldrig fri LLM-text till spelare |
| Passmotor | Listtillstånd per pass: platser, ✅-regeln (direkt svar ⇒ ✅), reservas + upplyft, flexibel storlek (8→12→16), sorteo (Pacos par, slumpade startbanor), rond 2 (vinnare upp/förlorare ner), kvällsresumé | Ren tillståndsmaskin, exakt demons logik |
| Tillgänglighets­register | Per spelare: dagar/tider de sagt att de kan; förfaller automatiskt | Matar nudge-/utfrågningsförslagen |
| Schemaläggare | Cron-jobb: "faltan 2"-koll vid konfigurerade tider, kvällsresumé, städning av gamla pass | node-cron, allt föreslås till Paco 1:1 — boten agerar först på "dale" |

**Ingen webbadmin i v1** — Pacos 1:1-chatt ÄR admingränssnittet
(designprincip). Eventuell läs-bara statussida är ett senare tillval.

### 3. Datalager — SQLite

Datamängden är trivial (hundratals rader/vecka): **SQLite** i en fil på
servern räcker gott (better-sqlite3/Drizzle). Nattlig backup = kopiera filen
till objektlagring (Backblaze B2/Hetzner Storage Box, gratis-/öresnivå).
Postgres blir aktuellt först om lösningen ska serva flera organisatörer.

Tabeller (kärnan): `players` (smeknamn fritt format, nummer, språk),
`sessions` (pass: typ pull/långpass/partido, hall, tid, nivå, storlek),
`signups` (pass × spelare, ✅-status, reservas-ordning), `availability`,
`pair_wishes` ("Machete spelar gärna med Gámez"), `results` (för rond 2).

### 4. Claude API — språkmotorn

Enbart för *tolkning* (NLU) och turisternas språk: es/en/sv in →
strukturerade kommandon ut. Volymen är låg (tiotals anrop/dag) →
**enstaka euro per månad** med en Haiku-klassmodell. Utgående meddelanden
till spelare byggs alltid ur Pacos mallar — LLM:en formulerar inte fritt.

## Hosting & drift

| Del | Val | Kostnad |
|---|---|---|
| Server | **Hetzner VPS** (minsta instansen, EU — Falkenstein/Helsingfors) med Docker Compose: app-container + **Caddy** (automatisk HTTPS/Let's Encrypt) | ~5 €/mån |
| Domän | valfri billig domän/subdomän för webhook-URL:en (t.ex. `asistente.<domän>`) | ~10 €/år |
| WhatsApp | servicekonversationer ≈ gratis; ev. mallmeddelanden | 0–5 €/mån |
| Claude API | NLU-anropen | 1–3 €/mån |
| Backup | nattlig SQLite-kopia till B2/Storage Box | ~0 € |
| Övervakning | UptimeRobot (gratis) pingar `/health` → mejl/push till Tommy | 0 € |
| **Totalt** | | **≈ 7–15 €/mån** |

Referens: en enda extra fylld pull (16 spelare à ~1 € till Paco) betalar mer
än en hel månads drift.

**Löpande drift i praktiken:**
- **Nästan ingen.** Docker `restart: always`, `unattended-upgrades` för
  OS-patchar, Caddy förnyar TLS själv, Meta-token är en permanent
  system-user-token (ingen rotation).
- Deploy: `git push` → GitHub Action som SSH:ar och kör
  `docker compose up -d --build` (eller manuellt vid behov — volymen är
  minimal).
- Larm: UptimeRobot-mejl om `/health` slutar svara. Ingen jour behövs tack
  vare **graceful failure-principen**: dör boten gör Paco exakt som idag —
  inget i gruppen är beroende av att tjänsten lever.

**Integritet/GDPR:** dataminimering (smeknamn som Paco skriver dem + nummer +
språk, inget mer), gamla pass raderas efter n dagar, samtyckesrad i botens
välkomstmeddelande, EU-hosting, Metas Business-villkor täcker
WhatsApp-ledet.

## Utrullningsplan

1. **Vecka 1 — sandbox-pilot:** Meta-testnummer + backend v0 (pull/yo/lista/
   sorteo, SQLite). Tommy + Paco + 2–3 spelare som registrerade testmottagare.
   Mål: Paco skapar ett riktigt pass via boten och klistrar in listan i
   gruppen.
2. **Vecka 2–3 — skarpt nummer + Pacos flöde:** produktionsnummer,
   visningsnamn godkänt, alla mallar exakt enligt `demo/scenario.js`,
   tillgänglighetsregister + nudgeförslag + kvällsresumé. Paco kör parallellt
   med sin vanliga metod (boten föreslår, han vidarebefordrar).
3. **Vecka 4+ — spelarna kopplas på:** botens nummer i gruppbeskrivningen
   ("för att apuntarse: skriv *yo* till asistenten"), turistspråken slås på,
   ev. Bizum-referenser i resumén. Inmotions-gruppen och kvällsgruppen läggs
   till som ytterligare "hallar" i samma installation (multi-hall är bara en
   kolumn i databasen — mallarna är redan identiska).

## Vad från demon återanvänds rakt av

- **Alla meddelandemallar** (`demo/scenario.js`) → botens mallfil.
- **i18n-ordböckerna** (`demo/i18n.js`) → botens es/en/sv-strängar.
- **Regelverket** dokumenterat i ANALYSIS.md (✅-regeln, reservas-upplyft,
  par-är-Pacos-principen, vinnarbanan-rotationen, passtyperna) → passmotorns
  spec, redan verifierad mot verkligheten.
