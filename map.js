let homeMap = null;
let trackingMap = null;
let liveMarker = null;

const MAP_LIGHT = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png';
const MAP_DARK = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png';

export function initHomeMap() {
    const container = document.getElementById('map-preview');
    if (!container) return;

    if (!homeMap) {
        const isDark = document.body.classList.contains('dark');
        const activeTile = isDark ? MAP_DARK : MAP_LIGHT;

        homeMap = L.map('map-preview', {
            zoomControl: false,
            attributionControl: false,
            dragging: false,
            scrollWheelZoom: false,
            touchZoom: false
        }).setView([-6.8522, -35.4908], 14);

        L.tileLayer(activeTile, { maxZoom: 20 }).addTo(homeMap);

        const resizeObserver = new ResizeObserver(() => {
            if (homeMap) {
                homeMap.invalidateSize();
            }
        });
        resizeObserver.observe(container);
    }
}

export function initTrackingMap() {
    const container = document.getElementById('live-map');
    if (!container) return;

    if (!trackingMap) {
        const isDark = document.body.classList.contains('dark');
        const activeTile = isDark ? MAP_DARK : MAP_LIGHT;

        trackingMap = L.map('live-map', {
            zoomControl: false,
            attributionControl: false
        }).setView([-6.8522, -35.4908], 16);

        L.tileLayer(activeTile, { maxZoom: 20 }).addTo(trackingMap);

        const resizeObserver = new ResizeObserver(() => {
            if (trackingMap) {
                trackingMap.invalidateSize();
            }
        });
        resizeObserver.observe(container);
    }
}

export function updateBusOnMap(lat, lng, label) {
    if (!trackingMap) return;
    const currentCoords = new L.LatLng(lat, lng);
    if (!liveMarker) {
        const busIcon = L.divIcon({
            html: '<div style="background:#00B4D8; width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:3px solid #020C1B; color:#020C1B; box-shadow:0 0 15px #00B4D8;"><i class="fa-solid fa-bus"></i></div>',
            className: 'custom-bus-marker',
            iconSize: [36, 36],
            iconAnchor: [18, 18]
        });
        liveMarker = L.marker(currentCoords, { icon: busIcon }).addTo(trackingMap);
    } else {
        liveMarker.setLatLng(currentCoords);
    }
    trackingMap.flyTo(currentCoords, 16, { animate: true, duration: 1.5 });
}

export function resetTrackingMarker() {
    if (liveMarker && trackingMap) {
        trackingMap.removeLayer(liveMarker);
        liveMarker = null;
    }
}