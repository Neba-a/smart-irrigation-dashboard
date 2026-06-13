let moistureChart;

const labels = [];
const zone1Data = [];
const zone2Data = [];

window.onload = () => {

    const ctx = document.getElementById("moistureChart");

    moistureChart = new Chart(ctx, {
        type: "line",
        data: {
            labels,
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

    let esp32 = "Reading";
    let mpc = "Reading";

    let pump = "OFF";
    let valve1 = "OFF";
    let valve2 = "OFF";

    let zone1Text = "Reading";
    let zone2Text = "Reading";

    let zone1Value = 43;
    let zone2Value = 45;

    let decision = "Reading";

    let waterUsed = 0.4;
    let recommended = 0.2;

    let prediction = 47;
    let saving = 35;

    let reservoir = 70;

    let alertText =
        "Reading soil moisture sensors...";

    /* --------------------------
       0 - 25 seconds
    -------------------------- */

    if (t < 25) {

        decision = "Reading";
    }

    /* --------------------------
       25 - 30 seconds
    -------------------------- */

    else if (t < 30) {

        esp32 = "🟢 Online";
        mpc = "🟢 Running";

        zone1Text = "43%";
        zone2Text = "45%";

        zone1Value = 43;
        zone2Value = 45;

        decision = "Monitoring";

        alertText =
            "Zone 1 optimal. Zone 2 under observation.";
    }

    /* --------------------------
       30 - 36 seconds
    -------------------------- */

    else if (t < 36) {

        esp32 = "🟢 Online";
        mpc = "🟢 Running";

        pump = "ON";
        valve2 = "ON";

        zone1Text = "43%";
        zone2Text = "Monitoring";

        zone1Value = 43;
        zone2Value = 45;

        decision = "Irrigating Zone 2";

        alertText =
            "Pump active. Irrigating Zone 2.";
    }

    /* --------------------------
       36 - 39 seconds
    -------------------------- */

    else if (t < 39) {

        esp32 = "🟢 Online";
        mpc = "🟢 Running";

        pump = "ON";
        valve2 = "ON";

        zone1Text = "43%";
        zone2Text = "47%";

        zone1Value = 43;
        zone2Value = 47;

        decision = "Irrigating Zone 2";

        alertText =
            "Zone 2 approaching target.";
    }

    /* --------------------------
       39+ seconds
    -------------------------- */

    else {

        esp32 = "🟢 Online";
        mpc = "🟢 Running";

        const z1 =
            Math.max(
                40,
                43 - Math.floor((t - 39) / 60)
            );

        zone1Value = z1;
        zone2Value = 48;

        zone1Text = z1 + "%";
        zone2Text = "48%";

        decision = "Monitoring";

        recommended = 0;

        reservoir = 55;

        alertText =
            "Target moisture reached. Irrigation stopped.";
    }

    /* --------------------------
       UPDATE HTML
    -------------------------- */

    document.getElementById("esp32Status").textContent =
        esp32;

    document.getElementById("mpcStatus").textContent =
        mpc;

    document.getElementById("pumpStatus").textContent =
        pump;

    document.getElementById("valve1").textContent =
        valve1;

    document.getElementById("valve2").textContent =
        valve2;

    document.getElementById("zone1Value").textContent =
        zone1Text;

    document.getElementById("zone2Value").textContent =
        zone2Text;

    document.getElementById("zone1Bar").style.width =
        zone1Value + "%";

    document.getElementById("zone2Bar").style.width =
        zone2Value + "%";

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

    /* --------------------------
       CHART UPDATE
    -------------------------- */

    zone1Data.push(zone1Value);
    zone2Data.push(zone2Value);
    labels.push("");

    if (zone1Data.length > 20) {

        zone1Data.shift();
        zone2Data.shift();
        labels.shift();
    }

    moistureChart.update();
}
