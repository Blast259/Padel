# bot/ — Asistente de Paco v1.0

Pilotens "privata sekreterare" (se `docs/PILOT.md`): boten pratar bara 1:1,
förstår Pacos sju kommandon på förlåtande spanska och svarar med
klistra-in-färdiga listor i hans exakta format. **Noll externa beroenden** —
ren Node ≥ 20.

## Testa lokalt (ingen Meta-koppling behövs)

```bash
npm run bot:repl     # prata med boten i terminalen, som Paco
npm run bot:test     # kör testsviten (node:test)
```

REPL-state ligger i `bot/data/state-repl.json` (gitignorerad); `borrar todo`
eller radera filen för att börja om.

## Koppla mot WhatsApp (Metas testnummer — se docs/PILOT.md)

Miljövariabler (aldrig i repot):

| Variabel | Vad |
|---|---|
| `WHATSAPP_TOKEN` | permanent system-user-token |
| `PHONE_NUMBER_ID` | botens nummer-id (API Setup-sidan) |
| `VERIFY_TOKEN` | egen hemlig sträng, samma i Metas webhook-konfig |
| `APP_SECRET` | appens secret → signaturverifiering (rekommenderas) |
| `ALLOWED_NUMBERS` | kommaseparerad vitlista av wa_id — **tom = boten svarar ingen** |
| `STATE_FILE` | valfri, default `bot/data/state.json` |
| `PORT` | default 3000 |

```bash
WHATSAPP_TOKEN=... PHONE_NUMBER_ID=... ALLOWED_NUMBERS=34600...,4670... npm run bot:serve
```

Webhook-URL i Metas konfig: `https://<din-domän>/webhook` (GET-verifiering
och POST-mottagning på samma path; `/health` för övervakning). HTTPS via
Caddy enligt `docs/ARCHITECTURE.md`.

## Filer

```
parser.js     förlåtande kommandotolk (accenter/versaler/extra ord kvittar)
engine.js     passmotorn: listor, ✅, reservas-upplyft, sorteo (Pacos par,
              slumpade banor), rendering i Pacos format
responder.js  routing + sessionval (enordsfrågan «¿9'30 u 11'00?») + hjälptexter
store.js      JSON-fil med atomisk skrivning (SQLite kommer med skarpt läge)
server.js     Meta Cloud API-webhook: verifiering, signaturkontroll,
              vitlista (fail closed), dedupe av omförsök
repl.js       lokal testterminal
bot.test.js   testsviten
```

## Designregler (ur granskningsrundorna)

- **Tvetydigt «yo»/kommando utan tid** när två pulls är öppna → enordsfråga,
  aldrig gissning (Mikels fynd).
- **Avhopp** → första reserven lyfts in *bekräftad* på samma plats (belagt
  beteende i gruppen).
- **Sorteo** ändrar aldrig paren — Pacos par, slumpen sätter bara pistor.
- **Fel är gratis:** varje okänt kommando ger ett vänligt svar + hänvisning
  till *ayuda*; gruppen är aldrig beroende av boten.
