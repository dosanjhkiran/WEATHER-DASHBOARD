const buttonElement = document.getElementById("submit-button");
const imageContainer = document.querySelector('img');

const weatherAPIURL = "https://api.openweathermap.org/data/2.5/";
const weatherAPIKeyAN = "1b13b5ea93422ad65979d64bde392e76"; // Personal API key; AN

const googleAPIURL = "https://www.googleapis.com/customsearch/v1?";
const googleAPIKeyAN = "AIzaSyBClw4J_kiRJtoks3My-7A34NaVk9ZpjII"; // Personal API key; AN
const googlePSEID = "c12965ece746243b4"; // Programmable Search Engine

let searchHistory = JSON.parse(localStorage.getItem("searchHistory")); // Get searchHistory from localStorage and parse it into an Array object.
if (!searchHistory) { // If searchHistory did not exist in localStorage, set it to an empty Array object. null => []
    searchHistory = [];
}
console.log(searchHistory);

// when a user clicks on the Enter button, 
// the text will not disappear and it will render the dashboard results
buttonElement.addEventListener('click', function(event) {
    event.preventDefault();
    const searchQuery = document.getElementById("search-box").value;

    searchHistory.push(searchQuery); // Add query to searchHistory
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory)); // Update searchHistory in localStorage

    renderDashboardResults(searchQuery);
});

function temperatureToCelcius(degreesKelvin) {
    return (degreesKelvin - 273.15).toFixed(1).concat("°C");
}

function renderDashboardResults(searchQuery) {
    // location-details-container div
    // Declare h2 and p elements here and give them content from the API calls.
    let locationName = document.getElementById("location-name");
    let locationDesc = document.getElementById("location-desc");
    let locationImage = document.getElementById("location-image");

    // location-weather div
    // Declare h2 and div elements here and give them content from the API calls.
    let weatherNow = document.getElementById("weather-now");
    let weatherLow = document.getElementById("weather-low");
    let weatherHigh = document.getElementById("weather-high");

    // API Call to get weather details
    // API fetch request | "https://api.openweathermap.org/data/2.5/weather?q={city name}&appid={API key}"
    // This is for a single-day query.
    let fetchURLSingleDay = weatherAPIURL.concat("weather?q=", searchQuery, "&appid=", weatherAPIKeyAN);
    fetch(fetchURLSingleDay)
        .then(response => {
            if (!response.ok) {
                throw new Error("API response was not okay. (Single day query)");
            }
            return response.json();
        })
        .then(data => {
            console.log(data); // SEE: data format.
            locationName.textContent = data.name.concat(", ", data.sys.country);/* City name from API */;
            weatherNow.textContent = "Now: " + temperatureToCelcius(data.main.temp);
            weatherLow.textContent = "Low: " + temperatureToCelcius(data.main.temp_min);
            weatherHigh.textContent = "High: " + temperatureToCelcius(data.main.temp_max);
        })
        .catch(error => {
            console.log(error); // prints the error in the console
        });
    
    // API fetch request | "https://api.openweathermap.org/data/2.5/forecast?q={city name}&appid={API key}"
    // This is for a 5-day query.
    let fetchURL5Day = weatherAPIURL.concat("forecast?q=", searchQuery, "&appid=", weatherAPIKeyAN);
    fetch(fetchURL5Day)
        .then(response => {
            if (!response.ok) {
                throw new Error("API response was not okay. (Multi day query)");
            }
            return response.json();
        })
        .then(data => {
            console.log(data); // SEE: data format.
            let daysData = get5DayForecast(data.list);
            display5DayForecast(daysData);
        })
        .catch(error => {
            console.log(error);
        });

    // API Calls to get location details
    // API fetch request | "https://www.googleapis.com/customsearch/v1?key={API key}&cx={PSE ID}&q={city name}&searchType=image&num=1"
    // This is for a Google SafeSearch.
    fetch(googleAPIURL.concat("key=", googleAPIKeyAN, "&cx=", googlePSEID, "&q=", searchQuery, "&num=1"))
        .then(response => {
            if (!response.ok) {
                throw new Error("API response was not okay. (Google query)");
            }
            return response.json();
        })
        .then(data => {
            console.log(data); // SEE: data format.
            locationDesc.innerHTML = data.items[0].htmlSnippet.concat(" <a href=", data.items[0].formattedUrl, ">Read More</a><br>Result retrieved from ", data.items[0].displayLink);/* City info from API */;
        })
        .catch(error => {
            console.log("Error:", error); // prints the error in the console
        });

    // API fetch request | "https://www.googleapis.com/customsearch/v1?key={API key}&cx={PSE ID}&q={city name}&searchType=image&num=1"
    // This is for a Google Images SafeSearch.
    fetch(googleAPIURL.concat("key=", googleAPIKeyAN, "&cx=", googlePSEID, "&q=", searchQuery, "&searchType=image&num=1"))
        .then(response => {
            if (!response.ok) {
                throw new Error("API response was not okay. (Google images query)");
            }
            return response.json();
        })
        .then(data => {
            console.log(data); // SEE: data format.
            locationImage.src = data.items[0].link;
        })
        .catch(error => {
            console.log("Error:", error); // prints the error in the console
        });
}

// Function to extract 5-day forecast data
function get5DayForecast(dataList) {
    let daysData = [];
    let currentDate = "";

    dataList.forEach(item => {
        let date = item.dt_txt.split(" ")[0];
        if (date !== currentDate) {
            currentDate = date;
            daysData.push({
                date: new Date(date).toLocaleDateString(),
                temp: item.main.temp,
                weather: item.weather[0].description
            });
        }
    });

    return daysData.slice(0, 5); // Ensure only 5 days are returned
}

// Function to display 5-day forecast data
function display5DayForecast(daysData) {
    let forecastContainer = document.getElementById("forecast-container");
    forecastContainer.innerHTML = "";

    daysData.forEach(dayData => {
        let forecastDiv = document.createElement("div");
        forecastDiv.className = "forecast-day";
        forecastDiv.innerHTML = `
            <h3>${dayData.date}</h3>
            <p>Temp: ${temperatureToCelcius(dayData.temp)}</p>
            <p>Weather: ${dayData.weather}</p>
        `;
        forecastContainer.appendChild(forecastDiv);
    });
}
// Function to display current wind speed
function displayWindSpeed(speed, elementId) {
    let windElement = document.getElementById(elementId);
    if (windElement) {
        windElement.textContent = `Wind Speed: ${speed.toFixed(1)} m/s`;
    } else {
        console.error(`Element with id ${elementId} not found`);
    }
}