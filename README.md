# Asistente de Paco 🎾 — WhatsApp-demo för padel-pulls

En **privat demo** som visar hur Pacos dagliga organisering av padelmatcher
("pull" / vinnarbanan) i Torre del Mar skulle kunna se ut med en assistent-bot —
**utan att lämna WhatsApp**. Demon är en WhatsApp-*trogen simulator* (ren
HTML/CSS/JS, inga externa beroenden) som spelar upp ett skriptat scenario, plus
två automatiskt inspelade videor.

> **Obs:** Detta är en fristående demo/mockup. Den är inte ansluten till, eller
> affilierad med, WhatsApp/Meta. Alla telefonnummer är fejkade. Chattexporter
> och riktiga nummer hålls utanför repot (se `source/README.md`).

## Snabbstart

```bash
npm run demo        # serva demon på http://localhost:8080 (även på LAN för mobil)
```

Eller öppna `demo/index.html` direkt i en webbläsare (fungerar via `file://`).

**Styrning:** tryck/klicka (eller `Space`/`→`) för nästa steg · `↻` börjar om ·
`ES/EN/SV` växlar språk på berättartext och gränssnitt (chattinnehållet är
spanska — det är Pacos grupp).

**URL-parametrar:** `?autoplay=1` (självspelande) · `?lang=es|en|sv` ·
`?speed=8` (snabbare autoplay, för test) · `?record=1` (döljer kontroller) ·
`?beat=N` (hoppa direkt till steg N, för felsökning/screenshots).

> **Visa i mobil:** öppna via `npm run demo` och surfa till datorns LAN-adress.
> (iPhones Filer-app kör inte JavaScript pålitligt från lokala HTML-filer.)

## Spela in videorna

```bash
npm run check       # preflight: Chromium, färg-emoji, ffmpeg/H.264
npm run record      # spelar in videos/demo-es.mp4 + videos/demo-sv.mp4
```

Inspelningen kör demon i headless Chromium (1080×2340) och konverterar till
mp4 (H.264). Saknas en mp4-kapabel ffmpeg behålls .webm och det exakta
konverteringskommandot skrivs ut.

## Struktur

```
demo/       simulatorn (index.html, styles.css, app.js, scenario.js, i18n.js)
scripts/    check-env.mjs · record-video.mjs · parse-export.mjs
docs/       ANALYSIS.md (Pacos metod) · ROADMAP.md (vägen till riktig lösning) · PRESENTER.md (visningsmanus)
source/     gitignorerad plats för riktig chattexport (chat-export.txt)
videos/     demo-es.mp4 · demo-sv.mp4 (slutleveranser)
```

## Förfina med riktig chattdata

Lägg WhatsApp-exporten som `source/chat-export.txt` och kör `npm run parse` —
utfallet (fraser, listformat, mönster) används för att finslipa
`demo/scenario.js` och `docs/ANALYSIS.md`. Parsern skriver aldrig härledd data
till disk.

---

### English (short)

A private, self-contained WhatsApp-style simulator demoing an assistant bot for
Paco's daily padel "pull" organizing in Torre del Mar, plus auto-recorded demo
videos (`npm run record`). Not affiliated with WhatsApp/Meta; all phone numbers
are fake. Open `demo/index.html` or `npm run demo`; controls: tap to advance,
`ES/EN/SV` switches narration/UI language.
