# source/ — rådata (gitignorerad)

Lägg WhatsApp-exporten här som `chat-export.txt`:

1. Öppna gruppen i WhatsApp → tryck på gruppnamnet
2. **Exportera chatt** → **Utan media**
3. Spara/skicka .txt-filen och lägg den i den här mappen med namnet `chat-export.txt`

Kör sedan analysen:

```bash
npm run parse
```

Parsern skriver **endast till stdout** — ingen härledd data med riktiga namn/nummer
sparas till disk. Allt i den här mappen (utom denna README) är gitignorerat och
lämnar aldrig din dator.
