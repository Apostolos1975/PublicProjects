// ===========================
// Constants and Configuration
// ===========================

const API_URL = 'https://polisen.se/api/events';
const FETCH_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds
const STORAGE_KEY = 'crimemap_data';

// Note: SWEDEN_CENTER, SWEDEN_ZOOM, CRIME_TYPE_COLORS, and REGION_COORDINATES 
// are now defined in data-mappings.js

// ===========================
// Global State
// ===========================

let map = null;
let markers = [];
let allEvents = [];
let crimeTypeSortMode = 'frequency'; // 'frequency' or 'alphabetical'
let regionSortMode = 'alphabetical'; // 'frequency' or 'alphabetical'
const filters = {
    dateFrom: null,
    dateTo: null,
    region: '',
    crimeTypes: new Set()
};

// Create reverse mapping once: Municipality -> Region (for performance)
const municipalityToRegion = {};
Object.entries(REGION_MUNICIPALITY_MAPPING).forEach(([region, municipalities]) => {
    municipalities.forEach(municipality => {
        municipalityToRegion[municipality] = region;
    });
});

// ===========================
// Local Storage Management
// ===========================

function loadFromStorage() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const data = JSON.parse(stored);
            const lastFetch = data.lastFetch ? new Date(data.lastFetch) : null;
            return {
                events: data.events || [],
                lastFetch: lastFetch
            };
        }
    } catch (error) {
        console.error('Error loading from storage:', error);
    }
    return { events: [], lastFetch: null };
}

function saveToStorage(events, lastFetch) {
    try {
        const data = {
            events: events,
            lastFetch: lastFetch.toISOString()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving to storage:', error);
    }
}

function cleanUnwantedEvents(events) {
    // Filter out events where type or summary contains unwanted strings
    return events.filter(event => {
        const hasSammanfattningInType = event.type?.includes('Sammanfattning');
        const hasSammanfattningInSummary = event.summary?.includes('Sammanfattning');
        const hasTrafikontroll = event.type?.includes('Trafikkontroll');
        const hasEfterKlockan = event.summary?.includes('Efter klockan');
        const hasPresstelefonenSummary = event.summary?.includes('Presstelefonen');
        const hasStörningar = event.summary?.includes('Störningar i telefonin');
        const hasAvvikandeÖppettider = event.summary?.includes('avvikande öppettider');
        
        return !hasSammanfattningInType && 
               !hasSammanfattningInSummary && 
               !hasTrafikontroll && 
               !hasEfterKlockan && 
               !hasPresstelefonenSummary && 
               !hasStörningar &&
               !hasAvvikandeÖppettider;
    });
}

function enrichEventsWithLocation(events) {
    // Add Region, Municipality, and Locality properties
    return events.map(event => {
        const locationName = event.location?.name || '';
        
        // If location name contains "län", it's a Region
        if (locationName.includes('län')) {
            event.Region = locationName;
            event.Municipality = '';
            event.Locality = '';
        } else {
            // Otherwise, it's a Municipality
            event.Region = '';
            event.Municipality = locationName;
            event.Locality = '';
        }
        
        // Process Name field: extract rightmost string after last comma
        if (event.name && event.name.includes(',')) {
            const parts = event.name.split(',');
            const rightmostString = parts[parts.length - 1].trim();
            
            // If it doesn't contain "län", write it to Municipality field
            if (!rightmostString.includes('län')) {
                event.Municipality = rightmostString;
            }
        }
        
        // Fill in empty Region field using Municipality if available
        if (!event.Region && event.Municipality) {
            const matchedRegion = municipalityToRegion[event.Municipality];
            if (matchedRegion) {
                event.Region = matchedRegion;
            }
        }
        
        // Drop the Name field
        delete event.name;
        
        // Drop the Location_name field (location.name) after mapping
        if (event.location?.name) {
            delete event.location.name;
        }
        
        // Reformat DateTime to YYYY-MM-DD HH:MM (remove seconds and timezone)
        if (event.datetime) {
            // Handles both formats:
            // "2026-01-19 20:31:58 +01:00" -> "2026-01-19 20:31"
            // "2026-01-18 9:12:25+01:00" -> "2026-01-18 09:12"
            const match = event.datetime.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{1,2}):(\d{2})/);
            if (match) {
                const hour = match[2].padStart(2, '0'); // Ensure 2-digit hour
                event.datetime = `${match[1]} ${hour}:${match[3]}`;
            }
        }
        
        return event;
    });
}

// ===========================
// Data Fetching
// ===========================

async function fetchCrimeData() {
    try {
        updateStatus('Hämtar nya händelser...', 'loading');
        
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const newEvents = await response.json();
        const fetchTime = new Date();
        
        // Filter out unwanted events (Sammanfattning, Trafikkontroll, etc.)
        const filteredNewEvents = cleanUnwantedEvents(newEvents);
        
        // Enrich events with Region, Municipality, and Locality
        const enrichedEvents = enrichEventsWithLocation(filteredNewEvents);
        
        // Deduplicate by ID
        const existingIds = new Set(allEvents.map(e => e.id));
        const uniqueNewEvents = enrichedEvents.filter(event => !existingIds.has(event.id));
        
        if (uniqueNewEvents.length > 0) {
            allEvents = [...allEvents, ...uniqueNewEvents];
            saveToStorage(allEvents, fetchTime);
            updateStatus(`${uniqueNewEvents.length} nya händelser tillagda`, 'success');
            
            // Re-apply filters and update map
            applyFilters();
        } else {
            // Update lastFetch timestamp even when no new events
            saveToStorage(allEvents, fetchTime);
            updateStatus('Inga nya händelser', 'success');
        }
        
        // Hide status after 3 seconds
        setTimeout(() => {
            document.getElementById('status-indicator').style.display = 'none';
        }, 3000);
        
    } catch (error) {
        console.error('Error fetching crime data:', error);
        updateStatus('Fel vid hämtning av data', 'error');
        setTimeout(() => {
            document.getElementById('status-indicator').style.display = 'none';
        }, 5000);
    }
}

function shouldFetch(lastFetch) {
    if (!lastFetch) return true;
    const now = new Date();
    const timeDiff = now - lastFetch;
    return timeDiff >= FETCH_INTERVAL;
}

function startPeriodicFetch() {
    // Check every 10 minutes if we should fetch
    setInterval(() => {
        const stored = loadFromStorage();
        if (shouldFetch(stored.lastFetch)) {
            fetchCrimeData();
        }
    }, FETCH_INTERVAL); // Check every 10 minutes
}

// ===========================
// Map Initialization
// ===========================

function initMap() {
    map = L.map('map').setView(SWEDEN_CENTER, SWEDEN_ZOOM);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(map);
}

function getMarkerColor(crimeType) {
    // Check for exact match first
    if (CRIME_TYPE_COLORS[crimeType]) {
        return CRIME_TYPE_COLORS[crimeType];
    }
    
    // Check for partial match
    for (const [key, color] of Object.entries(CRIME_TYPE_COLORS)) {
        if (crimeType.includes(key) || key.includes(crimeType)) {
            return color;
        }
    }
    
    return CRIME_TYPE_COLORS.default;
}

function createCustomIcon(color) {
    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${color}; width: 25px; height: 25px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
        iconSize: [25, 25],
        iconAnchor: [12, 12]
    });
}

function createPopupContent(event) {
    const locationInfo = [event.Municipality, event.Region].filter(x => x).join(', ') || 'Okänd plats';
    return `
        <div class="crime-popup">
            <div class="crime-popup-header">${event.type}</div>
            <div class="crime-popup-summary">${event.summary}</div>
            <div class="crime-popup-meta">
                <span>📅 ${formatDateTime(event.datetime)}</span>
                <span>📍 ${locationInfo}</span>
            </div>
        </div>
    `;
}

function renderMarkers(events) {
    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    
    // Add new markers
    events.forEach(event => {
        // Parse GPS coordinates
        if (!event.location?.gps) return;
        
        const { lat, lng } = parseGPS(event.location.gps);
        
        if (!lat || !lng) return;
        
        const color = getMarkerColor(event.type);
        const icon = createCustomIcon(color);
        
        const marker = L.marker([lat, lng], { icon })
            .bindPopup(createPopupContent(event))
            .addTo(map);
        
        markers.push(marker);
    });
    
    updateEventCount(events.length);
}

function zoomToRegion(regionName) {
    if (!regionName) {
        // No region selected - zoom out to show all of Sweden
        map.setView(SWEDEN_CENTER, SWEDEN_ZOOM);
        return;
    }
    
    // Check if we have coordinates for this region
    if (REGION_COORDINATES[regionName]) {
        const { center, zoom } = REGION_COORDINATES[regionName];
        map.setView(center, zoom);
    } else {
        // If region not in our predefined list, try to fit bounds of events in that region
        const regionEvents = allEvents.filter(event => 
            event.Region === regionName && event.location?.gps
        );
        
        if (regionEvents.length > 0) {
            const bounds = L.latLngBounds(
                regionEvents.map(event => {
                    const { lat, lng } = parseGPS(event.location.gps);
                    return [lat, lng];
                }).filter(coords => coords[0] && coords[1])
            );
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }
}

// ===========================
// Filter Management
// ===========================

function initializeFilters() {
    // Populate crime type filters
    const crimeTypes = getCrimeTypesWithCounts();
    populateCrimeTypeFilters(crimeTypes);
    
    // Populate region filter
    const regions = getUniqueRegions(regionSortMode);
    populateRegionFilter(regions);
    
    // Set up event listeners
    setupFilterListeners();
    
    // Initialize "To" date input with today's date
    const today = new Date();
    document.getElementById('date-to').value = formatDateForInput(today);
    
    // Initialize with all events
    renderMarkers(allEvents);
}

function getCrimeTypesWithCounts(regionFilter = '') {
    // Filter events by region if specified
    const eventsToCount = regionFilter 
        ? allEvents.filter(event => event.Region === regionFilter)
        : allEvents;
    
    const typeCounts = {};
    eventsToCount.forEach(event => {
        const type = event.type || 'Okänd';
        typeCounts[type] = (typeCounts[type] || 0) + 1;
    });
    
    // Convert to array and filter out zero counts
    const typeArray = Object.entries(typeCounts)
        .map(([type, count]) => ({ type, count }))
        .filter(({ count }) => count > 0); // Hide types with 0 frequency
    
    // Sort based on current mode
    if (crimeTypeSortMode === 'frequency') {
        return typeArray.sort((a, b) => b.count - a.count);
    } else {
        return typeArray.sort((a, b) => a.type.localeCompare(b.type, 'sv'));
    }
}

function populateCrimeTypeFilters(crimeTypes) {
    const container = document.getElementById('crime-type-filters');
    container.innerHTML = '';
    
    crimeTypes.forEach(({ type, count }) => {
        const div = document.createElement('div');
        div.className = 'crime-type-item';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `crime-type-${type}`;
        checkbox.value = type;
        checkbox.checked = true;
        
        const label = document.createElement('label');
        label.className = 'crime-type-label';
        label.htmlFor = checkbox.id;
        label.textContent = type;
        
        const countSpan = document.createElement('span');
        countSpan.className = 'crime-type-count';
        countSpan.textContent = count;
        
        div.appendChild(checkbox);
        div.appendChild(label);
        div.appendChild(countSpan);
        container.appendChild(div);
        
        // Add to default selected types
        filters.crimeTypes.add(type);
        
        // Add event listener
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                filters.crimeTypes.add(type);
            } else {
                filters.crimeTypes.delete(type);
            }
            applyFilters();
        });
    });
}

function getUniqueRegions(sortMode = 'alphabetical') {
    const regionCounts = {};
    allEvents.forEach(event => {
        if (event.Region) {
            const region = event.Region;
            regionCounts[region] = (regionCounts[region] || 0) + 1;
        }
    });
    
    // Convert to array
    const regionArray = Object.entries(regionCounts)
        .map(([region, count]) => ({ region, count }));
    
    // Sort based on mode
    if (sortMode === 'frequency') {
        return regionArray.sort((a, b) => b.count - a.count);
    } else {
        return regionArray.sort((a, b) => a.region.localeCompare(b.region, 'sv'));
    }
}

function populateRegionFilter(regions) {
    const select = document.getElementById('region-filter');
    const currentValue = select.value; // Preserve current selection
    select.innerHTML = '<option value="">Alla län</option>';
    
    regions.forEach(({ region, count }) => {
        const option = document.createElement('option');
        option.value = region;
        option.textContent = `${region} (${count})`;
        select.appendChild(option);
    });
    
    // Restore previous selection if it still exists
    if (currentValue) {
        select.value = currentValue;
    }
}

function refreshRegionFilter() {
    const regions = getUniqueRegions(regionSortMode);
    populateRegionFilter(regions);
}

function setupFilterListeners() {
    // Date filters
    document.getElementById('date-from').addEventListener('change', (e) => {
        filters.dateFrom = e.target.value ? new Date(e.target.value) : null;
        applyFilters();
    });
    
    document.getElementById('date-to').addEventListener('change', (e) => {
        filters.dateTo = e.target.value ? new Date(e.target.value + 'T23:59:59') : null;
        applyFilters();
    });
    
    // Region filter
    document.getElementById('region-filter').addEventListener('change', (e) => {
        filters.region = e.target.value;
        // Regenerate crime type filters with region-specific counts
        refreshCrimeTypeFilters(filters.region);
        // Zoom to region if selected
        zoomToRegion(filters.region);
        applyFilters();
    });
    
    // Clear filters button
    document.getElementById('clear-filters').addEventListener('click', clearFilters);
    
    // Toggle filters button
    document.getElementById('toggle-filters').addEventListener('click', () => {
        document.getElementById('filter-panel').classList.toggle('collapsed');
    });
    
    // Sorting buttons
    document.getElementById('sort-alpha').addEventListener('click', () => {
        crimeTypeSortMode = 'alphabetical';
        document.getElementById('sort-alpha').classList.add('active');
        document.getElementById('sort-freq').classList.remove('active');
        refreshCrimeTypeFilters(filters.region);
    });
    
    document.getElementById('sort-freq').addEventListener('click', () => {
        crimeTypeSortMode = 'frequency';
        document.getElementById('sort-freq').classList.add('active');
        document.getElementById('sort-alpha').classList.remove('active');
        refreshCrimeTypeFilters(filters.region);
    });
    
    // Region sorting buttons
    document.getElementById('sort-region-alpha').addEventListener('click', () => {
        regionSortMode = 'alphabetical';
        document.getElementById('sort-region-alpha').classList.add('active');
        document.getElementById('sort-region-freq').classList.remove('active');
        refreshRegionFilter();
    });
    
    document.getElementById('sort-region-freq').addEventListener('click', () => {
        regionSortMode = 'frequency';
        document.getElementById('sort-region-freq').classList.add('active');
        document.getElementById('sort-region-alpha').classList.remove('active');
        refreshRegionFilter();
    });
    
    // Select All/None buttons for crime types
    document.getElementById('select-all').addEventListener('click', () => {
        selectAllCrimeTypes(true);
    });
    
    document.getElementById('select-none').addEventListener('click', () => {
        selectAllCrimeTypes(false);
    });
}

function refreshCrimeTypeFilters(regionFilter = '', selectAll = false) {
    // Get currently selected types before refresh
    const selectedTypes = new Set();
    const checkboxes = document.querySelectorAll('#crime-type-filters input[type="checkbox"]:checked');
    checkboxes.forEach(cb => selectedTypes.add(cb.value));
    
    // Repopulate with new sorting and region filter
    const crimeTypes = getCrimeTypesWithCounts(regionFilter);
    const container = document.getElementById('crime-type-filters');
    container.innerHTML = '';
    
    // Clear filters.crimeTypes and rebuild based on available types
    filters.crimeTypes.clear();
    
    // Check all by default when:
    // 1. selectAll is explicitly true (Alla button pressed)
    // 2. A region is selected (show all crimes in that region)
    // 3. No region selected AND no previous selections (initial state)
    const shouldCheckAll = selectAll || regionFilter || selectedTypes.size === 0;
    
    crimeTypes.forEach(({ type, count }) => {
        const div = document.createElement('div');
        div.className = 'crime-type-item';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `crime-type-${type}`;
        checkbox.value = type;
        
        // Determine if checkbox should be checked
        if (shouldCheckAll) {
            checkbox.checked = true;
        } else {
            checkbox.checked = selectedTypes.has(type);
        }
        
        // Add to filters if checked
        if (checkbox.checked) {
            filters.crimeTypes.add(type);
        }
        
        const label = document.createElement('label');
        label.className = 'crime-type-label';
        label.htmlFor = checkbox.id;
        label.textContent = type;
        
        const countSpan = document.createElement('span');
        countSpan.className = 'crime-type-count';
        countSpan.textContent = count;
        
        div.appendChild(checkbox);
        div.appendChild(label);
        div.appendChild(countSpan);
        container.appendChild(div);
        
        // Add event listener
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                filters.crimeTypes.add(type);
            } else {
                filters.crimeTypes.delete(type);
            }
            applyFilters();
        });
    });
}

function selectAllCrimeTypes(selectAll) {
    const checkboxes = document.querySelectorAll('#crime-type-filters input[type="checkbox"]');
    filters.crimeTypes.clear();
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAll;
        if (selectAll) {
            filters.crimeTypes.add(checkbox.value);
        }
    });
    
    applyFilters();
}

function applyFilters() {
    // If no crime types are selected, show nothing
    if (filters.crimeTypes.size === 0) {
        renderMarkers([]);
        return;
    }
    
    const filteredEvents = allEvents.filter(event => {
        // Crime type filter - only show selected types
        if (!filters.crimeTypes.has(event.type)) {
            return false;
        }
        
        // Date filter
        if (filters.dateFrom || filters.dateTo) {
            const eventDate = new Date(event.datetime);
            if (filters.dateFrom && eventDate < filters.dateFrom) {
                return false;
            }
            if (filters.dateTo && eventDate > filters.dateTo) {
                return false;
            }
        }
        
        // Region filter
        if (filters.region && event.Region !== filters.region) {
            return false;
        }
        
        return true;
    });
    
    renderMarkers(filteredEvents);
}

function clearFilters() {
    // Reset date filters
    document.getElementById('date-from').value = '';
    document.getElementById('date-to').value = '';
    filters.dateFrom = null;
    filters.dateTo = null;
    
    // Reset region filter
    document.getElementById('region-filter').value = '';
    filters.region = '';
    
    // Zoom back to show all of Sweden
    zoomToRegion('');
    
    // Regenerate crime type filters with all data (no region filter)
    refreshCrimeTypeFilters('');
    
    // Check all crime type checkboxes
    const checkboxes = document.querySelectorAll('#crime-type-filters input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = true;
        filters.crimeTypes.add(checkbox.value);
    });
    
    applyFilters();
}

// ===========================
// UI Updates
// ===========================

function updateEventCount(count) {
    document.getElementById('event-count').textContent = count;
}

function updateStatus(message, type = '') {
    const indicator = document.getElementById('status-indicator');
    const text = document.getElementById('status-text');
    
    text.textContent = message;
    indicator.className = 'status-indicator';
    
    if (type) {
        indicator.classList.add(type);
    }
    
    indicator.style.display = 'flex';
}

// ===========================
// Utility Functions
// ===========================

function parseGPS(gpsString) {
    if (!gpsString) return { lat: null, lng: null };
    const coords = gpsString.split(',');
    return {
        lat: coords[0] ? parseFloat(coords[0].trim()) : null,
        lng: coords[1] ? parseFloat(coords[1].trim()) : null
    };
}

function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatDateTime(dateTimeString) {
    try {
        const date = new Date(dateTimeString);
        return date.toLocaleString('sv-SE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return dateTimeString;
    }
}

// ===========================
// Admin Functions
// ===========================

async function cleanAndRefetch() {
    try {
        const statusEl = document.getElementById('clean-status');
        statusEl.textContent = 'Rensar lokal data...';
        statusEl.className = 'export-status';
        statusEl.style.display = 'block';
        
        // Clear localStorage
        localStorage.removeItem(STORAGE_KEY);
        allEvents = [];
        
        // Update status
        statusEl.textContent = 'Hämtar all data från servern...';
        
        // Fetch fresh data from server
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const newEvents = await response.json();
        const fetchTime = new Date();
        
        // Filter out unwanted events
        const cleanedEvents = cleanUnwantedEvents(newEvents);
        
        // Enrich events with Region, Municipality, and Locality
        const enrichedEvents = enrichEventsWithLocation(cleanedEvents);
        
        // Save to storage
        allEvents = enrichedEvents;
        saveToStorage(allEvents, fetchTime);
        
        // Re-initialize filters and update map
        initializeFilters();
        
        // Show success message
        statusEl.textContent = `✓ Klart! Hämtade ${allEvents.length} händelser från servern`;
        statusEl.className = 'export-status success';
        
        // Hide success message after 5 seconds
        setTimeout(() => {
            statusEl.style.display = 'none';
        }, 5000);
        
    } catch (error) {
        console.error('Error cleaning and refetching:', error);
        const statusEl = document.getElementById('clean-status');
        statusEl.textContent = '✗ Fel vid uppdatering: ' + error.message;
        statusEl.className = 'export-status error';
    }
}

function setupAdminModal() {
    const settingsBtn = document.getElementById('settings-btn');
    const modal = document.getElementById('admin-modal');
    const closeBtn = document.getElementById('close-modal');
    const exportBtn = document.getElementById('export-csv');
    const cleanBtn = document.getElementById('clean-refetch');
    
    // Open modal
    settingsBtn.addEventListener('click', () => {
        modal.classList.add('active');
    });
    
    // Close modal
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            modal.classList.remove('active');
        }
    });
    
    // Export CSV
    exportBtn.addEventListener('click', exportToCSV);
    
    // Clean and refetch
    cleanBtn.addEventListener('click', cleanAndRefetch);
}

function exportToCSV() {
    try {
        const statusEl = document.getElementById('export-status');
        statusEl.textContent = 'Genererar CSV...';
        statusEl.className = 'export-status';
        statusEl.style.display = 'block';
        
        // Get last sync date from localStorage
        const stored = loadFromStorage();
        const lastSync = stored.lastFetch ? stored.lastFetch : new Date();
        
        // Format date for filename: YYYY-MM-DD
        const dateStr = lastSync.toISOString().split('T')[0];
        const filename = `Crime_data_${dateStr}.csv`;
        
        // CSV Headers
        const headers = [
            'ID',
            'Summary',
            'Type',
            'DateTime',
            'Location_GPS_Lat',
            'Location_GPS_Lng',
            'Region',
            'Municipality',
            'Locality',
            'URL'
        ];
        
        // Build CSV content
        let csvContent = headers.join(',') + '\n';
        
        allEvents.forEach(event => {
            const { lat, lng } = parseGPS(event.location?.gps);
            const row = [
                escapeCSV(event.id || ''),
                escapeCSV(event.summary || ''),
                escapeCSV(event.type || ''),
                escapeCSV(event.datetime || ''),
                escapeCSV(lat || ''),
                escapeCSV(lng || ''),
                escapeCSV(event.Region || ''),
                escapeCSV(event.Municipality || ''),
                escapeCSV(event.Locality || ''),
                escapeCSV(event.url || '')
            ];
            csvContent += row.join(',') + '\n';
        });
        
        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        // Show success message
        statusEl.textContent = `✓ Exporterad: ${filename} (${allEvents.length} händelser)`;
        statusEl.className = 'export-status success';
        
        // Hide success message after 5 seconds
        setTimeout(() => {
            statusEl.style.display = 'none';
        }, 5000);
        
    } catch (error) {
        console.error('Error exporting CSV:', error);
        const statusEl = document.getElementById('export-status');
        statusEl.textContent = '✗ Fel vid export: ' + error.message;
        statusEl.className = 'export-status error';
    }
}

function escapeCSV(value) {
    if (value === null || value === undefined) {
        return '';
    }
    const str = String(value);
    // Escape double quotes and wrap in quotes if contains comma, newline, or quote
    if (str.includes(',') || str.includes('\n') || str.includes('"')) {
        return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
}

// ===========================
// Initialization
// ===========================

async function init() {
    // Initialize map
    initMap();
    
    // Set up admin modal
    setupAdminModal();
    
    // Load data from storage
    const stored = loadFromStorage();
    
    // Enrich stored events with Region, Municipality, and Locality if not already present
    if (stored.events.length > 0 && !stored.events[0].Region) {
        allEvents = enrichEventsWithLocation(stored.events);
        // Save enriched data back to storage
        saveToStorage(allEvents, stored.lastFetch || new Date());
    } else {
        allEvents = stored.events;
    }
    
    if (allEvents.length > 0) {
        // Initialize filters with stored data
        initializeFilters();
    }
    
    // Fetch new data if needed (filters already initialized above if data exists)
    if (shouldFetch(stored.lastFetch)) {
        await fetchCrimeData();
    } else {
        updateStatus('Data laddad från cache', 'success');
        setTimeout(() => {
            document.getElementById('status-indicator').style.display = 'none';
        }, 2000);
    }
    
    // Start periodic fetching
    startPeriodicFetch();
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
