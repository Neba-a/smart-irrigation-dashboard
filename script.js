let startTime = Date.now();

/* ---------------- WEATHER FUNCTION ---------------- */
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

        let rainChance = Math.min(100, Math.round(data.current.rain * 20));

        document.getElementById("rainChance").textContent =
            rainChance;

        // ONLY decision logic (NO pump control here anymore)
        if (data.current.rain > 3) {

            document.getElementById("decision").textContent =
                "Delay Irrigation";

            document.getElementById("alertText").textContent =
                "Rain detected. Irrigation postponed.";

        } else {

            document.getElementById("decision").textContent =
                "MPC Active";

            document.getElementById("alertText").textContent =
                "Conditions suitable for irrigation.";
        }

    } catch (error) {

        console.error("Weather API Error:", error);

        document.getElementById("alertText").textContent =
            "Weather data unavailable.";
    }
}

/* ---------------- CHART SETUP ---------------- */

const ctx = document.getElementById("moistureChart");

let labels = ["0", "1", "2", "3", "4", "5"];

let zone1Data = [70, 70, 70, 70, 70, 70];
let zone2Data = [45, 45, 45, 45, 45, 45];

const moistureChart = new Chart(ctx, {

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

        scales: {
            y: {
                min: 0,
                max: 100
            }
        }
    }
});

/* ---------------- DASHBOARD LOGIC ---------------- */

function updateDashboard() {

    let elapsed = Math.floor((Date.now() - startTime) / 1000);

    let zone1 = 70;
    let zone2;
    let valve1 = "OFF";
    let valve2;
    let pump;
    let waterUsed;

    /* -------- TIMING SEQUENCE -------- */

    if (elapsed < 6) {

        zone2 = 45;
        valve2 = "OFF";
        pump = "OFF";
        waterUsed = 1.0;

    } else if (elapsed < 11) {

        zone2 = 45;
        valve2 = "ON";
        pump = "ON";

        if (elapsed < 7) {
            waterUsed = 0.2;
        } else if (elapsed < 10) {
            waterUsed = 0.1;
        } else {
            waterUsed = 0.0;
        }

    } else {

        zone2 = 48;
        valve2 = "OFF";
        pump = "OFF";
        waterUsed = 0.0;
    }

    /* -------- UI UPDATE -------- */

    document.getElementById("zone1Value").textContent = zone1;
    document.getElementById("zone2Value").textContent = zone2;

    document.getElementById("zone1Bar").style.width = zone1 + "%";
    document.getElementById("zone2Bar").style.width = zone2 + "%";

    document.getElementById("valve1").textContent = valve1;
    document.getElementById("valve2").textContent = valve2;
    document.getElementById("pumpStatus").textContent = pump;

    document.getElementById("waterUsed").textContent =
        waterUsed.toFixed(1);

    document.getElementById("prediction").textContent = 59;
    document.getElementById("recommended").textContent = "0.3";

    if (pump === "ON") {
        document.getElementById("decision").textContent =
            "Irrigating Zone 2";
    }

    /* -------- ALERTS -------- */

    if (pump === "ON") {
        document.getElementById("alertText").textContent =
            "Zone 2 irrigation active.";
    }

    /* -------- GRAPH UPDATE -------- */

    zone1Data.push(zone1);
    zone2Data.push(zone2);

    zone1Data.shift();
    zone2Data.shift();

    labels.push(
        new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        })
    );

    labels.shift();

    moistureChart.data.labels = labels;
    moistureChart.update();

    document.getElementById("lastUpdate").textContent =
        new Date().toLocaleTimeString();
}

/* ---------------- START SYSTEM ---------------- */

getWeather();
updateDashboard();

setInterval(updateDashboard, 1000);
setInterval(getWeather, 300000);
