// setting up the variables 
const buttonElement = document.getElementById("submit-button");
const imageContainer = document.querySelector('img');

const weatherAPIURL = "https://api.openweathermap.org/data/2.5/";
const weatherAPIKeyAN = "1b13b5ea93422ad65979d64bde392e76"; // Personal API key; AN

const googleAPIURL = "https://www.googleapis.com/customsearch/v1?";
const googleAPIKeyAN = "AIzaSyBClw4J_kiRJtoks3My-7A34NaVk9ZpjII"; // Personal API key; AN
const googlePSEID = "c12965ece746243b4"; // Programmable Search Engine; request access here: https://programmablesearchengine.google.com/controlpanel/overview?cx=c12965ece746243b4

let searchHistory = JSON.parse(localStorage.getItem("searchHistory")); // Get searchHistory from localStorage and parse it into an Array object.
if (!searchHistory) { // If searchHistory did not exist in localStorage, set it to an empty Array object. null => []
    searchHistory = [];
}
console.log(searchHistory)

// when a user clicks on the Enter button, 
// the text will not disappear and it will render the dashboard results
buttonElement.addEventListener('click', function(event) {
    event.preventDefault();
    const searchQuery = document.getElementById("search-box").value;

    searchHistory.push(searchQuery); // Add query to searchHistory
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory)); // Update searchHistory in localStorage

    renderDashboardResults(searchQuery);
    });


function renderDashboardResults(searchQuery) {
    // location-details-container div
    // Declare h2 and p elements here and give them content from the API calls.
    let locationName = document.getElementById("location-name");
    let locationDesc = document.getElementById("location-desc");
    let locationImage = document.getElementById("location-image");

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
        })
        .catch(error => {
            console.log(error); // prints the error in the console
        });
    
    
    // API fetch request | "api.openweathermap.org/data/2.5/forecast?q={city name}&appid={API key}"
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
            // Manage data here
        })
        .catch(error => {
            console.log(error);
        });

    // API fetch request | "https://www.googleapis.com/customsearch/v1?key={API key}&cx={PSE ID}&q={city name}&searchType=image&num=1"
    // This is for a Google SafeSearch.
    let fetchURLGoogleDesc = googleAPIURL.concat("key=", googleAPIKeyAN, "&cx=", googlePSEID, "&q=", searchQuery, "&num=1")
    fetch(fetchURLGoogleDesc)
        .then(response => {
            if (!response.ok) {
                throw new Error("API response was not okay. (Google query)");
            }
            return response.json();
        })
        .then(data => {
            console.log(data); // SEE: data format.
            locationDesc.innerHTML = data.items[0].htmlSnippet.concat("<a href=", data.items[0].formattedUrl, ">Read More.</a><br>Result retrieved from ", data.items[0].displayLink)/* City info from API */;
        })
        .catch(error => {
            console.log(error);
        });

    // API fetch request | "https://www.googleapis.com/customsearch/v1?key={API key}&cx={PSE ID}&q={city name}&searchType=image&num=1"
    // This is for a Google Images SafeSearch.
    let fetchURLGoogleImage = googleAPIURL.concat("key=", googleAPIKeyAN, "&cx=", googlePSEID, "&q=", searchQuery, "&searchType=image&num=1")
    fetch(fetchURLGoogleImage)
        .then(response => {
            if (!response.ok) {
                throw new Error("API response was not okay. (Google images query)");
            }
            return response.json();
        })
        .then(data => {
            console.log(data); // SEE: data format.
            locationImage.src = data.items[0].link
        })
        .catch(error => {
            console.log(error);
        });

        // API Call to get location details
   

    // location-weather div
    // Create h2 and div elements here and give them content from the API calls.
    let todaysWeatherForecast = document.createElement('h2');
    todaysWeatherForecast.classList.add("example3") // Add CSS classes here
    todaysWeatherForecast.textContent = "example3"/* Current weather from API */

    // TODO: Implement 5-day forecast.

    const locationWeather = document.createElement('div')
        .appendChild(todaysWeatherForecast);
        // API Call to get weather details
    
};