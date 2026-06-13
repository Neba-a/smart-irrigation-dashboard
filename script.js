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
                    label: "Zone 1",
                    data: zone1Data,
                    borderColor: "green",
                    fill: false
                },
                {
                    label: "Zone 2",
                    data: zone2Data,
                    borderColor: "blue",
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            animation: false,
            scales: {
                y: {
                    min: 35,
                    max: 55
                }
            }
        }
    });

    setInterval(updateDashboard, 1000);
};

function updateDashboard() {

    const t = Math.floor(performance.now() / 1000);

    let zone1Display = "Monitoring";
    let zone2Display = "Monitoring";

    let zone1Chart = 43;
    let zone2Chart = 45;

    let valve1 = "OFF";
    let valve2 = "OFF";
    let pump = "OFF";

    let decision = "Reading";

    let esp32 = "Reading";
    let mpc = "Reading";

    let waterUsed = 0.4;
    let recommended = 0.2;

    let alertText = "Reading sensors...";
    let reservoir = 70;

    /* -------------------------
       SYSTEM ANALYSIS
    --------------------------*/

    if (t >= 5) {
        esp32 = "🟢 Online";
        mpc = "🟢 Running";
    }

    /* -------------------------
       ZONE 1
    --------------------------*/

    if (t < 20) {

        zone1Display = "Monitoring";

    } else {

        let moisture = 43 - Math.floor((t - 20) / 60);

        if (moisture < 40) moisture = 40;

        zone1Display = moisture + "%";
        zone1Chart = moisture;
    }

    /* -------------------------
       ZONE 2 TIMELINE
    --------------------------*/

    if (t < 20) {

        zone2Display = "Monitoring";
        decision = "Monitoring";

    }

    else if (t < 25) {

        zone2Display = "45%";
        zone2Chart = 45;
        decision = "Monitoring";

    }

    else if (t < 31) {

        valve2 = "ON";
        pump = "ON";

        zone2Display = "Monitoring";

        decision = "Irrigating Zone 2";

    }

    else if (t < 34) {

        valve2 = "ON";
        pump = "ON";

        zone2Display = "47%";
        zone2Chart = 47;

        decision = "Irrigating Zone 2";

    }

    else {

        zone2Display = "48%";
        zone2Chart = 48;

        recommended = 0;

        reservoir = 55;

        decision = "Monitoring";

        alertText = "Zone 1 optimal. Zone 2 reached target moisture.";
    }

    /* -------------------------
       WATER MANAGEMENT
    --------------------------*/

    document.getElementById("waterUsed").textContent =
        waterUsed.toFixed(1);

    document.getElementById("recommendedWater").textContent =
        recommended.toFixed(1);

    document.getElementById("recommendedMPC").textContent =
        recommended.toFixed(1);

    /* -------------------------
       SYSTEM STATUS
    --------------------------*/

    const systemCard = document.querySelector(".card:nth-child(2)");

    systemCard.innerHTML = `
        <h2>⚙ System Status</h2>

        <p>ESP32: ${esp32}</p>

        <p>MPC: ${mpc}</p>

        <p>Pump:
            <span id="pumpStatus">${pump}</span>
        </p>

        <p>Mode: AUTO</p>
    `;

    /* -------------------------
       ZONE DISPLAY
    --------------------------*/

    document.getElementById("zone1Value").textContent =
        zone1Display;

    document.getElementById("zone2Value").textContent =
        zone2Display;

    document.getElementById("zone1Bar").style.width =
        zone1Chart + "%";

    document.getElementById("zone2Bar").style.width =
        zone2Chart + "%";

    document.getElementById("valve1").textContent =
        valve1;

    document.getElementById("valve2").textContent =
        valve2;

    document.getElementById("decision").textContent =
        decision;

    document.getElementById("alertText").textContent =
        alertText;

    document.getElementById("reservoir").textContent =
        reservoir;

    document.getElementById("lastUpdate").textContent =
        new Date().toLocaleTimeString();

    /* -------------------------
       CHART
    --------------------------*/

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
