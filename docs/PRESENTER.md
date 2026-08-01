# Visningsmanus: så överraskar du Paco

Målet är inte att visa teknik — det är att Paco ska känna **"den här förstår
hur jag jobbar"** inom 30 sekunder. Allt i demon är byggt kring hans eget
format, hans egna fraser och hans spelares riktiga smeknamn.

## Före visningen (5 min förberedelse)

1. **Ladda demon i din mobil:** kör `npm run demo` på datorn och öppna
   LAN-adressen i mobilens webbläsare (eller öppna `demo/index.html` på en
   Android direkt). Testa ett par tryck. Ställ språket på **ES**.
   *(iPhone: använd webbläsare mot `npm run demo` — Filer-appen kör inte
   JavaScript pålitligt.)*
2. **Ha videon som reserv:** `videos/demo-es.mp4` på mobilen ifall nätet
   strular. (Din svenska version: `videos/demo-sv.mp4` — titta på den innan så
   du kan flödet.)
3. Välj ett lugnt tillfälle — efter ett pass, med kaffe. Inte mitt i när han
   fyller en lista.

## Pitchen (90 sekunder, förslag på ordval)

> "Paco, jag har inte byggt någon app. Alla sa ju att du har ditt eget sätt —
> och det är sant, ditt sätt funkar. Så jag lät bygga något som jobbar **åt**
> dig, **inne i WhatsApp**. Titta: det här är din grupp. Du skriver *en* rad —
> och assistenten gör listan. Killarna skriver 'yo' precis som vanligt — och
> listan uppdaterar sig själv. I ditt format. Med dina ✅."

Räck honom telefonen och låt **honom** trycka sig framåt. Demon är byggd för
det: varje tryck = nästa händelse.

## Ögonblicken att låta landa (i ordning)

| Akt | Vad som händer | Varför det träffar Paco |
|---|---|---|
| 1 | `pull sabado 9'30 tercera fly 16` → färdig lista | En rad ersätter kvällens tangentarbete |
| 2 | "yo" → listan växer själv; `apunta a gamez q me lo dijo x privado` funkar | Boten lyder *honom*, även hans stavning |
| 3 | Boten ropar "Venga chic@s faltan 2…" | Hans egen röst, automatiserad — brukar ge skratt |
| 4 | chichi hoppar av → Juan gonzalez in automatiskt | Morgonstressen som försvinner |
| 5 | Sorteo direkt i chatten, med Machete/Gámez-bytet respekterat | **Killer-featuren** — han slipper echaloasuerte.com OCH gnället efter lottningen |
| 6 | Rond 2 räknas ut (vinnare upp/förlorare ner) | Huvudräkningen på banan försvinner |
| 7 | John (engelska) och **Tommy (svenska!)** bokas in 1:1 | Turister = pengar han idag tappar. Och: ditt namn i demon — överraskningen |
| 8 | Kvällsresumé med 💶 | Hans arbete blir synligt, i euro |

Slutkortet säger resten: *"Hecho con cariño para Paco 🇪🇸 — Tommy 🇸🇪"*.

## Invändningar och svar

- **"Yo tengo mi sistema."** — "Exakt. Det här ÄR ditt system — samma grupp,
  samma listor, samma ✅. Skillnaden är att du slipper skriva om listan femton
  gånger om dagen."
- **"¿Y si el robot se equivoca?"** — "Du bestämmer, den lyder. Allt den gör
  kan du skriva över med ett meddelande — som med Gámez."
- **"¿Y si un día no funciona?"** — "Då gör du precis som idag. Den ersätter
  ingenting — den avlastar."
- **"¿Cuánto cuesta?"** — "Mindre än vad ett enda extra fyllt pass ger dig per
  månad." (Se ROADMAP.md — driftkostnaden är enstaka euro.)
- **"¿Esto existe de verdad?"** — Var ärlig: "Det här är en genomspelad demo —
  men allt den visar går att bygga. Första riktiga versionen är en assistent du
  pratar med privat, som skriver listorna åt dig." (ROADMAP.md förklarar
  varför gruppboten tas i steg två.)

## Viktigt att INTE göra

- Publicera inte demon/videon offentligt (spelarnas riktiga smeknamn; WhatsApp-
  utseendet). Den är för Paco och grabbarna.
- Lova inte datum. Nästa steg efter ett "vamos" från Paco: svara på de öppna
  frågorna i ANALYSIS.md + exportera chatten, sedan byggs 1:1-sekreteraren.
- Tvinga inget beslut. Demon får gärna bara vara en kärleksförklaring till hans
  arbete — det räcker som utfall den här dagen.

## Om han nappar — nästa konkreta steg

1. Du exporterar gruppchatten (utan media) → `source/chat-export.txt` →
   `npm run parse` → finslipa boten mot hans verkliga fraser.
2. Skaffa ett dedikerat spanskt nummer till boten (inte Pacos).
3. Bygg 1:1-sekreteraren enligt ROADMAP.md, pilotkör en vecka parallellt med
   hans vanliga flöde — boten *föreslår*, Paco postar.
