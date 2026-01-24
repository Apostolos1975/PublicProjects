// ===========================
// Constants and Configuration
// ===========================

const API_URL = 'https://polisen.se/api/events';
const FETCH_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds
const STORAGE_KEY = 'crimemap_data';
const SWEDEN_CENTER = [62.0, 15.0];
const SWEDEN_ZOOM = 5;

// Crime type colors
const CRIME_TYPE_COLORS = {
    'Mord/dråp': '#8B0000',
    'Mord/dråp, försök': '#DC143C',
    'Misshandel': '#FF6347',
    'Misshandel, grov': '#FF4500',
    'Våldtäkt': '#8B008B',
    'Rån': '#FF8C00',
    'Stöld': '#DAA520',
    'Stöld/inbrott': '#B8860B',
    'Brand': '#FF0000',
    'Trafikolycka': '#4169E1',
    'Rattfylleri': '#9370DB',
    'Narkotikabrott': '#32CD32',
    'Skadegörelse': '#A0522D',
    'default': '#3498db'
};

// ===========================
// Global State
// ===========================

let map = null;
let markers = [];
let allEvents = [];
let filteredEvents = [];
let crimeTypeSortMode = 'frequency'; // 'frequency' or 'alphabetical'
let regionSortMode = 'alphabetical'; // 'frequency' or 'alphabetical'
let filters = {
    dateFrom: null,
    dateTo: null,
    region: '',
    crimeTypes: new Set()
};

// ===========================
// Local Storage Management
// ===========================

function loadFromStorage() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const data = JSON.parse(stored);
            const lastFetch = data.lastFetch ? new Date(data.lastFetch) : null;
            console.log(`Loaded ${data.events?.length || 0} events from localStorage. Last fetch: ${lastFetch ? lastFetch.toLocaleString('sv-SE') : 'Never'}`);
            return {
                events: data.events || [],
                lastFetch: lastFetch
            };
        }
    } catch (error) {
        console.error('Error loading from storage:', error);
    }
    console.log('No data found in localStorage.');
    return { events: [], lastFetch: null };
}

function saveToStorage(events, lastFetch) {
    try {
        const data = {
            events: events,
            lastFetch: lastFetch.toISOString()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        console.log(`Saved ${events.length} events to localStorage. Last fetch: ${lastFetch.toLocaleString('sv-SE')}`);
    } catch (error) {
        console.error('Error saving to storage:', error);
    }
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
        
        // Deduplicate by ID
        const existingIds = new Set(allEvents.map(e => e.id));
        const uniqueNewEvents = newEvents.filter(event => !existingIds.has(event.id));
        
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
    if (!lastFetch) {
        console.log('No previous fetch time found. Will fetch data.');
        return true;
    }
    const now = new Date();
    const timeDiff = now - lastFetch;
    const minutesSinceLastFetch = Math.floor(timeDiff / (60 * 1000));
    
    if (timeDiff >= FETCH_INTERVAL) {
        console.log(`${minutesSinceLastFetch} minutes since last fetch. Will fetch data.`);
        return true;
    } else {
        const minutesRemaining = Math.ceil((FETCH_INTERVAL - timeDiff) / (60 * 1000));
        console.log(`${minutesSinceLastFetch} minutes since last fetch. Next fetch in ${minutesRemaining} minutes.`);
        return false;
    }
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
    const color = getMarkerColor(event.type);
    return `
        <div class="crime-popup">
            <div class="crime-popup-header">${event.name}</div>
            <div class="crime-popup-type" style="background: ${color};">${event.type}</div>
            <div class="crime-popup-summary">${event.summary}</div>
            <div class="crime-popup-meta">
                <span>📅 ${formatDateTime(event.datetime)}</span>
                <span>📍 ${event.location.name}</span>
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
        if (!event.location || !event.location.gps) return;
        
        const [lat, lng] = event.location.gps.split(',').map(coord => parseFloat(coord.trim()));
        
        if (isNaN(lat) || isNaN(lng)) return;
        
        const color = getMarkerColor(event.type);
        const icon = createCustomIcon(color);
        
        const marker = L.marker([lat, lng], { icon })
            .bindPopup(createPopupContent(event))
            .addTo(map);
        
        markers.push(marker);
    });
    
    updateEventCount(events.length);
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
    
    // Set date inputs to show last 7 days by default (helps with visibility)
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    // Format dates for input value (YYYY-MM-DD)
    const formatDateForInput = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    
    // Initialize date inputs (but don't apply filter yet)
    document.getElementById('date-to').value = formatDateForInput(today);
    
    // Initialize with all events
    filteredEvents = [...allEvents];
    renderMarkers(filteredEvents);
}

function getCrimeTypesWithCounts(regionFilter = '') {
    // Filter events by region if specified
    const eventsToCount = regionFilter 
        ? allEvents.filter(event => event.location && event.location.name === regionFilter)
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
        if (event.location && event.location.name) {
            const region = event.location.name;
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
    
    // When region is selected or selectAll is true, check all by default
    const shouldCheckAll = selectAll || (regionFilter && selectedTypes.size === 0);
    
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
        filteredEvents = [];
        renderMarkers(filteredEvents);
        return;
    }
    
    filteredEvents = allEvents.filter(event => {
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
        if (filters.region && event.location.name !== filters.region) {
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
// Initialization
// ===========================

async function init() {
    // Initialize map
    initMap();
    
    // Load data from storage
    const stored = loadFromStorage();
    allEvents = stored.events;
    
    if (allEvents.length > 0) {
        // Initialize filters with stored data
        initializeFilters();
    }
    
    // Fetch new data if needed
    if (shouldFetch(stored.lastFetch)) {
        await fetchCrimeData();
        // Re-initialize filters with new data
        if (allEvents.length > 0) {
            initializeFilters();
        }
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
