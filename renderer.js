const BOT_API_URL = "http://172.237.110.96:8080/time";
let targetDate = null;

async function fetchTime() {
    const statusEl = document.getElementById('status');
    try {
        const response = await fetch(BOT_API_URL);
        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();
        if (data.target_time) {
            targetDate = new Date(data.target_time);
            document.getElementById('target').innerText = `Target: ${targetDate.toLocaleString()}`;
            statusEl.innerText = "Connected";
            statusEl.style.color = "#4caf50";
        }
    } catch (error) {
        console.error("Failed to fetch time:", error);
        statusEl.innerText = "Disconnected (Retrying...)";
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
