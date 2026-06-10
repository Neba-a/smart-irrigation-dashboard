

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

       
        let rainChance = Math.min(
            100,
            Math.round(data.current.rain * 20)
        );

        document.getElementById("rainChance").textContent =
            rainChance;

       
        if (data.current.rain > 3) {

            document.getElementById("decision").textContent =
                "Delay Irrigation";

            document.getElementById("pumpStatus").textContent =
                "OFF";

            document.getElementById("alertText").textContent =
                "Rain detected. Irrigation postponed.";

        } else {

            document.getElementById("decision").textContent =
                "Irrigate";

            document.getElementById("pumpStatus").textContent =
                "ON";

            document.getElementById("alertText").textContent =
                "Conditions suitable for irrigation.";
        }

    } catch (error) {

        console.error("Weather API Error:", error);

        document.getElementById("alertText").textContent =
            "Weather data unavailable.";
    }
}



const ctx = document.getElementById("moistureChart");

let labels = ["0", "1", "2", "3", "4", "5"];

let zone1Data = [60, 62, 63, 64, 65, 66];
let zone2Data = [50, 51, 52, 53, 54, 55];

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



function updateDashboard() {

    let zone1 =
        Math.floor(Math.random() * 20) + 55;

    let zone2 =
        Math.floor(Math.random() * 20) + 45;

    document.getElementById("zone1Value").textContent =
        zone1;

    document.getElementById("zone2Value").textContent =
        zone2;

    document.getElementById("zone1Bar").style.width =
        zone1 + "%";

    document.getElementById("zone2Bar").style.width =
        zone2 + "%";

    let predicted =
        Math.floor((zone1 + zone2) / 2) + 5;

    document.getElementById("prediction").textContent =
        predicted;

    
    let recommended =
        ((70 - predicted) * 0.15).toFixed(1);

    if (recommended < 0) {
        recommended = 0;
    }

    document.getElementById("recommended").textContent =
        recommended;

    
    document.getElementById("valve1").textContent =
        zone1 < 70 ? "ON" : "OFF";

    document.getElementById("valve2").textContent =
        zone2 < 65 ? "ON" : "OFF";

    
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



getWeather();
updateDashboard();


setInterval(updateDashboard, 5000);


setInterval(getWeather, 300000);