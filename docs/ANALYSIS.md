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
- **Kanal:** WhatsApp, en grupp per hall (*PULL MAÑANERAS DE 3ª*,
  ~520 medlemmar). **Denna grupp täcker Padelfly** — "fly" och "padelfly" i
  listorna är samma hall — med dagens två pass: **9:30 (tercera)** och
  **11:00 (cuarta alta)**; därav dubbellistan i ett och samma meddelande
  *(bekräftat av Tommy)*. Paco skickar även servicemeddelanden ("festivalen
  ikväll, vägen från El Ingenio till Aldi är avstängd — ta andra vägar") och
  hälsar nya välkomna personligen: *"Bienvenido al grupo pepe"*.
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
  `1.German/6.Vicki` och rad 6 tömts — listkorruption vid manuell redigering,
  synlig i Pacos eget vidarebefordrade meddelande (skärmdump). Starkaste
  beviset för smärtpunkt #1.
- `✅` **sätts av Paco ensam** när en spelare är säkrad/verifierad — troligen
  avstämt via privat chatt (Tommys uppgift; exakta mekaniken oklar även för
  spelarna). Namn utan ✅ (jfr Gamez) = ännu inte verifierade. Markören används
  i pull-listorna men inte i långpass-formatet. Botens demoregel — direkt svar
  från spelaren ⇒ ✅, tredjepartsinskrivning ⇒ utan ✅ tills spelaren bekräftar
  — speglar Pacos praxis och tar bort hans manuella avstämningsrunda.
- **Reserva-upplyft händer på riktigt:** mellan två upplagor försvinner
  `2- ola✅` och första reserven *José Luis cañasveras* tar plats 2, varpå
  Reservas krymper. Precis det flöde demon automatiserar i akt 4.

## Nyckelfynd: listorna vidarebefordras in i gruppen

Skärmdump (2026-08-01 19:53) visar söndagslistan postad av Paco själv
(~pacoberenguer) och **märkt "Vidarebefordrat"**, i två upplagor (12:40 och
14:36) där enbart nya namn skiljer. Paco underhåller alltså listan någon
annanstans (annan chatt/anteckning) och **vidarebefordrar den uppdaterade
versionen** in i gruppen. Konsekvens: *"1:1-sekreterare"-arkitekturen i
ROADMAP.md matchar hans befintliga muskelminne exakt* — boten blir källan han
vidarebefordrar ifrån, och gruppens yta förändras inte alls.

## Nyckelfynd 2: motorn är privata chattar (1:1)

Skärmdump av Pacos 1:1-chatt med Tommy (2026-07-31/08-01) visar hur spel
faktiskt bemannas:

- **Paco rekryterar aktivt privat:** *"Puedes jugar mañana a las 11'00?"*
- **Spelare rapporterar tillgänglighet i samma tråd:** Tommy tackar nej till
  lördagen men säger *"El domingo sí puedo jugar"* …
- **… och Paco minns och agerar:** nästa morgon skriver han *"Te apunto para
  mañana a las 9'00 hasta las 11'00 una pull en padelfly por el mismo precio
  vale.."* — han skriver upp Tommy själv. `7 tommy` i söndagslistan kom alltså
  ur 1:1-tråden; Tommy skrev aldrig något i gruppen.
- Tommys vittnesmål: spelare brukar meddela Paco privat vilka dagar de är
  tillgängliga — *"det blir väldigt mycket admin"*.
- Notera även prisreferensen (*"por el mismo precio"*) — även betalfrågor bor
  i 1:1-trådarna.

**Slutsats:** Paco är listans enda redaktör, och han driver ett mentalt
tillgänglighetsregister över ~520 medlemmar via en-och-en-chattar. Det — inte
själva listredigeringen — är hans tyngsta osynliga arbete. Demons akt 3 visar
numera exakt detta: boten känner tillgängligheten och ställer Pacos egen fråga
privat, efter hans "dale".

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

## Söndagsformatet: sällsynt 2-timmarspass (fråga löst)

```
Domingo
2 Agosto de 9.00 a 11.00 en padelfly
1.German
2.Damian
…
Reserva
JOSÉ LUIS 🇪🇸
```

Tommy bekräftar: söndagen är ett **enda långt pass 9.00–11.00** (ovanligt men
det händer) i stället för dagens normala två pull-pass — och skärmdumpen visar
att listan postas av **Paco själv**. Samma organisatör använder alltså olika
mallar per *passtyp*: punktnumrering (`1.German`), tidsintervall i stället för
starttid, `Reserva` i singular, versal reserv med 🇪🇸, ingen nivårad, inga ✅.
→ En riktig bot behöver mallar per passtyp (pull resp. långpass), inte per
organisatör.

## Arbetsflödet idag (rekonstruerat, nu belagt)

1. **Utrop** med dubbellistan (alla pass för dagen i ett meddelande).
2. **Fyllnad i två kanaler:** dels "yo" i gruppen, dels — själva motorn —
   Pacos privata frågor till spelare han vet är lediga (*"Puedes jugar
   mañana…?"*) och spelarnas inrapporterade tillgänglighet. Paco för själv in
   namnen och vidarebefordrar den uppdaterade listan; han ropar i gruppen när
   det står still.
3. **Stängning** vid fullt; överskott → `Reservas`.
4. **Avhopp:** reserv lyfts in manuellt (belagt fall: ola → José Luis).
5. **Lottning:** pista-blocken postas (verktyg: echaloasuerte.com enligt
   skärmdump); byten förhandlas efteråt.
6. **Spel:** vinnarbanan. 7. **Repetera** — två pass/dag i denna grupp
   (9:30 + 11:00 på Padelfly), plus den andra hallens grupp.

## Smärtpunkter → demons svar

| # | Smärta (belagd i datan) | I demon |
|---|---|---|
| 1 | Hela dubbellistan repostas för varje namn; korruption förekommer (`1.German/6.Vicki`) | "yo" → listan uppdaterar sig själv (akt 2) |
| 2 | Jaga platser: rop i gruppen + privata frågor en och en (*"Puedes jugar mañana a las 11'00?"*) och ett mentalt tillgänglighetsregister | Auto-nudge med hans fras + boten frågar lediga spelare privat efter Pacos «dale» (akt 3) |
| 3 | Avhopp → manuellt reserva-upplyft (belagt: ola→José Luis) | Automatiskt upplyft (akt 4) |
| 4 | Extern lottning + efterförhandlingar (Machete/Patiño/Gámez) | Sorteo i chatten, i hans pista-format, som respekterar önskemål (akt 5) |
| 5 | Vinnarbanan-rotationen räknas för hand | Rond 2 genereras (akt 6) |
| 6 | Utländska spelare (jfr "John", turister) och språk | Boten svarar 1:1 på EN/SV (akt 7) |
| 7 | Osynligt arbete, ingen översikt | Privat dagsresumé med 💶 (akt 8) |

Dessutom belagt men ännu inte i demon: **flexibel pullstorlek** (8→12) — en
framtida botfunktion ("reservas fylls på → föreslå en tredje pista"), och
**servicemeddelanden** (trafik/festival) som förblir Pacos mänskliga roll.

## Kvarstående öppna frågor

1. Vinnarbanan-detaljer: består paren mellan ronder (demons antagande) eller
   splittas de? Hur rapporteras resultat i praktiken?
2. Bokningsflödet mot hallarna (när bokas/avbokas banor, kostnad vid
   avbokning) och prislogiken (*"por el mismo precio"*).

*(Löst 2026-08-01: ✅ sätts av Paco ensam vid säkrad/verifierad spelare,
troligen via privat avstämning — Tommys uppgift. Löst tidigare: vem som
underhåller listan, söndagsformatet, lottningsformatet.)*
