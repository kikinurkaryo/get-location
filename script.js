// --- SETUP ROUTING ---
const urlParams = new URLSearchParams(window.location.search);
const targetID = urlParams.get('target');

const adminPanel = document.getElementById('admin-panel');
const targetPanel = document.getElementById('target-panel');

// Variabel Peta
let map, marker, accuracyCircle, watchID;

if (targetID) {
    // Mode Target
    adminPanel.classList.add('hidden');
    targetPanel.classList.remove('hidden');
    document.getElementById('display-target-id').innerText = decodeURIComponent(targetID).toUpperCase();
    initTargetLogic(); 
} else {
    // Mode Admin
    initAdminLogic();
}

// --- 1. LOGIKA ADMIN ---
function initAdminLogic() {
    const generateBtn = document.getElementById('generate-btn');
    const targetInput = document.getElementById('target-input');
    const linkResult = document.getElementById('link-result');
    const generatedLinkSpan = document.getElementById('generated-link');

    generateBtn.addEventListener('click', () => {
        const inputVal = targetInput.value;
        if(!inputVal) return alert("ERROR: INPUT REQUIRED");

        generateBtn.innerText = "COMPILING CODE...";
        
        setTimeout(() => {
            generateBtn.innerText = "[ GENERATE TRAP LINK ]";
            const currentURL = window.location.href.split('?')[0];
            const trapLink = `${currentURL}?target=${encodeURIComponent(inputVal)}`;
            generatedLinkSpan.innerText = trapLink;
            linkResult.classList.remove('hidden');
        }, 800);
    });
}

window.copyLink = function() {
    const linkText = document.getElementById('generated-link').innerText;
    navigator.clipboard.writeText(linkText);
    alert("COPIED TO CLIPBOARD");
}

// --- 2. LOGIKA TARGET (HIGH ACCURACY) ---
function initTargetLogic() {
    const trackBtn = document.getElementById('track-btn');
    const resultPanel = document.getElementById('result-panel');
    const errorMsg = document.getElementById('error-msg');
    const gmapsLink = document.getElementById('gmaps-force-link');
    const statusText = document.querySelector('.overlay-text');

    trackBtn.addEventListener('click', () => {
        trackBtn.innerText = "AUTHENTICATING...";
        
        if (navigator.geolocation) {
            const options = { 
                enableHighAccuracy: true, 
                timeout: 10000, 
                maximumAge: 0 
            };

            watchID = navigator.geolocation.watchPosition(
                (pos) => {
                    // Update Koordinat
                    const lat = pos.coords.latitude;
                    const long = pos.coords.longitude;
                    const accuracy = pos.coords.accuracy;

                    trackBtn.style.display = 'none';
                    resultPanel.classList.remove('hidden');
                    
                    document.getElementById('lat').innerText = lat.toFixed(6);
                    document.getElementById('long').innerText = long.toFixed(6);
                    
                    document.querySelector('.overlay-text').innerText = `ACCURACY: ±${Math.round(accuracy)}m`;

                    // Update Link Google Maps
                    gmapsLink.href = `https://www.google.com/maps?q=${lat},${long}`;

                    // Render Peta Hacker Style
                    if (!map) {
                        map = L.map('map').setView([lat, long], 18);
                        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

                        // Custom Green Icon
                        var greenIcon = new L.Icon({
                            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                            iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
                        });

                        marker = L.marker([lat, long], {icon: greenIcon}).addTo(map)
                            .bindPopup(`<b>TARGET: ${decodeURIComponent(targetID)}</b>`).openPopup();
                        
                        accuracyCircle = L.circle([lat, long], {
                            color: '#0f0', fillColor: '#0f0', fillOpacity: 0.1, radius: accuracy
                        }).addTo(map);

                    } else {
                        const newLatLng = new L.LatLng(lat, long);
                        marker.setLatLng(newLatLng);
                        accuracyCircle.setLatLng(newLatLng);
                        accuracyCircle.setRadius(accuracy);
                        map.panTo(newLatLng);
                    }
                }, 
                (err) => {
                    errorMsg.classList.remove('hidden');
                    errorMsg.innerText = "> ACCESS DENIED / GPS ERROR";
                    trackBtn.innerText = "[ RETRY ]";
                },
                options
            );
        } else {
            errorMsg.classList.remove('hidden');
            errorMsg.innerText = "> HARDWARE NOT COMPATIBLE";
        }
    });
}

// --- 3. MATRIX RAIN EFFECT (Visual Background) ---
const canvas = document.getElementById('matrix');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%";
const fontSize = 14;
const columns = canvas.width / fontSize;
const drops = [];

for (let x = 0; x < columns; x++) drops[x] = 1;

function drawMatrix() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "#0F0"; // Green Text
    ctx.font = fontSize + "px arial";

    for (let i = 0; i < drops.length; i++) {
        const text = letters[Math.floor(Math.random() * letters.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
    }
}

setInterval(drawMatrix, 33); // Jalankan animasi
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});