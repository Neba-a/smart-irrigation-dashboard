let moistureChart;

let labels = ["0", "1", "2", "3", "4", "5"];
let zone1Data = [70, 70, 70, 70, 70, 70];
let zone2Data = [45, 45, 45, 45, 45, 45];

const CYCLE_TIME = 11 * 1000; // 11 seconds cycle

/* ================= WEATHER ================= */

async function getWeather() {

    const url =
        "https://api.open-meteo.com/v1/forecast?latitude=9.03&longitude=38.74&current=temperature_2m,relative_humidity_2m,rain&timezone=auto";

    try {

        const res = await fetch(url);
        const data = await res.json();

        document.getElementById("temp").textContent =
            data.current.temperature_2m;

        document.getElementById("humidity").textContent =
            data.current.relative_humidity_2m;

        document.getElementById("rain").textContent =
            data.current.rain;

        let rainChance =
            Math.min(100, Math.round(data.current.rain * 20));

        document.getElementById("rainChance").textContent =
            rainChance;

    } catch (e) {
        console.error(e);
    }
}

/* ================= CHART ================= */

function initChart() {

    const ctx = document.getElementById("moistureChart");

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
            scales: {
                y: { min: 0, max: 100 }
            }
        }
    });
}

/* ================= MPC CYCLE ================= */

function updateDashboard() {

    let t = Date.now() % CYCLE_TIME;

    let zone1 = 70;
    let zone2 = 45;

    let valve1 = "OFF";
    let valve2 = "OFF";
    let pump = "OFF";
    let waterUsed = 0.0;

    /* -------- CYCLE PHASES -------- */

    if (t < 6000) {

        // 0–6s idle
        valve2 = "OFF";
        pump = "OFF";
        waterUsed = 0.3;

    } else if (t < 11000) {

        // irrigation ON
        valve2 = "ON";
        pump = "ON";
        waterUsed = 0.3;

    } else {

        // reset phase (after cycle end)
        valve2 = "OFF";
        pump = "OFF";
        waterUsed = 0.6;

        // moisture increases after irrigation
        zone2 = 48 + Math.floor((Date.now() / CYCLE_TIME) % 5) * 3;
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

    document.getElementById("prediction").textContent = "59";
    document.getElementById("recommended").textContent = "0.3";

    document.getElementById("decision").textContent =
        pump === "ON" ? "Irrigating Zone 2" : "Monitoring";

    document.getElementById("lastUpdate").textContent =
        new Date().toLocaleTimeString();

    /* -------- CHART -------- */

    zone1Data.push(zone1);
    zone2Data.push(zone2);

    zone1Data.shift();
    zone2Data.shift();

    labels.push(new Date().toLocaleTimeString());
    labels.shift();

    if (moistureChart) {
        moistureChart.data.labels = labels;
        moistureChart.update();
    }
}

/* ================= START ================= */

window.onload = function () {

    initChart();

    getWeather();
    updateDashboard();

    setInterval(updateDashboard, 3000);
    setInterval(getWeather, 300000);
};
