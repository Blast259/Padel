# Analys: Pacos metod för att organisera padel-pulls via WhatsApp

> **Status: verifierad mot riktig chattdata 2026-08-01.** Underlag: chattutdrag,
> en skärmdump samt ett längre manuellt kopierat sjok ur gruppen (meddelande-
> kroppar utan tidsstämplar/avsändare — export är blockerad av gruppens
> *Avancerade chattsekretess*). Rådatan ligger gitignorerad i
> `source/chat-export.txt`. Kvarstående osäkerheter listas längst ner.

## Sammanhang

- **Plats:** Torre del Mar (Axarquía, Málaga). Spelarbas: mest spanska
  semesterfirare + lokala spelare. Hög omsättning → ständigt nya namn
  (chatten visar t.o.m. platshållare som *"Compi de pepe lucena"* — folk
  skriver upp kompisar utan namn).
- **Organisatör:** Paco. Han skapar spelen, jagar spelare, parar ihop, bokar
  banor på två hallar (**Padelfly**/"fly") och får en slant per organiserat
  spel → han vill maximera antalet fyllda pass.
- **Kanal:** WhatsApp, grupp per hall/nivå (*PULL MAÑANERAS DE 3ª*,
  ~520 medlemmar). Han skickar även servicemeddelanden ("festivalen ikväll,
  vägen från El Ingenio till Aldi är avstängd — ta andra vägar") och hälsar
  nya välkomna personligen: *"Bienvenido al grupo pepe"*.
- **Spelform:** "pull" = vinnarbanan. 16 platser = 4 banor, 8 = 2 banor —
  och **storleken flexar**: i datan utökas 11:00-pullen från 8 till 12 platser
  (en tredje bana) när efterfrågan kom.

## Listformatet (bekräftat i många upplagor)

```
Pull sabado
Hora ‼️‼️9:30‼️‼️
Nivel tercera
Lugar fly

1-machete✅
2 José Luis cañasveras✅
3- Gamez
4patiño✅
…
16 tellez✅

Reservas

Juan gonzalez
```

- **Hela dubbelmeddelandet repostas vid varje förändring** (både 9:30- och
  11:00-listan i samma meddelande) — datan innehåller 9+ nästan identiska
  upplagor där en enda rad skiljer. Det är exakt denna repetition boten tar
  över.
- Ojämn numrering (`1-`, `2 `, `4patiño`, `6 - ale`) — handredigering i mobil.
- **Handhavandefel förekommer:** i en upplaga har rad 1 blivit
  `1.German/6.Vicki` och rad 6 tömts — listkorruption vid manuell redigering.
  Starkaste beviset för smärtpunkt #1.
- `✅` finns i lördagslistorna men **inte alls** i söndagslistan → markören är
  formatberoende (se öppna frågor).
- **Reserva-upplyft händer på riktigt:** mellan två upplagor försvinner
  `2- ola✅` och första reserven *José Luis cañasveras* tar plats 2, varpå
  Reservas krymper. Precis det flöde demon automatiserar i akt 4.

## Lottningsformatet (bekräftat — viktigt!)

Pacos riktiga banindelning ser ut så här (citat):

```
Pull sábado 9'30

Pista 1
Tellez - olé
Marcos- Zamora

Pista 2
Borja - John
Machete - Patiño
…
```

Alltså: `Pista N` + **ett par per rad** (`Spelare - Spelare`), inte allt på en
rad. Demons sorteo- och rond 2-meddelanden följer numera exakt detta format.
Notera även kopplingen till bytesönskemålet i chatten ("Machete quería cambiar
a Patiño por Gamez") — lottningen hade parat Machete–Patiño, och machete ville
ha Gámez: **efterlottnings-förhandlingar är ett verkligt moment** som botens
önskemåls-respekterande sorteo eliminerar.

## Pacos röst (frasinventarium ur datan)

- `Venga chic@s dos más para cerrar la pull de las 11'00 vamos`
- `Venga uno más solo chavales` / `Venga uno más` / `Vamos dos más chicos`
- `Vamos vuelven a faltar dos para las 11'00!!`
- `Venga uno más solo chaval@s💪🏻🎾🎾💪🏻`
- `Bienvenido al grupo pepe`
- Mönster: **"Venga/Vamos" + antal som saknas + tid + framåtdriv**, ofta med
  💪🏻🎾. Botens nudge i demon använder numera den literala frasen.

## Andra format i samma grupp

Söndagspasset ser annorlunda ut:

```
Domingo
2 Agosto de 9.00 a 11.00 en padelfly
1.German
2.Damian
…
Reserva
JOSÉ LUIS 🇪🇸
```

Punktnumrering (`1.German`), tidsintervall i stället för starttid, `Reserva` i
singular, versal reserv med flagga, ingen nivårad och inga ✅. Trolig
förklaring: annan organisatör eller annat passformat (öppet 2-timmarspass).
→ En riktig bot måste antingen låsas till Pacos pull-format eller lära sig
flera mallar per organisatör.

## Arbetsflödet idag (rekonstruerat, nu belagt)

1. **Utrop** med dubbellistan (alla pass för dagen i ett meddelande).
2. **Fyllnad:** namn tillkommer ett i taget; hela meddelandet repostas varje
   gång; Paco ropar när det står still.
3. **Stängning** vid fullt; överskott → `Reservas`.
4. **Avhopp:** reserv lyfts in manuellt (belagt fall: ola → José Luis).
5. **Lottning:** pista-blocken postas (verktyg: echaloasuerte.com enligt
   skärmdump); byten förhandlas efteråt.
6. **Spel:** vinnarbanan. 7. **Repetera** — 2–3 pass/dag, två hallar.

## Smärtpunkter → demons svar

| # | Smärta (belagd i datan) | I demon |
|---|---|---|
| 1 | Hela dubbellistan repostas för varje namn; korruption förekommer (`1.German/6.Vicki`) | "yo" → listan uppdaterar sig själv (akt 2) |
| 2 | Paco ropar manuellt när det står still (7 varianter i datan) | Auto-nudge med hans literala fras (akt 3) |
| 3 | Avhopp → manuellt reserva-upplyft (belagt: ola→José Luis) | Automatiskt upplyft (akt 4) |
| 4 | Extern lottning + efterförhandlingar (Machete/Patiño/Gámez) | Sorteo i chatten, i hans pista-format, som respekterar önskemål (akt 5) |
| 5 | Vinnarbanan-rotationen räknas för hand | Rond 2 genereras (akt 6) |
| 6 | Utländska spelare (jfr "John", turister) och språk | Boten svarar 1:1 på EN/SV (akt 7) |
| 7 | Osynligt arbete, ingen översikt | Privat dagsresumé med 💶 (akt 8) |

Dessutom belagt men ännu inte i demon: **flexibel pullstorlek** (8→12) — en
framtida botfunktion ("reservas fylls på → föreslå en tredje pista"), och
**servicemeddelanden** (trafik/festival) som förblir Pacos mänskliga roll.

## Kvarstående öppna frågor

1. **Vem redigerar listan idag?** Kopiedatan saknar avsändare. Indicier
   (en-rad-i-taget-tillväxt + korruptionsfelet) pekar mot att spelarna själva
   kopierar och lägger till sig, men Paco kan också vara den som reposterar.
   *Tommy kan svara direkt — han skrev upp sig själv som `7 tommy` i
   söndagslistan.*
2. **✅-semantiken:** självbekräftelse, Pacos verifiering eller betalning?
   (Och varför saknas ✅ helt i söndagsformatet?)
3. **Är söndagspasset en annan organisatör?** Påverkar hur många mallar en
   riktig bot behöver.
4. Vinnarbanan-detaljer: består paren mellan ronder (demons antagande) eller
   splittas de? Hur rapporteras resultat i praktiken?
5. Bokningsflödet mot hallarna (när bokas/avbokas banor, kostnad vid
   avbokning).
