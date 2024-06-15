$(document).ready(function() {
    const channelId = '2575632';
    const readApiKey = 'X8B5ZKQ2BJK9KFP7';
    const apiKey = 'd324d784974b473ce975c14656269ab8'; // Replace with your OpenWeatherMap API key
    const city = 'Kathmandu'; // Your city name
    const results = 1; // Number of entries to retrieve

    // Function to fetch data from ThingSpeak
    function fetchData() {
        $.getJSON(`https://api.thingspeak.com/channels/${channelId}/feeds.json?api_key=${readApiKey}&results=${results}`, function(data) {
            console.log("ThingSpeak data:", data); // Debugging line
            if (data.feeds && data.feeds.length > 0) {
                const latestFeed = data.feeds[0];
                // Update latest values
                $('#temperature').text(latestFeed.field1 + ' °C');
                $('#humidity').text(latestFeed.field2 + ' %');
                $('#soilMoisture').text(latestFeed.field3 + ' %');
                $('#lightIntensityLux').text(latestFeed.field5 + ' Lux');
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

    // Fetch data and weather on page load
    fetchData();
    fetchWeather();

    // Fetch data and weather every 60 seconds
    setInterval(fetchData, 60000);
    setInterval(fetchWeather, 60000);
});
