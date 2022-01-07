# IPSENH onderzoek uitvoertijd benchmark
Dit programma voert een benchmark uit om de uitvoertijd te vergelijken van geminimaliseerde code en broncode bij de serverless dienst van het IPSENH schoolproject.

De volgende stappen worden gebenchmarkt voor zowel de broncode als de geminimaliseerde code:
1. Ophalen van code uit de database
2. Uitvoeren van het bestand
3. Uitvoeren van een functie

De broncode is te vinden in `assets/source_code.js` en de geminimaliseerde code is te vinden in `assets/minified_code.js`.

De database die gebruikt wordt voor het ophalen van de code is een Postgres database. Van de resultaten kunnen de gemiddelde tijden per stap worden getoond en de gemeten tijden kunnen in een Google Sheets bestand worden opgeslagen. Om de code uit te voeren wordt gebruik gemaakt van de Node package `vm2`.

## Opzet
De configuratie van de benchmark, database verbinding en Google Sheets verbinding is te vinden in `assets/config.jsonc`. Dit bestand dient te worden aangemaakt en bewerkt op basis van `assets/example-config.jsonc`.

Daarnaast dienen de dependencies te worden geïnstalleerd door het volgende commando uit te voeren:
```cmd
npm install
```

## Benchmark draaien
Om de benchmark uit te voeren kan het volgende commando worden uitgevoerd:

```cmd
npm run start
```