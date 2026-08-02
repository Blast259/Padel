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
- **Kanal:** WhatsApp — **tre grupper** (alla drivna av Paco, samma nummer;
  kartan oberoende bekräftad av Mikel, som är medlem i alla tre):
  1. *PULL MAÑANERAS DE 3ª..4A* (~520 medl.) — **Padelfly morgon**: 9:30
     (tercera) + 11:00 (cuarta alta) i ett dubbelmeddelande — gruppnamnets
     nivåspann 3ª–4A förklarar varför båda nivåerna delar grupp *(bekräftat
     av Tommy; "fly" = "padelfly" = samma hall)*.
  2. *PULL Y PARTIDOS PADELFLY* (~505 medl.) — **Padelfly
     eftermiddag/kväll**: pull 19'30 (12 platser = 3 banor) + **partido
     21'00 (4 platser = en bana)**; nivåspann som *"cuarta alta tercera
     baja"*; samma dynamik som morgongrupperna enligt Mikel.
  3. *Pull&partidos inmotions* — grannhallen **Inmotions**, morgon *och*
     kväll; skärmdump visar exakt samma pull-mall (12 platser, cuarta alta,
     alla ✅) → mallarna är portabla över hallar.
  Sammantaget: uppemot 5–6 pass per dag över tre grupper med ~1 500
  medlemskap (med överlapp) — det är skalan på Pacos dagliga admin.
- **Överflödeskanal (Mikel):** när spelare saknas postar Paco ibland i en
  extern grupp han **inte** driver själv — *"PadelMar 🎾🎾🎾"*. Hans
  eskalationstrappa för svårfyllda pass är alltså: stående platser → rop i
  egna gruppen → privata frågor → externt inlägg i PadelMar. Paco skickar även servicemeddelanden ("festivalen
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
- **Identifiering via relationer:** spelare utan känt namn skrivs in som
  *"Compi de pepe lucena"*, *"eduardo hermano de santi"*, *"Pablo padre de
  nacho"* — Pacos register är socialt, inte formellt. En bot måste tillåta
  fritextnamn precis så här.
- **Meddelanden raderas också** (Inmotions-gruppen visar "meddelandet
  raderades" från Paco) — ytterligare churn i dagens flöde.

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

**Live-korroborering (Mikels 1:1 med Paco, 2026-08-02):** samma dag som
analysen skrevs fick Mikel själv utfrågningen i realtid — *"Para mañana a las
11'00 te apunto ?"* (kl 12:04; elvan, precis som förutsagt). När han tackade
nej kom dessutom ett **motbud**: *"Por la tarde a las 18'00 podrías jugar
mañana?"* — Paco korsförsäljer alltså andra pass vid nej (nytt botbeteende
att spegla). Och för tisdagens nivå 3-pool syntes **grindvaktsfrasen**:
*"E de mirar si hay hueco ok"* — inträde i poolen går via Pacos bedömning av
"hueco", helt i linje med inre cirkeln-fyndet. (Även: ännu ett raderat
Paco-meddelande, och 18'00 som ytterligare passtid.) Mikels processfråga till
Paco — *"¿Cuándo abres la lista?"* — väntar på svar; det ger botens
öppningsschema.

## Den inre cirkeln — stående platser (granskningsfynd, Mikel 2026-08-02)

Mikels andra granskningsrunda avslöjade systemets sociala arkitektur:

- Det finns en **inre cirkel av stammisar** med fasta veckomönster — vissa
  spelar varje dag, andra mån/ons/fre, andra bara tisdag förmiddag.
  **Tisdag förmiddag är nivå 3-poolen och märkbart mer krävande** än övriga
  dagar — veckodagarna har alltså egna nivåidentiteter och egna stammisgäng.
- Stammisarna ser platsen som självklar (*"God given right"*): de hamnar på
  listan **utan att göra något** — eller via direktkontakt med Paco. Exakt
  hur "the magical inner circle" fungerar vet inte ens spelarna — den bor i
  Pacos huvud.
- **Adoptionsrisk:** tvingas stammisarna skriva "yo" som alla andra upplevs
  det som en degradering — och det är de mest inflytelserika spelarna.

**Dimensionering (Mikel, uppföljning):** morgonens två pooler beter sig helt
olika. **09:30 (4 banor/16 platser) är i praktiken helfijos** — "usually full
or nearly full when the list is published and the same people are there
every day" — listan publiceras alltså redan försådd, vilket bekräftar att
stående platser är normen, inte undantaget. **11:00 är det svårfyllda
passet:** "Paco normally has to beg people to play at 11:00", oftast bara
2–3 banor. → Assistentens ekonomiska värde ligger inte i 09:30 (sköter sig
självt) utan i att **fylla elvan**: tillgänglighetsregistret, de privata
utfrågningarna och turistinflödet ska riktas dit. Varje extra fylld
11:00-bana är ren ny intäkt för hallen och Paco.

**Designkonsekvens (redan förenlig med grundprincipen, nu explicit):**
1. **"Fijos"-register** — stående platser per veckomönster. Boten försår
   listan med stammisarna *innan* publicering, precis som Paco gör idag.
   De gör ingenting och står ändå med; avbokning är opt-out ("me caigo"),
   inte opt-in.
2. **Hierarkin förblir osynlig och Paco-ägd.** Inga nivåer/etiketter syns
   utåt — listan dyker bara upp med de vanliga namnen redan ifyllda, som
   alltid. Direktkanalen till Paco fortsätter fungera: han säger "apunta a X"
   och boten lyder (Gamez-scenen i demon är exakt detta).

- **Fasta par** hela passet — paret rör sig tillsammans, inga partnerbyten
  (till skillnad från americano).
- **Vinst** → paret flyttar upp en bana mot vinnarbanan; på vinnarbanan
  försvarar man platsen. **Förlust** → ner en bana; på lägsta banan står man
  kvar.
- Matcherna spelas **först till 6 gem** — då ropar någon *"¡tiempo!"* och alla
  roterar — alternativt på tid (10–12 min) med **punto de oro** vid oavgjort.
- Demons rond 2-logik (paren består, vinnare upp/förlorare ner) är alltså
  korrekt, och machetes resultatrapport "6-3" stämmer med gem-formatet.

## Ekonomin (Tommys uppgifter)

- Spelare betalar **~4 € per pass** (1,5 h: 9:30–11:00 eller 11:00–12:30).
- Pacos andel är okänd; Tommys gissning **~1 €/spelare** — demons
  resumé-exempel ("ej. 1 €/jugador") ligger alltså rätt.
- Skalan: en fullbelagd sommardag (5–6 pass × 12–16 spelare över tre grupper)
  omsätter flera hundra euro — varje ofyllt pass är direkt förlorad intäkt för
  både hallen och Paco. Det är det ekonomiska argumentet för boten.

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

**Mekaniken bakom (bekräftad med skärmdumpar på resultatsidan):** Paco matar
in **färdiga par** i echaloasuerte.com ("Generación de grupos aleatorios" →
"Grupos generados": *Emilio-Jaime*, *Rafa cortes-santi* …) — parbildningen är
hans hantverk, byggt på kunskap och önskemål — och verktyget slumpar bara
**vilken bana (Grupo 1–4) varje par startar på**. Resultatet delas som länk +
skärmdump i gruppen. En bot ska bevara exakt den ansvarsfördelningen:
**paren är Pacos, slumpen sätter bara startbanor** — och önskemål blir data i
stället för efterförhandling.

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

## Passtyp 3: partido (en bana, 4 platser)

Kvällsgruppen visar även formatet för vanliga matcher:

```
Partido jueves
Hora 21'00
Lugar padelfly
Nivel cuarta alta tercera baja
.1-
2-
3-
4-
Reservas
```

Fyra platser = en bana, ingen vinnarbana. Nivå anges ibland som spann
(*"cuarta alta tercera baja"*) och kan hamna på Lugar-raden — mallarna är
levande, inte strikta.

**Summering — passtyper en bot behöver:** **pull** (8–16 platser, vinnarbana,
flexibel storlek), **långpass** (2 h, punktnumrering), **partido** (4
platser, en bana). Mallar per passtyp, inte per organisatör.

## Arbetsflödet idag (rekonstruerat, nu belagt)

1. **Utrop** med dubbellistan (alla pass för dagen i ett meddelande).
2. **Fyllnad i två kanaler:** dels "yo" i gruppen, dels — själva motorn —
   Pacos privata frågor till spelare han vet är lediga (*"Puedes jugar
   mañana…?"*) och spelarnas inrapporterade tillgänglighet. Paco för själv in
   namnen och vidarebefordrar den uppdaterade listan; han ropar i gruppen när
   det står still.
3. **Stängning** vid fullt; överskott → `Reservas`.
4. **Avhopp:** reserv lyfts in manuellt (belagt fall: ola → José Luis).
5. **Lottning:** Paco bildar paren för hand, matar in dem i echaloasuerte.com
   som slumpar startbanor; pista-block/länk + skärmdump postas; byten
   förhandlas efteråt.
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
Ur första granskningsrundan (Mikel, 2026-08-02) dessutom: **meddelanden
dygnet runt** — Paco klagar återkommande på folk som skriver kl. 02 —
adresseras av beredskapsläget i ROADMAP.md (boten sover aldrig; Paco vaknar
till en resumé i stället för notisstormen). Och: **sena ankomster/no-shows**
— "Paco is constantly moaning at people who do this"; när någon är sen
klagas det i gruppen, och Paco är ofta inte på plats vid starttid, "and
everything falls apart" → incheckningsping, "falta X"-flöde och ett privat
punktlighetsregister (se ROADMAP.md, *Puntualidad*; visas i demons sen
ankomst-scen).

## Kvarstående öppna frågor

1. Bokningsflödet mot hallarna: när bokar/avbokar Paco banor, och kostar
   avbokningar honom något?

*(Löst 2026-08-01, samtliga via Tommy: listunderhållet — Paco ensam, via
vidarebefordran; motorn — privata chattar + tillgänglighetsminne;
✅-semantiken — Pacos verifieringsmarkör; söndagsformatet — hans eget
långpass; lottningsformatet och -mekaniken — par för hand, slumpade
startbanor; vinnarbanan-reglerna — fasta par, upp/ner, 6 gem/"¡tiempo!",
punto de oro; ekonomin — ~4 €/spelare och pass, Pacos andel gissningsvis
~1 €/spelare.)*
