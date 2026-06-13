let startTime = Date.now();

function updateDashboard() {

    let elapsed =
        Math.floor((Date.now() - startTime) / 1000);

    let zone1 = 70;
    let zone2;
    let valve1 = "OFF";
    let valve2;
    let pump;
    let waterUsed;

    if (elapsed < 6) {

        zone2 = 45;
        valve2 = "OFF";
        pump = "OFF";
        waterUsed = 1.0;

    } else if (elapsed < 7) {

        zone2 = 45;
        valve2 = "ON";
        pump = "ON";
        waterUsed = 0.2;

    } else if (elapsed < 10) {

        zone2 = 45;
        valve2 = "ON";
        pump = "ON";
        waterUsed = 0.1;

    } else {

        zone2 = 48;
        valve2 = "OFF";
        pump = "OFF";
        waterUsed = 0.0;
    }

    document.getElementById("zone1Value").textContent =
        zone1;

    document.getElementById("zone2Value").textContent =
        zone2;

    document.getElementById("zone1Bar").style.width =
        zone1 + "%";

    document.getElementById("zone2Bar").style.width =
        zone2 + "%";

    document.getElementById("prediction").textContent =
        59;

    document.getElementById("recommended").textContent =
        "0.3";

    document.getElementById("waterUsed").textContent =
        waterUsed.toFixed(1);

    document.getElementById("valve1").textContent =
        valve1;

    document.getElementById("valve2").textContent =
        valve2;

    document.getElementById("pumpStatus").textContent =
        pump;

    if (pump === "ON") {
        document.getElementById("decision").textContent =
            "Irrigating Zone 2";
    } else {
        document.getElementById("decision").textContent =
            "Monitoring";
    }

    if (pump === "ON") {
        document.getElementById("alertText").textContent =
            "Zone 2 irrigation active.";
    } else {
        document.getElementById("alertText").textContent =
            "Zone 1 optimal. Zone 2 under observation.";
    }

    // Update graph
    zone1Data.push(zone1);
    zone2Data.push(zone2);

    zone1Data.shift();
    zone2Data.shift();

    labels.push(
        new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        })
    );

    labels.shift();

    moistureChart.data.labels = labels;
    moistureChart.update();

    document.getElementById("lastUpdate").textContent =
        new Date().toLocaleTimeString();
}
