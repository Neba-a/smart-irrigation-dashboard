function updateDashboard() {

    let cycleTime = Date.now() % 11000;

    /* ---------------- ZONE 1 (±2% fluctuation) ---------------- */
    let zone1 = 70 + Math.floor(Math.random() * 5) - 2;

    /* ---------------- ZONE 2 STATE ---------------- */
    let zone2;

    let valve1 = "OFF";
    let valve2 = "OFF";
    let pump = "OFF";

    let waterUsed = 1.0 + (cycleCount * 0.3);

    /* ---------------- CYCLE ---------------- */

    let irrigating = cycleTime >= 6000 && cycleTime < 11000;

    if (irrigating) {

        pump = "ON";
        valve2 = "ON";

        // moisture increases during irrigation
        zone2 = (zone2Data[zone2Data.length - 1] || 45) + 0.6;

    } else {

        pump = "OFF";
        valve2 = "OFF";

        // moisture returns toward baseline 45%
        let current = zone2Data[zone2Data.length - 1] || 45;

        zone2 = current - (current - 45) * 0.3;
    }

    /* ---------------- cycle counter ---------------- */
    if (cycleTime < 100) {
        cycleCount++;
    }

    /* ---------------- UI ---------------- */

    document.getElementById("zone1Value").textContent = zone1;
    document.getElementById("zone2Value").textContent = zone2.toFixed(1);

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

    /* ---------------- CHART ---------------- */

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

        moistureChart.update('none');
    }
}
