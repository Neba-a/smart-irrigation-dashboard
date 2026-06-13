let moistureChart;

const labels = Array(20).fill("");
const zone1Data = Array(20).fill(43);
const zone2Data = Array(20).fill(45);

window.onload = function () {

    const ctx = document.getElementById("moistureChart");

    moistureChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Zone 1 Moisture",
                    data: zone1Data,
                    borderColor: "#2e7d32",
                    backgroundColor: "transparent",
                    tension: 0.4
                },
                {
                    label: "Zone 2 Moisture",
                    data: zone2Data,
                    borderColor: "#1976d2",
                    backgroundColor: "transparent",
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            animation: false,
            scales: {
                y: {
                    min: 35,
                    max: 50
                }
            }
        }
    });

    updateDashboard();
    setInterval(updateDashboard, 1000);
};

function updateDashboard() {

    const t = Math.floor(performance.now() / 1000);

    let zone1Display = "Reading";
    let zone2Display = "Reading";

    let zone1Chart = 43;
    let zone2Chart = 45;

    let valve1 = "OFF";
    let valve2 = "OFF";
    let pump = "OFF";

    let esp32 = "Reading";
    let mpc = "Reading";

    let decision = "Reading";

    let waterUsed = 0.4;
    let recommended = 0.2;

    let prediction = 47;
    let saving = 35;

    let reservoir = 70;

    let alertText = "System collecting sensor data...";

    /* ==================================
       STAGE 1 : READING (0-25 SEC)
       ================================== */

    if (t < 25) {

        zone1Display = "Reading";
        zone2Display = "Reading";

        alertText = "Reading soil moisture sensors...";

    }

    /* ==================================
       STAGE 2 : MONITORING (25-30 SEC)
       ================================== */

    else if (t < 30) {

        esp32 = "🟢 Online";
        mpc = "🟢 Running";

        zone1Display = "43%";
        zone2Display = "45%";

        zone1Chart = 43;
        zone2Chart = 45;

        decision = "Monitoring";

        alertText = "Zone 1 optimal. Zone 2 under observation.";

    }

    /* ==================================
       STAGE 3 : IRRIGATION (30-36 SEC)
       ================================== */

    else if (t < 36) {

        esp32 = "🟢 Online";
        mpc = "🟢 Running";

        valve2 = "ON";
        pump = "ON";

        zone1Display = "43%";
        zone2Display = "Monitoring";

        zone1Chart = 43;
        zone2Chart = 45;

        decision = "Irrigating Zone 2";

        alertText = "Irrigation active for Zone 2.";

    }

    /* ==================================
       STAGE 4 : 47% (36-39 SEC)
       ================================== */

    else if (t < 39) {

        esp32 = "🟢 Online";
        mpc = "🟢 Running";

        valve2 = "ON";
        pump = "ON";

        zone1Display = "43%";
        zone2Display = "47%";

        zone1Chart = 43;
        zone2Chart = 47;

        decision = "Irrigating Zone 2";

        alertText = "Zone 2 approaching target moisture.";

    }

    /* ==================================
       STAGE 5 : COMPLETE (39+ SEC)
       ================================== */

    else {

        esp32 = "🟢 Online";
        mpc = "🟢 Running";

        const zone1Moisture =
            Math.max(
                40,
                43 - Math.floor((t - 39) / 60)
            );

        zone1Display = zone1Moisture + "%";
        zone2Display = "48%";

        zone1Chart = zone1Moisture;
        zone2Chart = 48;

        recommended = 0;

        reservoir = 55;

        decision = "Monitoring";

        alertText =
            "Target achieved. Irrigation stopped.";

    }

    /* ==================================
       UPDATE PAGE
       ================================== */

    document.getElementById("esp32Status").textContent = esp32;
    document.getElementById("mpcStatus").textContent = mpc;

    document.getElementById("pumpStatus").textContent = pump;

    document.getElementById("valve1").textContent = valve1;
    document.getElementById("valve2").textContent = valve2;

    document.getElementById("zone1Value").textContent =
        zone1Display;

    document.getElementById("zone2Value").textContent =
        zone2Display;

    document.getElementById("zone1Bar").style.width =
        zone1Chart + "%";

    document.getElementById("zone2Bar").style.width =
        zone2Chart + "%";

    document.getElementById("waterUsed").textContent =
        waterUsed.toFixed(1);

    document.getElementById("recommendedWater").textContent =
        recommended.toFixed(1);

    document.getElementById("recommendedMPC").textContent =
        recommended.toFixed(1);

    document.getElementById("prediction").textContent =
        prediction;

    document.getElementById("saving").textContent =
        saving;

    document.getElementById("decision").textContent =
        decision;

    document.getElementById("alertText").textContent =
        alertText;

    document.getElementById("reservoir").textContent =
        reservoir;

    document.getElementById("lastUpdate").textContent =
        new Date().toLocaleTimeString();

    /* ==================================
       CHART UPDATE
       ================================== */

    zone1Data.push(zone1Chart);
    zone2Data.push(zone2Chart);

    zone1Data.shift();
    zone2Data.shift();

    labels.push("");
    labels.shift();

    moistureChart.data.labels = labels;
    moistureChart.data.datasets[0].data = zone1Data;
    moistureChart.data.datasets[1].data = zone2Data;

    moistureChart.update("none");
}
