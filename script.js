let moistureChart;

let labels = ["0", "1", "2", "3", "4", "5"];

let zone1Data = [70, 70, 70, 70, 70, 70];
let zone2Data = [45, 45, 45, 45, 45, 45];

let cycleCount = 0; // 👈 for water usage tracking

/* ================= WEATHER ================= */

async function getWeather() {

    const url =
        "https://api.open-meteo.com/v1/forecast?latitude=9.03&longitude=38.74&current=temperature_2m,relative_humidity_2m,rain&timezone=auto";

    try {

        const response = await fetch(url);
        const data = await response.json();

        document.getElementById("temp").textContent =
            data.current.temperature_2m;

        document.getElementById("humidity").textContent =
            data.current.relative_humidity_2m;

        document.getElementById("rain").textContent =
            data.current.rain;

        document.getElementById("rainChance").textContent =
            Math.min(100, Math.round(data.current.rain * 20));

    } catch (err) {
        console.error("Weather error:", err);
    }
}

/* ================= CHART INIT ================= */

function initChart() {

    const ctx = document.getElementById("moistureChart").getContext("2d");

    moistureChart = new Chart(ctx, {

        type: "line",

        data: {
            labels: labels,
            datasets: [
                {
                    label: "Zone 1 Moisture",
                    data: zone1Data,
                    borderWidth: 3
                },
                {
                    label: "Zone 2 Moisture",
                    data: zone2Data,
                    borderWidth: 3
                }
            ]
        },

        options: {
            responsive: true,
            animation: false, // 👈 prevents disappearing effect
            scales: {
                y: {
                    min: 0,
                    max: 100
                }
            }
        }
    });
}

/* ================= DASHBOARD ================= */

function updateDashboard() {

    let cycleTime = Date.now() % 11000;

    let zone1 = 70;
    let zone2 = 45;

    let valve1 = "OFF";
    let valve2 = "OFF";
    let pump = "OFF";

    let waterUsed = 1.0 + (cycleCount * 0.3); // 👈 REQUIRED FIX

    /* ---------------- CYCLE LOGIC ---------------- */

    if (cycleTime >= 6000) {

        // irrigation phase (6–11s)
        pump = "ON";
        valve2 = "ON";

    } else {

        // idle phase
        pump = "OFF";
        valve2 = "OFF";
    }

    /* ---------------- END OF CYCLE UPDATE ---------------- */

    if (cycleTime < 100) {
        cycleCount++; // 👈 increases every new cycle
    }

    /* ---------------- UI ---------------- */

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

    /* ---------------- CHART UPDATE (SAFE) ---------------- */

    zone1Data.push(zone1);
    zone2Data.push(zone2);

    zone1Data.shift();
    zone2Data.shift();

    labels.push(new Date().toLocaleTimeString());
    labels.shift();

    if (moistureChart) {

        moistureChart.data.labels = labels;
        moistureChart.data.datasets[0].data = zone1Data;
        moistureChart.data.datasets[1].data = zone2Data;

        moistureChart.update('none'); // 👈 prevents disappearing
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
