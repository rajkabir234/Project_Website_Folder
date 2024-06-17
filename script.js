$(document).ready(function() {
    const channelId = '2575632';
    const readApiKey = 'X8B5ZKQ2BJK9KFP7';
    const apiKey = 'd324d784974b473ce975c14656269ab8'; // Replace with your OpenWeatherMap API key
    const city = 'Dhulikhel'; // Your city name
    const results = 40; // Number of entries to retrieve for graph

    let modalChart;
    const modal = document.getElementById("modal");
    const span = document.getElementsByClassName("close")[0];

    // Close the modal
    span.onclick = function() {
        modal.style.display = "none";
        if (modalChart) {
            modalChart.destroy();
        }
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
            if (modalChart) {
                modalChart.destroy();
            }
        }
    }

    // Function to fetch data from ThingSpeak
    function fetchData() {
        $.getJSON(`https://api.thingspeak.com/channels/${channelId}/feeds.json?api_key=${readApiKey}&results=${results}`, function(data) {
            console.log("ThingSpeak data:", data); // Debugging line
            if (data.feeds && data.feeds.length > 0) {
                const feeds = data.feeds;
                const temperatures = feeds.map(feed => parseFloat(feed.field1));
                const humidities = feeds.map(feed => parseFloat(feed.field2));
                const soilMoistures = feeds.map(feed => parseFloat(feed.field3));
                const lightIntensities = feeds.map(feed => parseFloat(feed.field5));
                const timestamps = feeds.map(feed => new Date(feed.created_at).toLocaleTimeString());

                updateChart(temperatureChart, timestamps, temperatures, 'Temperature (°C)');
                updateChart(humidityChart, timestamps, humidities, 'Humidity (%)');
                updateChart(soilMoistureChart, timestamps, soilMoistures, 'Soil Moisture (%)');
                updateChart(lightIntensityChart, timestamps, lightIntensities, 'Light Intensity (Lux)');

                // Update numerical values
                $('#temperature').text(temperatures[temperatures.length - 1] + ' °C');
                $('#humidity').text(humidities[humidities.length - 1] + ' %');
                $('#soilMoisture').text(soilMoistures[soilMoistures.length - 1] + ' %');
                $('#lightIntensityLux').text(lightIntensities[lightIntensities.length - 1] + ' Lux');
            } else {
                console.log("No data feeds available");
            }
        }).fail(function() {
            console.log("Failed to fetch data from ThingSpeak");
        });
    }

    // Function to fetch weather from OpenWeatherMap API
    function fetchWeather() {
        $.getJSON(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`, function(data) {
            console.log("OpenWeatherMap data:", data); // Debugging line
            const weatherDescription = data.weather[0].description;
            $('#weather').text("Weather: " + weatherDescription); // Update here

            // Add weather icon
            const weatherIconClass = getWeatherIconClass(data.weather[0].icon);
            $('#weatherIcon').html(`<i class="${weatherIconClass}"></i>`);

            // Display live temperature
            $('#liveTemperature').text("Live Temperature: " + data.main.temp + ' °C');

            // Change background based on weather
            changeBackground(data.weather[0].icon);
        }).fail(function() {
            $('#weather').text("Weather data unavailable"); // Error message if data is unavailable
        });
    }

    // Function to get weather icon class based on weather condition code
    function getWeatherIconClass(iconCode) {
        // Map weather condition code to appropriate icon class from Font Awesome
        switch (iconCode) {
            case '01d':
            case '01n':
                return 'fas fa-sun'; // clear sky
            case '02d':
            case '02n':
                return 'fas fa-cloud-sun'; // few clouds
            case '03d':
            case '03n':
                return 'fas fa-cloud'; // scattered clouds
            case '04d':
            case '04n':
                return 'fas fa-cloud'; // broken clouds
            case '09d':
            case '09n':
                return 'fas fa-cloud-showers-heavy'; // shower rain
            case '10d':
            case '10n':
                return 'fas fa-cloud-rain'; // rain
            case '11d':
            case '11n':
                return 'fas fa-bolt'; // thunderstorm
            case '13d':
            case '13n':
                return 'fas fa-snowflake'; // snow
            case '50d':
            case '50n':
                return 'fas fa-smog'; // mist
            default:
                return 'fas fa-question'; // unknown condition
        }
    }

    // Function to change background based on weather condition
    function changeBackground(iconCode) {
        $('body').removeClass();
        switch (iconCode) {
            case '01d':
            case '01n':
                $('body').addClass('clear-sky');
                break;
            case '02d':
            case '02n':
                $('body').addClass('few-clouds');
                break;
            case '03d':
            case '03n':
            case '04d':
            case '04n':
                $('body').addClass('scattered-clouds');
                break;
            case '09d':
            case '09n':
            case '10d':
            case '10n':
                $('body').addClass('rain');
                break;
            case '11d':
            case '11n':
                $('body').addClass('thunderstorm');
                break;
            case '13d':
            case '13n':
                $('body').addClass('snow');
                break;
            case '50d':
            case '50n':
                $('body').addClass('mist');
                break;
            default:
                $('body').addClass('default');
                break;
        }
    }

    // Function to update the chart data
    function updateChart(chart, labels, data, label) {
        chart.data.labels = labels;
        chart.data.datasets[0].data = data;
        chart.data.datasets[0].label = label;
        chart.update();
    }

    // Event listeners for the cards
    $('.temperature-card').click(function() {
        openModal('Temperature', temperatureChart.data.labels, temperatureChart.data.datasets[0].data, 'Temperature (°C)');
    });

    $('.humidity-card').click(function() {
        openModal('Humidity', humidityChart.data.labels, humidityChart.data.datasets[0].data, 'Humidity (%)');
    });

    $('.soil-moisture-card').click(function() {
        openModal('Soil Moisture', soilMoistureChart.data.labels, soilMoistureChart.data.datasets[0].data, 'Soil Moisture (%)');
    });

    $('.light-intensity-card').click(function() {
        openModal('Light Intensity', lightIntensityChart.data.labels, lightIntensityChart.data.datasets[0].data, 'Light Intensity (Lux)');
    });

    // Function to open the modal and display the chart
    function openModal(title, labels, data, label) {
        modal.style.display = "block";
        if (modalChart) {
            modalChart.destroy();
        }

        const ctx = document.getElementById('modalChart').getContext('2d');
        modalChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: label,
                    data: data,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    function updateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        $('#time').text("Time: " + timeString);
    }

    // Create charts
    const temperatureChart = new Chart(document.getElementById('temperatureChart'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Temperature',
                data: [],
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    const humidityChart = new Chart(document.getElementById('humidityChart'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Humidity',
                data: [],
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    const soilMoistureChart = new Chart(document.getElementById('soilMoistureChart'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Soil Moisture',
                data: [],
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    const lightIntensityChart = new Chart(document.getElementById('lightIntensityChart'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Light Intensity',
                data: [],
                borderColor: 'rgba(255, 206, 86, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });



    // Fetch data and weather on page load
    fetchData();
    fetchWeather();
    updateTime(); // Call updateTime function

    // Fetch data and weather every 30 seconds
    setInterval(fetchData, 30000);
    setInterval(fetchWeather, 30000);
    setInterval(updateTime, 60000); // Update time every minute
});
