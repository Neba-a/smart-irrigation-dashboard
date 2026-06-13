let moistureChart;

let labels = ["0", "1", "2", "3", "4", "5"];

let zone1Data = [70, 70, 70, 70, 70, 70];
let zone2Data = [45, 45, 45, 45, 45, 45];

/* ================= STATE MACHINE ================= */

let phase = 0; // 0 = idle, 1 = pumping, 2 = recovery
let phaseStart = Date.now();

/* ================= WEATHER ================= */

async function getWeather() {

    try {

        const res = await fetch(
            "https://api.open-meteo.com/v1/forecast?latitude=9.03&longitude=38.74&current=temperature_2m,relative_humidity_2m,rain&timezone=auto"
        );

        const data = await res.json();

        document.getElementById("temp").textContent =
            data.current.temperature_2m;

        document.getElementById("humidity").textContent =
            data.current.relative_humidity_2m;

        document.getElementById("rain").textContent =
            data.current.rain;

        document.getElementById("rainChance").textContent =
            Math.min(100, Math.round(data.current.rain * 20));

    } catch (e) {
        console.error("Weather error", e);
    }
}

/* ================= CHART INIT (SAFE) ================= */

function initChart() {

    const canvas = document.getElementById("moistureChart");

    if (!canvas) {
        console.error("Chart canvas missing!");
        return;
    }

    const ctx = canvas.getContext("2d");

    moistureChart = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [
                {
                    label: "Zone 1",
                    data: zone1Data,
                    borderWidth: 3
                },
                {
                    label: "Zone 2",
                    data: zone2Data,
                    borderWidth: 3
                }
            ]
        },
        options: {
            responsive: true,
            animation: false,
            scales: {
                y: { min: 0, max: 100 }
            }
        }
    });
}

/* ================= MPC STATE MACHINE ================= */

function updateDashboard() {

    let now = Date.now();

    let zone1 = 70;
    let zone2 = 45;

    let valve1 = "OFF";
    let valve2 = "OFF";
    let pump = "OFF";
    let waterUsed = 0.3;

    let elapsed = now - phaseStart;

    /* -------- PHASE LOGIC -------- */

    if (phase === 0) {
        // IDLE (0–6s)
        zone2 = 45;
        pump = "OFF";
        valve2 = "OFF";
        waterUsed = 0.3;

        if (elapsed > 6000) {
            phase = 1;
            phaseStart = now;
        }

    } else if (phase === 1) {
        // PUMP ON (5s)
        zone2 = 45;
        pump = "ON";
        valve2 = "ON";
        waterUsed = 0.3;

        if (elapsed > 5000) {
            phase = 2;
            phaseStart = now;
        }

    } else if (phase === 2) {
        // RECOVERY (moisture increases)
        pump = "OFF";
        valve2 = "OFF";
        waterUsed = 0.6;

        zone2 = 48 + (Math.floor(Date.now() / 10000) % 5) * 3;

        if (elapsed > 4000) {
            phase = 0;
            phaseStart = now;
        }
    }

    /* -------- UI -------- */

    document.getElementById("zone1Value").textContent = zone1;
    document.getElementById("zone2Value").textContent = zone2;

    document.getElementById("zone1Bar").style.width = zone1 + "%";
    document.getElementById("zone2Bar").style.width = zone2 + "%";

    document.getElementById("valve1").textContent = valve1;
    document.getElementById("valve2").textContent = valve2;
    document.getElementById("pumpStatus").textContent = pump;

    document.getElementById("waterUsed").textContent =
        waterUsed.toFixed(1);

    document.getElementById("decision").textContent =
        pump === "ON" ? "Irrigating Zone 2" : "Monitoring";

    document.getElementById("lastUpdate").textContent =
        new Date().toLocaleTimeString();

    /* -------- CHART UPDATE (SAFE GUARD) -------- */

    if (moistureChart) {

        zone1Data.push(zone1);
        zone2Data.push(zone2);

        zone1Data.shift();
        zone2Data.shift();

        labels.push(new Date().toLocaleTimeString());
        labels.shift();

        moistureChart.data.labels = labels;
        moistureChart.update();
    }
}

/* ================= START SYSTEM ================= */

window.onload = function () {

    initChart();

    getWeather();
    updateDashboard();

    setInterval(updateDashboard, 3000);
    setInterval(getWeather, 300000);
};
