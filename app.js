import { initialSpots } from './data.js';

let map;
let markers = [];
let currentFilter = 'all';
let selectedSpot = null;
let addingSpotMode = false;
let tempMarker = null;
let darkLayer, lightLayer;
let isDarkMode = true;
let userLocation = null;

// Initialize Map
function initMap() {
    const japanBounds = L.latLngBounds([20.0, 122.0], [46.0, 146.0]);
    // Default center at Shibuya
    map = L.map('map', {
        zoomControl: false,
        attributionControl: false,
        maxBounds: japanBounds,
        maxBoundsViscosity: 1.0,
        minZoom: 5
    }).setView([35.6605, 139.7005], 16);

    // Dark Mode Tiles
    darkLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
    });

    // Light Mode Tiles
    lightLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
    });

    darkLayer.addTo(map);

    // Add initial markers
    renderMarkers(initialSpots);

    // Map Click Handler for adding new spots
    map.on('click', (e) => {
        if (addingSpotMode) {
            const lat = e.latlng.lat;
            const lng = e.latlng.lng;
            if (lat < 20.0 || lat > 46.0 || lng < 122.0 || lng > 146.0) {
                if (window.showToast) window.showToast('日本国外または無効な位置（海上など）には登録できません。', 'warning');
                else alert('日本国外または無効な位置（海上など）には登録できません。');
                return;
            }
            showAddModal(e.latlng);
        } else {
            closeDetailPanel();
        }
    });

    map.on('locationfound', (e) => {
        userLocation = e.latlng;
    });
}

// Render Markers based on filter
function renderMarkers(spots) {
    // Clear existing markers
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    spots.forEach(spot => {
        if (!shouldShowSpot(spot)) return;

        const icon = L.divIcon({
            className: 'custom-marker',
            html: `<div class="marker-pin"><i class="${getIconForType(spot.type)}"></i></div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 32]
        });

        const marker = L.marker([spot.lat, spot.lng], { icon }).addTo(map);
        
        marker.on('click', () => {
            showDetailPanel(spot);
        });

        markers.push(marker);
    });
}

function shouldShowSpot(spot) {
    if (currentFilter === 'all') return true;
    if (currentFilter === 'trash') return spot.hasTrashBin.includes('あり');
    if (currentFilter === 'cheap') return spot.priceRange.includes('100円') || spot.priceRange.includes('80円');
    if (currentFilter === 'rare') return spot.rarity >= 4;
    if (currentFilter === 'cashless') return spot.paymentMethods.length > 1;
    return true;
}

function getIconForType(type) {
    switch (type) {
        case 'rare': return 'fas fa-gem';
        case 'cheap': return 'fas fa-tag';
        default: return 'fas fa-bottle-water';
    }
}

// UI Interactions
function showDetailPanel(spot) {
    selectedSpot = spot;
    document.getElementById('spotName').innerText = spot.name;
    document.getElementById('spotManufacturer').innerText = spot.manufacturer;
    document.getElementById('spotRating').innerText = spot.rating;
    document.getElementById('spotPrice').innerText = spot.priceRange;
    document.getElementById('spotTrash').innerText = spot.hasTrashBin;
    document.getElementById('spotRarity').innerText = '★'.repeat(spot.rarity) + '☆'.repeat(5 - spot.rarity);
    document.getElementById('spotPayment').innerText = spot.paymentMethods.join(', ');
    document.getElementById('spotDescription').innerText = spot.description;
    document.getElementById('spotLastUpdated').innerText = `最終確認: ${spot.lastUpdated || '不明'}`;

    // Verification Badge
    const badge = document.getElementById('spotVerificationBadge');
    const badgeText = document.getElementById('spotVerificationText');
    if (spot.verifiedCount >= 10) {
        badge.className = 'status-badge verified';
        badgeText.innerText = `信頼度: 高 (${spot.verifiedCount}人が確認)`;
    } else {
        badge.className = 'status-badge unverified';
        badgeText.innerText = `要確認 (${spot.verifiedCount || 0}人が確認)`;
    }

    // Photos
    renderPhotos(spot);

    const lineupContainer = document.getElementById('spotLineup');
    lineupContainer.innerHTML = '';
    spot.lineup.forEach(item => {
        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.innerText = item;
        lineupContainer.appendChild(tag);
    });

    document.getElementById('detailPanel').classList.add('open');
}

function renderPhotos(spot) {
    const photoContainer = document.getElementById('spotPhotos');
    // Keep the add button
    const addBtn = document.getElementById('addPhotoBtn');
    photoContainer.innerHTML = '';
    
    if (spot.photos && spot.photos.length > 0) {
        spot.photos.forEach(url => {
            const img = document.createElement('img');
            img.src = url;
            img.className = 'photo-item';
            photoContainer.appendChild(img);
        });
    }
    
    photoContainer.appendChild(addBtn);
}

function closeDetailPanel() {
    document.getElementById('detailPanel').classList.remove('open');
    selectedSpot = null;
}

// Filter Handling
document.getElementById('filterContainer').addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-chip')) {
        document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        e.target.classList.add('active');
        currentFilter = e.target.dataset.filter;
        renderMarkers(initialSpots);
    }
});

// Add Spot Logic
const addSpotBtn = document.getElementById('addSpotBtn');
const addSpotModal = document.getElementById('addSpotModal');

addSpotBtn.addEventListener('click', () => {
    addingSpotMode = !addingSpotMode;
    addSpotBtn.classList.toggle('active', addingSpotMode);
    if (addingSpotMode) {
        if (window.showToast) window.showToast('地図上をクリックして場所を選択してください', 'info');
        else alert('地図上をクリックして場所を選択してください');
    }
});

function showAddModal(latlng) {
    tempMarker = latlng;
    addSpotModal.style.display = 'flex';
}

document.getElementById('cancelAddBtn').addEventListener('click', () => {
    addSpotModal.style.display = 'none';
    addingSpotMode = false;
    addSpotBtn.classList.remove('active');
});

document.getElementById('saveSpotBtn').addEventListener('click', () => {
    // Distance Check (Simulation)
    if (userLocation) {
        const dist = userLocation.distanceTo(L.latLng(tempMarker.lat, tempMarker.lng));
        if (dist > 500) { // 500m radius
            if (!confirm('現在地から離れた場所に登録しようとしています。情報は正確ですか？')) {
                return;
            }
        }
    }

    const photoFile = document.getElementById('newSpotPhoto').files[0];
    const photoUrl = photoFile ? URL.createObjectURL(photoFile) : null;

    const newSpot = {
        id: Date.now(),
        name: document.getElementById('newSpotName').value || "新規自販機",
        lat: tempMarker.lat,
        lng: tempMarker.lng,
        manufacturer: document.getElementById('newSpotManufacturer').value,
        rating: 3.0,
        priceRange: "130円〜",
        hasTrashBin: document.getElementById('newSpotTrash').value,
        paymentMethods: ["現金"],
        rarity: parseInt(document.getElementById('newSpotRarity').value),
        lineup: ["不明"],
        description: "ユーザーが新しく発見した自販機です。",
        type: "standard",
        photos: photoUrl ? [photoUrl] : [],
        verifiedCount: 0,
        lastUpdated: new Date().toLocaleDateString('ja-JP')
    };

    initialSpots.push(newSpot);
    renderMarkers(initialSpots);
    addSpotModal.style.display = 'none';
    addingSpotMode = false;
    addSpotBtn.classList.remove('active');
    // Clear form
    document.getElementById('newSpotPhoto').value = '';
    document.getElementById('newSpotName').value = '';
});

// Photo Upload Logic for existing spots
const addPhotoBtn = document.getElementById('addPhotoBtn');
const photoInput = document.getElementById('photoInput');

addPhotoBtn.addEventListener('click', () => {
    photoInput.click();
});

photoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && selectedSpot) {
        const url = URL.createObjectURL(file);
        if (!selectedSpot.photos) selectedSpot.photos = [];
        selectedSpot.photos.push(url);
        renderPhotos(selectedSpot);
    }
});

// Verification/Reporting Actions
document.getElementById('confirmPresenceBtn').addEventListener('click', () => {
    if (selectedSpot) {
        selectedSpot.verifiedCount = (selectedSpot.verifiedCount || 0) + 1;
        selectedSpot.lastUpdated = new Date().toLocaleDateString('ja-JP');
        showDetailPanel(selectedSpot); // Refresh UI
        if (window.showToast) window.showToast('実在を確認しました！ご協力ありがとうございます。', 'success');
        else alert('実在を確認しました！ご協力ありがとうございます。');
    }
});

document.getElementById('reportBtn').addEventListener('click', () => {
    if (selectedSpot) {
        if (window.showToast) window.showToast('報告を受け付けました。運営チームが確認いたします。', 'warning');
        else alert('報告を受け付けました。運営チームが確認いたします。');
    }
});

// Controls
document.getElementById('themeToggleBtn').addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('light-mode', !isDarkMode);
    
    const icon = document.querySelector('#themeToggleBtn i');
    if (isDarkMode) {
        icon.className = 'fas fa-moon';
        map.removeLayer(lightLayer);
        darkLayer.addTo(map);
    } else {
        icon.className = 'fas fa-sun';
        map.removeLayer(darkLayer);
        lightLayer.addTo(map);
    }
});

document.getElementById('locateBtn').addEventListener('click', () => {
    map.locate({setView: true, maxZoom: 16});
});

document.getElementById('closePanelBtn').addEventListener('click', closeDetailPanel);

// Boot
window.onload = initMap;
