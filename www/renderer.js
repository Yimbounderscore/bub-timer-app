const BOT_API_URL = "http://172.237.110.96:8080/time";
let targetDate = null;

const isCapacitor = typeof window !== 'undefined' && window.Capacitor;

async function fetchTime() {
    const statusEl = document.getElementById('status');
    try {
        let data;

        if (isCapacitor && window.Capacitor.Plugins.CapacitorHttp) {
            const response = await window.Capacitor.Plugins.CapacitorHttp.get({
                url: BOT_API_URL
            });
            data = response.data;
        } else {
            const response = await fetch(BOT_API_URL);
            if (!response.ok) throw new Error('Network response was not ok');
            data = await response.json();
        }

        if (data.target_time) {
            targetDate = new Date(data.target_time);
            document.getElementById('target').innerText = `Target: ${targetDate.toLocaleString()}`;
            statusEl.innerText = "Connected";
            statusEl.style.color = "#4caf50";
        }
    } catch (error) {
        console.error("Failed to fetch time:", error);
        statusEl.innerText = `Error: ${error.message}`;
        statusEl.style.color = "#f44336";
    }
}

function updateTimer() {
    const timerEl = document.getElementById('timer');

    if (!targetDate) {
        timerEl.innerText = "--:--:--";
        return;
    }

    const now = new Date();
    const diff = targetDate - now;

    if (diff <= 0) {
        timerEl.innerText = "YAPPING NOW!";
        // optionally fetch new time if passed
        if (diff < -5000) fetchTime();
        return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    timerEl.innerText =
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Initial fetch
fetchTime();

// Poll API every 60 seconds to sync
setInterval(fetchTime, 60000);

// Update timer display every second
setInterval(updateTimer, 1000);

// ========== VIDEO CONTROLS ==========

// Video definitions
const VIDEOS = {
    subway: { id: 'vTfD20dbxho', name: 'Subway Surfers', duration: 3600 },
    family: { id: 'mn-Tlb_wfjc', name: 'Family Guy', duration: 2400 },
    minecraft: { id: 'OqPxaKs8xrk', name: 'Minecraft Parkour', duration: 3600 },
    reddit: { id: 'RaONUk-Y5tQ', name: 'Reddit Stories', duration: 3600 }
};

// Current selections (which video is in which slot)
let topVideo = 'subway';
let bottomVideo = 'family';

// Mute states per video
let muteStates = {
    subway: true,
    family: false,
    minecraft: true,
    reddit: true
};

// Generate random start time
function getRandomStart(maxSeconds) {
    return Math.floor(Math.random() * maxSeconds);
}

// Build YouTube embed URL
function buildUrl(videoKey) {
    const video = VIDEOS[videoKey];
    const muteParam = muteStates[videoKey] ? 1 : 0;
    const startTime = getRandomStart(video.duration);
    return `https://www.youtube.com/embed/${video.id}?autoplay=1&mute=${muteParam}&loop=1&playlist=${video.id}&start=${startTime}`;
}

// Elements
const settingsBtn = document.getElementById('settings-btn');
const modalOverlay = document.getElementById('modal-overlay');
const closeBtn = document.getElementById('close-btn');
const videoTop = document.getElementById('video-top');
const videoBottom = document.getElementById('video-bottom');
const iframeTop = document.getElementById('iframe-top');
const iframeBottom = document.getElementById('iframe-bottom');
const selectTop = document.getElementById('select-top');
const selectBottom = document.getElementById('select-bottom');
const audioSubway = document.getElementById('audio-subway');
const audioFamily = document.getElementById('audio-family');
const audioMinecraft = document.getElementById('audio-minecraft');
const audioReddit = document.getElementById('audio-reddit');

// Refresh iframes with current settings
function refreshIframes() {
    iframeTop.src = buildUrl(topVideo);
    iframeBottom.src = buildUrl(bottomVideo);
}

// Set random start positions on initial load
refreshIframes();

// Open/Close Modal
settingsBtn.addEventListener('click', () => {
    modalOverlay.classList.add('active');
});

closeBtn.addEventListener('click', () => {
    modalOverlay.classList.remove('active');
});

modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        modalOverlay.classList.remove('active');
    }
});

// Video Selection
selectTop.addEventListener('change', () => {
    topVideo = selectTop.value;
    // If same as bottom, swap them
    if (topVideo === bottomVideo) {
        bottomVideo = selectBottom.value = [...Object.keys(VIDEOS)].find(v => v !== topVideo);
    }
    refreshIframes();
});

selectBottom.addEventListener('change', () => {
    bottomVideo = selectBottom.value;
    // If same as top, swap them
    if (bottomVideo === topVideo) {
        topVideo = selectTop.value = [...Object.keys(VIDEOS)].find(v => v !== bottomVideo);
    }
    refreshIframes();
});

// Audio Toggles
audioSubway.addEventListener('change', () => {
    muteStates.subway = !audioSubway.checked;
    refreshIframes();
});

audioFamily.addEventListener('change', () => {
    muteStates.family = !audioFamily.checked;
    refreshIframes();
});

audioMinecraft.addEventListener('change', () => {
    muteStates.minecraft = !audioMinecraft.checked;
    refreshIframes();
});

audioReddit.addEventListener('change', () => {
    muteStates.reddit = !audioReddit.checked;
    refreshIframes();
});

// ========== AUTO-RESUME ON APP FOCUS ==========

// Resume videos when app returns to foreground
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        refreshIframes();
    }
});

// Also handle Capacitor app resume event
if (isCapacitor && window.Capacitor.Plugins.App) {
    window.Capacitor.Plugins.App.addListener('appStateChange', (state) => {
        if (state.isActive) {
            refreshIframes();
        }
    });
}
