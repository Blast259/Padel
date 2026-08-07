# Pilot v1.0 — "Pacos privata sekreterare"

> Paco har sagt ja (2026-08-03, efter demovisning med Tommy & Mikel). Denna
> plan är medvetet **minimal**: v1.0 ska kunna förklaras för Paco på en
> minut, misslyckas utan konsekvenser, och växa i små steg tillsammans med
> honom.

## Principen

**Boten pratar bara med Paco.** Ingen spelare ser den, inget i gruppen
förändras. Paco skriver till sin "secretario" i en vanlig 1:1-chatt, får
färdiga listor tillbaka, och klistrar in i gruppen **precis som han
vidarebefordrar listor idag**. Blir något fel gör han som vanligt — gruppen
är aldrig beroende av boten. Det är samma löfte som såldes i demon:
*"du ändrar ingenting i din metod"*.

## v1.0 — vad som ingår (och inte)

| Ingår ✅ | Väntar (v1.1+) ⏳ |
|---|---|
| Skapa pass: `pull lunes 9'30 tercera fly 16` | Tillgänglighetsregister & privat utfrågning |
| Anmäl: `apunta a machete` (även flera) | Spelar-1:1 (yo direkt till boten, turistspråk) |
| Bekräfta: `machete confirmado` → ✅ | Incheckningsping & "falta X"-flödet |
| Avhopp: `se cae chichi` → reserva lyfts automatiskt | Punktlighetsregister |
| Reserv: `reserva juan gonzalez` | Fijos-register (v1.0: Paco skapar med `apunta a` som idag) |
| Hämta text: `lista` → klistra-in-färdig, i Pacos exakta format | Diff-berättande, korsdirigering, motbud |
| Sorteo: `sorteo: machete con gamez, patiño con tellez, …` → slumpade startbanor, Pacos par | Rond 2-generering, kvällsresumé, PadelMar-utkast |

**Regeln för varje ny funktion:** den läggs till först när Paco själv känner
behovet ("kan den inte…?") — aldrig före. Det är så vi utvecklar
*tillsammans med honom*.

## Teknisk uppsättning (pilotens genväg)

Piloten kör på **Metas gratis testnummer** i stället för ett skarpt spanskt
nummer: klart på minuter, kostar inget, och kan bara prata med upp till fem
i förväg registrerade mottagare — perfekt: **Paco, Tommy, Mikel**. Skarpt
nummer (ARCHITECTURE.md) köps först när piloten känns bra.

**Checklista (Tommy, ~1 timme):**
1. Konto på developers.facebook.com (gratis) → skapa app → lägg till
   produkten **WhatsApp**. Du får automatiskt ett **testnummer**.
2. Under *API Setup*: registrera mottagarnummer (Paco, du, Mikel — de
   bekräftar med en engångskod som skickas till deras WhatsApp).
3. Skapa permanent åtkomsttoken (System User) enligt guiden på samma sida.
4. Hosting: minsta VPS:en hos Hetzner (~5 €/mån, EU) enligt ARCHITECTURE.md
   — eller för själva piloten valfri gratis-tier (Render/Fly) om du hellre
   testar utan kostnad först. Webhooken behöver bara en stabil HTTPS-URL.
5. Ge mig webhook-URL:en + token (aldrig i repot — miljövariabler).

**Bygglista (Claude):**
1. `bot/` i detta repo: webhook-mottagare, kommandotolk (regex, förlåtande
   stavning), passmotor (exakt demons regler), SQLite, mallar direkt från
   `demo/scenario.js`-formatet.
2. **Lokal test-REPL** — boten kan köras och verifieras i terminalen utan
   Meta-koppling, så allt är genomtestat innan Paco ser den.
3. Deploy-instruktion (Docker Compose + Caddy enligt ARCHITECTURE.md).

## Onboarding av Paco (dag 1 — gör den ihop med honom)

1. Han sparar testnumret som **"Asistente 🎾"** och skickar `hola`.
2. Boten svarar med välkomsthälsning + minikommandolistan (samma innehåll
   som GUIA-PACO.md — han kan **fästa** det meddelandet i chatten).
3. Ni skapar kvällens/morgondagens riktiga pull tillsammans: han skriver
   `pull …`, får listan, klistrar in i gruppen. Klart — första segern inom
   fem minuter.
4. Ge honom pappersversionen av GUIA-PACO.md (eller skicka den som
   WhatsApp-meddelande att fästa).

## Pilotprotokoll (1–2 veckor)

- Paco kör **ett pass om dagen** via boten, parallellt med sin vanliga
  metod för resten. Han väljer själv vilket.
- Tommy + Mikel finns i botens mottagarlista och kan följa/testa.
- Allt boten inte förstår loggas → veckovis genomgång → små v1.1-beslut
  utifrån vad *Paco* stör sig på eller önskar.
- **Succékriterier:** (1) Paco skapar och underhåller en hel pull via boten
  utan hjälp; (2) noll störningar i gruppen; (3) Paco säger *"quiero
  seguir"*. Då: skarpt spanskt nummer + nästa funktionssteg.

## Pacos tre trygghetsregler (upprepa dem ofta)

1. **Du bestämmer — den lyder.** Allt kan skrivas över med ett meddelande.
2. **Dör den, kör du som vanligt.** Gruppen märker ingenting.
3. **Fel är gratis.** Säg bara till Tommy vad som kändes fel — det är så
   den blir bättre.
