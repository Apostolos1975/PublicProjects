# Swedish Crime Map - Crime Map Application

🇸🇪 **[Svensk dokumentation finns här →](README.md)**

A web application that visualizes crime data from the Swedish Police's official API on an interactive map with clustered presentation by municipality.

![Crime Map Screenshot](images/crime_map.png)

## 🎯 Features

### 📊 Data Fetching and Processing
- **Automatic fetching** from `https://polisen.se/api/events`
- **Intelligent periodic updates** every 10 minutes with rate limiting
- **Deduplication** of events based on ID
- **Local storage** in localStorage for offline access and fast loading
- **Automatic data filtering** - excludes:
  - Summaries and press releases
  - Traffic controls
  - Administrative messages (opening hours, phone disruptions, etc.)

### 🗺️ Map Visualization
- **Interactive map** with Leaflet + OpenStreetMap
- **Clustered view** - Events grouped by municipality with numbered markers
  - 🔵 Blue: < 10 events
  - 🔴 Red: 10-99 events
  - 🟣 Purple: 100+ events
- **Color-coded individual markers** based on crime type
- **Detailed popups** with:
  - Crime type and description
  - Date and time (HH:MM format)
  - Municipality and county
- **Automatic zoom** to selected county
- **Spiderfy effect** at max zoom for clear viewing of dense areas

### 🔍 Advanced Filtering System

#### Date Filter
- Filter events between specific dates
- Quick access with pre-filled "To" date (today)

#### County Filter (Län)
- Select specific county from dropdown
- **Sorting**: Alphabetical (A-Z) or by frequency (most common first)
- Shows event count per county
- Automatic zoom to selected county

#### Crime Type Filter
- Select specific crime types with checkboxes
- **Sorting**: Alphabetical or by frequency
- Shows event count per crime type
- **Quick select**: "All" or "None" buttons
- Counter updates dynamically based on selected county
- Hides crime types with 0 events in selected county

#### Filter Interaction
- Real-time map updates
- Shows number of visible events
- "Clear filters" button for quick reset
- Automatic selection of all available crime types when county is selected

### 📍 Geographic Data Processing

#### Municipality-Based Positioning
- All events are placed at municipality centers (not exact GPS coordinates)
- **Advantages**:
  - Privacy protection - no exact location disclosure
  - Clear aggregation of events per municipality
  - Consistent presentation
  
#### Intelligent Geo-Enrichment
- **Region → Municipality mapping**: Uses county to find municipality
- **Municipality → Region mapping**: Reverse lookup when needed
- **Fallback logic**: Uses county capital if municipality is missing
- **Case-insensitive matching**: Handles "Upplands väsby" and "Upplands Väsby"
- **Complete Swedish geodata**: 290 municipalities in 21 counties

## 🔒 Security and Privacy

### Data Protection
- ✅ All data stored **locally** in browser (localStorage)
- ✅ No exact GPS coordinates - only municipality centers
- ✅ No data sent to external servers (except Police API)
- ✅ No user tracking or analytics
- ✅ Data cleared by clearing browser cache

### CORS and API Security
- Police API allows CORS from all origins
- No API key required
- Client-side rate limiting (10 min interval)

---

**Created**: 2026-01-24  
**Version**: 2.0.0  
**Last Updated**: 2026-01-24  
**Data Source**: [Polisen.se API](https://polisen.se/api/events)  
**Geo-data**: Statistics Sweden (SCB), OpenStreetMap
