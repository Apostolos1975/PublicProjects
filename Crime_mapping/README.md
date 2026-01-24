# Brottskartan Sverige - Crime Map Application

En webbapplikation som visualiserar brottsdata från Polisens officiella API på en interaktiv karta.

## Funktioner

### Datahämtning
- Automatisk hämtning av brottsdata från `https://polisen.se/api/events`
- Intelligent periodisk uppdatering var 10:e minut
- Deduplicering av händelser baserat på ID
- Lokal lagring i localStorage för offline-tillgång

### Kartvisualisering
- Interaktiv karta centrerad på Sverige (Leaflet + OpenStreetMap)
- Färgkodade markörer baserat på brottstyp
- Detaljerade popups med:
  - Händelsens namn och beskrivning
  - Brottstyp
  - Datum och tid
  - Geografisk plats (län)

### Filtreringssystem
- **Datumfilter**: Filtrera händelser mellan specifika datum
- **Länsfilter**: Visa händelser från ett specifikt län
- **Brottstypfilter**: Välj vilka typer av brott som ska visas
- Realtidsuppdatering av kartan vid filterändringar
- Visar antal synliga händelser

### Användargränssnitt
- Responsiv design för desktop och mobil
- Inklappsbar filterpanel
- Statusindikator för datahämtning
- Smidig användarupplevelse

## Teknisk Implementation

### Filstruktur
```
Crime_mapping/
├── index.html      # HTML-struktur
├── styles.css      # All CSS-styling
├── app.js          # All JavaScript-logik
└── README.md       # Denna fil
```

### Teknologier
- **Leaflet 1.9.4**: Kartbibliotek
- **OpenStreetMap**: Kartunderlag (gratis, ingen API-nyckel)
- **Vanilla JavaScript**: Ingen externa ramverk
- **localStorage**: Datalagring i webbläsaren

### Dataflöde

1. **Initial laddning**:
   - Laddar cachad data från localStorage
   - Visar befintliga händelser på kartan
   - Kontrollerar om ny data behöver hämtas

2. **Periodisk uppdatering**:
   - Kontrollerar var 60:e sekund om 10 minuter har passerat
   - Hämtar ny data från API:et vid behov
   - Deduplicerar mot befintlig data
   - Uppdaterar localStorage och kartan

3. **Filtrering**:
   - Användaren väljer filter
   - Data filtreras i realtid
   - Kartan uppdateras med synliga markörer
   - Händelseräknare uppdateras

### Datastruktur

```javascript
{
  events: [
    {
      id: 622571,
      datetime: "2026-01-23 21:52:13 +01:00",
      name: "23 januari 21.05, Mord/dråp, försök, Södertälje",
      summary: "Person hittad stickskadad i en lägenhet.",
      type: "Mord/dråp, försök",
      location: {
        name: "Stockholms län",
        gps: "59.602496,18.138438"
      }
    }
  ],
  lastFetch: "2026-01-24T12:00:00Z"
}
```

## Användning

### Starta applikationen

1. **Öppna index.html** i en webbläsare:
   ```bash
   # Enklaste sättet - dubbelklicka på index.html
   
   # Eller använd en lokal server (rekommenderat):
   python -m http.server 8000
   # Navigera till http://localhost:8000
   ```

2. Kartan laddas automatiskt med händelser från Polisens API

3. Använd filterpanelen till vänster för att:
   - Filtrera på datum
   - Välja specifikt län
   - Visa/dölja brottstyper

### Tangentbordsgenvagar och tips

- Klicka på markörer för att se detaljerad information
- Zooma kartan med mushjulet eller touchgester
- Använd pil-knappen längst upp i filterpanelen för att dölja/visa panelen
- Filtren sparas inte - de återställs vid sidomladdning

## Anpassning

### Ändra uppdateringsintervall

I `app.js`, ändra konstanten:
```javascript
const FETCH_INTERVAL = 10 * 60 * 1000; // 10 minuter i millisekunder
```

### Anpassa färger för brottstyper

I `app.js`, modifiera `CRIME_TYPE_COLORS`:
```javascript
const CRIME_TYPE_COLORS = {
    'Mord/dråp': '#8B0000',
    'Misshandel': '#FF6347',
    // Lägg till fler typer här...
};
```

### Ändra kartcentrering

I `app.js`, ändra `SWEDEN_CENTER`:
```javascript
const SWEDEN_CENTER = [62.0, 15.0]; // [latitude, longitude]
const SWEDEN_ZOOM = 5; // Zoom-nivå
```

## Felsökning

### Data laddas inte

1. Kontrollera webbläsarens konsol för felmeddelanden
2. Verifiera att `https://polisen.se/api/events` är tillgängligt
3. Rensa localStorage och ladda om sidan:
   ```javascript
   // I webbläsarens konsol:
   localStorage.clear();
   location.reload();
   ```

### Markörer visas inte på kartan

1. Kontrollera att händelser har giltiga GPS-koordinater
2. Verifiera att Leaflet CSS och JS laddas korrekt
3. Öppna webbläsarens utvecklarverktyg för att se eventuella fel

### Filtren fungerar inte

1. Kontrollera att händelser har rätt dataformat
2. Verifiera att brottstyperna finns i datan
3. Testa att rensa filtren med "Rensa filter"-knappen

## Säkerhet och integritet

- All data lagras lokalt i webbläsaren (localStorage)
- Ingen data skickas till externa servrar (utom Polisens API)
- Ingen användarspårning eller analytics
- Data kan raderas genom att rensa webbläsarens cache

## Prestandaoptimering

- localStorage används för att minimera API-anrop
- Markörer skapas endast när data ändras
- Filtrering sker i minnet för snabb respons
- Ingen onödig omladdning av kartunderlag

## Webbläsarstöd

Applikationen fungerar i alla moderna webbläsare som stödjer:
- ES6+ JavaScript
- localStorage
- Fetch API
- CSS Grid och Flexbox

Testade webbläsare:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Licens

Detta projekt är skapat för utbildningsändamål och använder öppen data från Polisen.

## Bidrag och utveckling

Förslag på förbättringar:
- [ ] Exportera filtrerad data till CSV
- [ ] Statistikvy med diagram
- [ ] Heatmap-visning för täthet av brott
- [ ] Notifikationer för nya händelser i specifika områden
- [ ] Delningsfunktion för specifika vyer
- [ ] Mörkt tema

## Kontakt och Support

För frågor eller buggrapporter, öppna ett issue i projektets repository.

---

**Skapad**: 2026-01-24  
**Version**: 1.0.0  
**Data-källa**: [Polisen.se API](https://polisen.se/api/events)
