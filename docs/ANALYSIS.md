# Analys: Pacos metod för att organisera padel-pulls via WhatsApp

> **Status: PRELIMINÄR.** Baserad på chattutdrag och en skärmdump från gruppen
> *PULL MAÑANERAS DE 3ª* (juli 2026). Uppdateras när hela chattexporten finns i
> `source/chat-export.txt` — kör `npm run parse` och stäm av varje punkt nedan.

## Sammanhang

- **Plats:** Torre del Mar (Axarquía, Málaga). Spelarbas: mest spanska
  semesterfirare + lokala spelare. Hög omsättning på folk → ständigt inflöde av
  nya spelare.
- **Organisatör:** Paco. Han är navet: skapar spelen, jagar spelare, parar ihop,
  bokar banor på två hallar (bl.a. **Padelfly**, "fly" i chatten) och får en
  liten summa per organiserat spel → han vill maximera antalet fyllda pass.
- **Kanal:** WhatsApp, en grupp per hall/nivå (gruppen i skärmdumpen:
  *PULL MAÑANERAS DE 3ª*, ~520 medlemmar, långt ifrån alla aktiva).
- **Spelform:** "pull" = vinnarbanan. 16 spelare = 4 banor, 8 spelare = 2 banor.
  Vinnare flyttar upp mot bana 1, förlorare flyttar ner.

## Pacos listformat (hans "produkt")

Observerat format, återkommer i varje utrop:

```
Pull sabado
Hora ‼️‼️9:30‼️‼️
Nivel tercera
Lugar fly

1-machete✅
2 José Luis cañasveras✅
3- Gamez
4patiño✅
5-antonio martin✅
…
16 tellez✅

Reservas

Juan gonzalez
```

Egenskaper:

| Element | Observation | Tolkning |
|---|---|---|
| Rubrik | `Pull <dag>` + `Hora` (med ‼️-emfas) + `Nivel` + `Lugar` | Fast mall; tiden är det viktiga (dubbla ‼️) |
| Numrerad lista | Ojämn interpunktion: `1-`, `2 `, `3- `, `4patiño` | Skrivs/uppdateras för hand i farten, ofta mobil |
| `✅` | På de flesta men inte alla namn | Bekräftelsemarkör. **Öppen fråga:** spelarens egen bekräftelse eller Pacos verifiering/betalning? |
| `Reservas` | Egen sektion efter listan | Kölista; lyfts upp vid avhopp |
| Storlek | 16 platser (4 banor) resp. 8 platser (2 banor) | Listlängden = bokade banor |
| Nivåer | `tercera`, `cuarta alta` | Spansk nivåskala; separata pulls per nivå |

## Pacos kommunikationsstil

Direktcitat ur chatten:

- `Venga apuntaros para las 11'00 gracias` — utrop, informellt, `11'00`-format.
- `Venga chic@s dos más para cerrar la pull de las 11'00 vamos` — jagar de
  sista platserna; inkluderande `chic@s`; "cerrar la pull" = stänga listan.
- `Paco, creo que Machete quería cambiar a Patiño por Gamez, pregúntale? Jajaja`
  — spelare ber Paco om **byten/parningar**; Paco är skiljedomare.
- Stavning/förkortningar: `q` (que), `x privado` (por privado), utelämnade
  accenter. **Detta är stil, inte fel** — demon härmar det medvetet.

## Nyckelupptäckt: Paco använder redan ett lottningsverktyg

Skärmdumpen visar att Paco delar länkar från **echaloasuerte.com**
("Generación de grupos aleatorios") i gruppen — en per pull ("pull de las
9'30", "pull de las 11'00"). Alltså:

1. Paco är **inte** teknikfientlig — han är WhatsApp-centrerad. Verktyg som bor
   *i* chatten accepteras.
2. Lottningen är redan en etablerad del av flödet → en bot som lottar direkt i
   chatten ersätter ett externt moment han redan gör, i stället för att införa
   ett nytt beteende.
3. Ren slump matchar inte önskemålen (jfr bytet Machete/Gámez) → **lottning som
   respekterar önskemål** är den tydligaste förbättringen mot idag.

## Arbetsflödet idag (rekonstruerat)

1. **Utropet** (kvällen före/samma morgon): Paco postar mallen + jagar: "Venga…"
2. **Fyllnad:** spelare svarar; listan uppdateras manuellt om och om igen.
3. **Stängning:** när 8/16 nåtts — "cerrar la pull"; överskott → `Reservas`.
4. **Avhopp:** hanteras manuellt; reserv lyfts in.
5. **Lottning:** echaloasuerte.com-länk delas; byten jämkas manuellt efter
   kunskap om vem som vill spela med vem.
6. **Spel:** vinnarbanan-rotation på plats.
7. **Nästa dag:** allt börjar om. Multiplicera med 2–3 pass/dag och två hallar.

## Smärtpunkter (det demon adresserar)

| # | Smärta | Kostnad idag | I demon |
|---|---|---|---|
| 1 | Listan skrivs om manuellt vid varje förändring | Många små avbrott hela dagen | "yo" → listan uppdaterar sig själv, akt 2 |
| 2 | Jaga de sista platserna | Pacos uppmärksamhet | Auto-nudge med Pacos fras, akt 3 |
| 3 | Avhopp → hitta ersättare | Stress på morgonen | Reserva lyfts automatiskt, akt 4 |
| 4 | Lottning via extern sajt + manuella byten | Extra moment + gnäll | Sorteo i chatten som respekterar önskemål, akt 5 |
| 5 | Räkna ut vinnarbanan-rotationen | Huvudräkning på plats | Rond 2 genereras, akt 6 |
| 6 | Utländska turister faller bort (språk) | Förlorade intäkter | Boten svarar 1:1 på EN/SV, akt 7 |
| 7 | Ingen översikt över dagens spel/intäkter | Osynligt arbete | Privat dagsresumé med €, akt 8 |

## Öppna frågor att besvara med chattexporten

1. **Vem uppdaterar listan?** Kopierar spelarna hela listan och lägger till sig
   själva (vanligt i spanska grupper), eller redigerar/reposterar Paco? Avgör
   botens interaktionskontrakt och demons centrala caption (`cap.pain`).
2. **Vad betyder ✅ exakt?** Självbekräftelse, Pacos verifiering eller betalning?
3. **Exakt vinnarbanan-regel:** består paren mellan ronder (som demon antar) eller
   splittas de? Hur rapporteras resultat?
4. Hur ofta blir pulls **inte** fulla, och vad gör Paco då (slår ihop nivåer?
   ställer in? 8 i stället för 16)?
5. Bokningsflödet mot hallarna: när bokar/avbokar Paco banor, och kostar
   avbokningar honom något?
6. Frasfrekvens för Pacos rop (`npm run parse` ger listan) → justera botens
   nudge-fraser till hans vanligaste formuleringar.
