# Roadmap: från demo till riktig lösning

Demon i det här repot är en simulator — den visar *upplevelsen*. Det här
dokumentet beskriver ärligt hur (och om) den kan byggas på riktigt, per
komponent, med läget för WhatsApp-automation som det såg ut vid research i
juli/augusti 2026 (källor längst ner — verifiera igen före bygge, området rör
sig fort).

## TL;DR-rekommendation

**Bygg "1:1-sekreteraren" först.** En bot som pratar enskilt (1:1) med Paco och
med spelare via WhatsApps officiella Business/Cloud API, och som *författar*
grupplistorna åt Paco — han klistrar in/vidarebefordrar dem i gruppen precis
som idag. Ingen gruppautomation behövs, noll bannrisk, och om boten dör en dag
fortsätter Paco exakt som vanligt. Gruppbot-drömmen (som demon visar i akt 2–6)
är idag **inte** möjlig på officiell väg för Pacos befintliga grupper.

## Läget för WhatsApp-automation (2026)

| Väg | Status | Duger till Paco? |
|---|---|---|
| **Officiellt Cloud API, 1:1** | Moget, stabilt, gratis upp till volymgränser; servicefönster 24 h efter användarens senaste meddelande | ✅ Ja — kärnan i rekommendationen |
| **Officiellt Groups API** | Finns (beta/utökad utrullning) men: **max 8 deltagare per grupp**, gruppen måste skapas av företaget via invite-länk, kräver Official Business Account-status | ❌ Nej — 520-medlemsgrupper och 16-spelarpulls ryms inte; kan inte ta över *befintliga* grupper |
| **Inofficiella bibliotek** (whatsapp-web.js, Baileys m.fl.) | Fungerar tekniskt i grupper, men bryter mot WhatsApps användarvillkor; ML-baserad avstängningsdetektering; dokumenterad supply-chain-attack dec 2025 (förgiftad Baileys-fork "lotusbail", ~56k nedladdningar, stal auth-tokens) | ⚠️ Endast som medvetet risktagande på ett **separat** nummer som får offras — aldrig Pacos privata nummer |

## Arkitektur: "1:1-sekreteraren"

```
Spelare ──1:1──▶ ┌─────────────────────┐ ◀──1:1── Paco
"yo" / frågor    │  Bot (Cloud API)    │  "pull sabado 9'30 …"
EN/SV/ES         │  + liten backend    │  godkänner/justerar
                 │  (lista, reservas,  │
                 │   sorteo, resumé)   │
                 └─────────┬───────────┘
                           │ genererar färdig listtext
                           ▼
              Paco klistrar in i gruppen (som idag)
```

Flöde per pass:

1. Paco → bot (1:1): `pull sabado 9'30 tercera fly 16` → boten skapar passet.
2. Boten svarar med färdigformaterad lista (Pacos exakta mall) → Paco postar i
   gruppen. Vid varje förändring: uppdaterad text att klistra in (eller så
   postar Paco 2–3 ggr/dag i stället för 15).
3. Spelare som vill slippa gruppbruset kan skriva "yo" direkt till boten
   (numret sprids via gruppbeskrivningen/en fastnålad rad i listan). Turister
   får svar på sitt språk — botens NLU är flerspråkig (es/en/sv).
   **Tillgänglighetsregister:** spelare säger till boten (eller Paco
   vidarebefordrar) vilka dagar de kan — ett *"el domingo sí puedo"* räcker.
   Saknas platser föreslår boten en privat utfrågningsrunda och skickar Pacos
   egen fras (*"¿Puedes jugar mañana a las 9'30?"*) till lediga spelare efter
   hans godkännande. Detta ersätter hans i särklass tyngsta moment i dag
   (belagt i 1:1-chatten med Tommy).
4. Avhopp → boten uppdaterar, lyfter reserva, ger Paco ny text + förslag på
   utrop.
5. `sorteo` → banindelning som respekterar önskemål (bytesregister per spelare
   — "Machete spelar gärna med Gámez") → text till gruppen.
6. Kvällsresumé 1:1 till Paco: pass, spelare, nya spelare, uppskattad
   kommission.

**Poängen:** gruppen förblir Pacos scen. Boten är hans osynliga sekreterare.
Det matchar också spelarnas invändning ("Paco har sitt eget sätt") — ingenting
i gruppens yta förändras utom att listorna alltid stämmer.

**Belägg ur chatten (2026-08-01):** Pacos listposter är märkta
*"Vidarebefordrat"* — han underhåller redan listan någon annanstans och
vidarebefordrar den uppdaterade versionen in i gruppen. 1:1-sekreteraren
ändrar alltså inte hans beteende över huvud taget; den byter bara ut källan
han vidarebefordrar ifrån mot en som alltid har listan färdig och korrekt.

### Steg 2 (om Paco vill mer)

- **Knappar/listor i 1:1** (interaktiva meddelanden i Cloud API) för "yo",
  "me caigo", "sorteo".
- **Bokningsstöd:** påminnelser om att boka/avboka banor mot hallarna;
  eventuell integration om hallarna har API (Playtomic-anslutna hallar har det
  ibland — undersök vad Padelfly kör).
- **Betalspår:** Bizum-referenser per spelare i resumén (vanligast i Spanien).
- **Gruppbot på riktigt** ifall Groups API-taket höjs väsentligt — omvärdera
  då; arkitekturen ovan återanvänds rakt av (samma backend, ny kanal).

## Teknikval (förslag)

| Del | Val | Motiv |
|---|---|---|
| WhatsApp-koppling | Meta Cloud API direkt (eller via Twilio om enklare onboarding) | Officiellt, billigt i Pacos volymer |
| Backend | Liten Node/TypeScript-tjänst + SQLite/Postgres | En person kan drifta; passen är smådata |
| NLU | Regex/mallar för kommandon + LLM-fallback för fritext (turistfrågor) | Kommandona är 90 % av trafiken |
| Hosting | Valfri liten VPS/serverless | Budget: enstaka euro/månad |
| Språk | i18n-ordböcker es/en/sv (samma nycklar som demon) | Redan designat |

## Kostnadsbild (grovt)

- Cloud API: service-konversationer inom 24-timmarsfönstret är i praktiken
  gratis/mycket billiga i denna volym (hundratals/mån). Mallmeddelanden
  (utanför fönstret, t.ex. morgonpåminnelser) kostar per styck — håll dem få.
- Drift: ~5 €/mån VPS. Total driftkostnad under det Paco tjänar på ett enda
  extra fyllt pass.

## Risker & motmedel

1. **Adoption (störst):** lösningen får aldrig kräva att Paco ändrar sin metod.
   → 1:1-sekreteraren är additiv; PRESENTER.md:s pitch bygger på det.
2. **Meta ändrar regler/priser:** → all logik ligger i egen backend;
   WhatsApp-lagret är tunt och utbytbart.
3. **Nummer/verifiering:** Cloud API kräver ett företagsnummer (inte Pacos
   privata). → skaffa ett dedikerat spanskt nummer till boten.
4. **GDPR/integritet:** spelarlistor är persondata. → minimera (smeknamn +
   nummer), radera gamla pass, be om samtycke i botens välkomstmeddelande.
5. **Frestelsen att köra inofficiellt i gruppen:** → gör det aldrig på Pacos
   nummer; lotusbail-attacken visar att även *verktygskedjan* är fientlig.

## Källor (hämtade juli/aug 2026)

- Meta: WhatsApp Business Platform — Groups API-dokumentation
  (developers.facebook.com/documentation/business-messaging/whatsapp/groups)
  — deltagartak 8, invite-flöde, OBA-krav; samt Groups Messaging-sidorna.
- imBee: "WhatsApp Groups API — Business Guide 2026" — utrullningsläge och
  begränsningar.
- Jämförelser Cloud API vs inofficiella bibliotek + bannriskgenomgångar
  (whatsapp.checkleaked.cc, sporesec.com, blog.kraya-ai.com) — ML-detektering,
  avstängningsvågor.
- Rapportering om "lotusbail"-supply-chain-attacken mot Baileys-ekosystemet
  (dec 2025).
