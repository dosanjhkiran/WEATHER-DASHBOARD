const submitButton = document.getElementById('submit-button');
const imageContainer = document.querySelector('img');
const welcomeModal = document.getElementById('welcome-modal');
const dashboardResults = document.getElementById('dashboard-results');
const recentSearches = document.getElementById('recent-searches');
const fiveDayForecast = document.getElementById('5-day-forecast');

const weatherAPIURL = 'https://api.openweathermap.org/data/2.5/';
const weatherAPIKeyAN = '1b13b5ea93422ad65979d64bde392e76'; // Personal API key; AN
const googleAPIURL = 'https://www.googleapis.com/customsearch/v1?';
const googleAPIKeyAN = 'AIzaSyBClw4J_kiRJtoks3My-7A34NaVk9ZpjII'; // Personal API key; AN1
const googleAPIKeyANalt = 'AIzaSyA0xwtby0Icq8e1kNEfnWWpIu2gjl4RGR4'; // Personal API key; AN2 | Does not work right now.
const googlePSEID = 'c12965ece746243b4'; // Programmable Search Engine

// Toggle API Key
const useAlternateAPIKey = false; // DO NOT USE.

let searchHistory = JSON.parse(localStorage.getItem('searchHistory')); // Get searchHistory from localStorage and parse it into an Array object.
if (!searchHistory || searchHistory.length === 0) { // If searchHistory did not exist in localStorage, set it to an empty Array object. null => []
    welcomeModal.showModal();
    searchHistory = [];
}
localStorage.setItem('searchHistory', JSON.stringify(searchHistory));

renderSearchHistory();

// when a user clicks on the Enter button, 
// the text will not disappear and it will render the dashboard results
submitButton.addEventListener('click', function(event) {
    event.preventDefault();

    let searchHistory = JSON.parse(localStorage.getItem('searchHistory'));

    let searchQuery = document.getElementById('search-box');
    if (!searchQuery.value) { // Check if user entered anything
        searchQuery.placeholder = 'Please enter valid search!';
        return;
    }
    searchQuery.placeholder = 'Suburb and/or City, XX';

    searchQuery = searchQuery.value.split(',') // Split the user input and trim whitespaces

    for (parameter in searchQuery) {
        searchQuery[parameter] = searchQuery[parameter].trim();
    }
    
    let duplicateQuery = false;
    if (searchHistory && searchHistory.length !== 0) { // If theres a search history
        for (queryIndex in searchHistory) { // Check if query already exists
            if (searchQuery.toString() == searchHistory[queryIndex].toString()) {
                duplicateQuery = true;
                searchHistory.splice(queryIndex, 1); // Remove current occurence
                searchHistory.push(searchQuery); // Move to front of searchHistory
            }
        }
    }
    if (!duplicateQuery) {
        searchHistory.push(searchQuery);
    }

    if (searchHistory.length > 5) {
        searchHistory.shift();
    }
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory)); // Update searchHistory in localStorage

    searchQuery = searchQuery.join(',')
    renderDashboardResults(searchQuery);
    renderSearchHistory();
});

function temperatureToCelcius(degreesKelvin) {
    return (degreesKelvin - 273.15).toFixed(1).concat('°C');
}

function renderDashboardResults(searchQuery) {
    // location-weather div
    // Declare h2 and div elements here and give them content from the API calls.
    let timeNow = document.getElementById('time-now');
    let weatherNow = document.getElementById('weather-now');
    let weatherLow = document.getElementById('weather-low');
    let weatherHigh = document.getElementById('weather-high');
    let windSpeed = document.getElementById('wind-speed');

    // location-details-container div
    // Declare h2 and p elements here and give them content from the API calls.
    let locationName = document.getElementById('location-name');
    let locationDesc = document.getElementById('location-desc');
    let locationImage = document.getElementById('location-image');

    // API Call to get weather details
    // API fetch request | 'https://api.openweathermap.org/data/2.5/weather?q={city name}&appid={API key}'
    // This is for a single-day query.
    let fetchURLSingleDay = weatherAPIURL.concat('weather?q=', searchQuery, '&appid=', weatherAPIKeyAN);
    fetch(fetchURLSingleDay)
        .then(response => {
            if (!response.ok) {
                throw new Error('API response was not okay. (Single day query)');
            }
            return response.json();
        })
        .then(data => {
            locationName.textContent = data.name.concat(', ', data.sys.country); /* City name from API */
            timeNow.textContent = retrieveDayTimeForDisplay(data.dt, data.timezone);
            weatherNow.textContent = 'Now: ' + temperatureToCelcius(data.main.temp);
            formatIndicator(document.getElementById('weather-now-indicator'), data.weather[0].description, data.weather[0].icon);
            weatherLow.textContent = 'Low: ' + temperatureToCelcius(data.main.temp_min);
            weatherHigh.textContent = 'High: ' + temperatureToCelcius(data.main.temp_max);
            windSpeed.textContent = `Wind Speed: ${data.wind.speed.toFixed(1)} m/s`;
        })
        .catch(error => {
            console.log(error); // prints the error in the console
        });
    
    // API fetch request | 'https://api.openweathermap.org/data/2.5/forecast?q={city name}&appid={API key}'
    // This is for a 5-day query.
    let fetchURL5Day = weatherAPIURL.concat('forecast?q=', searchQuery, '&appid=', weatherAPIKeyAN);
    fetch(fetchURL5Day)
        .then(response => {
            if (!response.ok) {
                throw new Error('API response was not okay. (Multi day query)');
            }
            return response.json();
        })
        .then(data => {
            render5DayForecast(data);
        })
        .catch(error => {
            console.log(error);
        });

    // API Calls to get location details
    // API fetch request | 'https://www.googleapis.com/customsearch/v1?key={API key}&cx={PSE ID}&q={city name}&searchType=image&num=1'
    // This is for a Google SafeSearch.
    let keyUsed;
    if (useAlternateAPIKey) {
        keyUsed = googleAPIKeyANalt;
    } else {
        keyUsed = googleAPIKeyAN;
    };
    fetch(googleAPIURL.concat('key=', keyUsed, '&cx=', googlePSEID, '&q=', searchQuery, '&num=1'))
        .then(response => {
            if (!response.ok) {
                if (response.status = 429) { // Check if the API has exceeded capacity
                    locationDesc.innerHTML = '<p>The API is limited to 100 searches per day on the free license. Please use your own API Key to reset this limit.</p>'; // Placeholder if API is not cooperative.
                }
                throw new Error('API response was not okay. (Google query)');
            }
            return response.json();
        })
        .then(data => {
            locationDesc.innerHTML = data.items[0].htmlSnippet.concat(' <a href=', data.items[0].formattedUrl, '>Read More</a><br>Result retrieved from ', data.items[0].displayLink);/* City info from API */;
        })
        .catch(error => {
            console.log('Error:', error); // prints the error in the console
        });

    // API fetch request | 'https://www.googleapis.com/customsearch/v1?key={API key}&cx={PSE ID}&q={city name}&searchType=image&num=1'
    // This is for a Google Images SafeSearch.
    fetch(googleAPIURL.concat('key=', keyUsed, '&cx=', googlePSEID, '&q=', searchQuery, '&searchType=image&num=1'))
        .then(response => {
            if (!response.ok) {
                if (response.status = 429) { // Check if the API has exceeded capacity
                    locationImage.src = 'https://dummyimage.com/600x400/eaeaea/1d1d1f'; // Placeholder if API is not cooperative.
                }
                throw new Error('API response was not okay. (Google images query)');
            }
            return response.json();
        })
        .then(data => {
            locationImage.src = data.items[0].link;
        })
        .catch(error => {
            console.log('Error:', error); // prints the error in the console
        });

        dashboardResults.classList.remove('hidden');
}

function renderSearchHistory() {
    recentSearches.innerHTML = ''; // Clear any current items
    let searchHistory = JSON.parse(localStorage.getItem('searchHistory')); // Get searchHistory from localStorage and parse it into an Array object.
    if (!searchHistory || searchHistory.length === 0) { // If searchHistory is empty, leave the function.
        return;
    };
    recentSearches.classList.remove('hidden');
    for (recentSearch of searchHistory) {
        let menuItem = document.createElement('li');
        menuItem.textContent = recentSearch.join(', ');
        menuItem.classList.add('m-1', 'text-lg', 'w-full', 'bg-white', 'btn', 'btn-wide', 'btn-very_dark_grey', 'btn-outline');
        menuItem.addEventListener('click', function(event) {
            let searchQuery = document.getElementById('search-box');
            searchQuery.value = event.target.textContent;
            submitButton.click();
        });
        recentSearches.insertBefore(menuItem, recentSearches.firstChild); // Inserts 'backwards' to maintain correct order logic.
    }

}

function formatIndicator(indicatorElement, weatherCondition, iconCode) {
    indicatorElement.innerHTML = '<p>' + weatherCondition + '</p>' + retrieveIcon(iconCode).outerHTML;
}

function retrieveIcon(iconCode) { // Format: https://openweathermap.org/img/wn/{icon code}@2x.png
    openWeatherIconURL = 'https://openweathermap.org/img/wn/';
    let iconElement = document.createElement('img');
    iconElement.classList.add('w-auto', 'h-full')
    iconElement.src = openWeatherIconURL.concat(iconCode, '@2x.png');
    return iconElement;
}

function retrieveDayTimeForDisplay(unixTime, timezoneDisplacement) {
    return dayjs.unix(unixTime + timezoneDisplacement - 36000).format('DD/MM, h:mma'); // This function finds the local time given the timezone displacement.
}

function render5DayForecast(data) {
    fiveDayForecast.innerHTML = ''; // Erase previous.
    for (let index = 0; index < data.list.length; index += 4) { // 12-hour intervals | 12/3 = 4
        if (index%4 === 0) {
            if (index%8 === 0) {
                let indicatorDivPair = document.createElement('div');
                indicatorDivPair.classList.add('w-full', 'flex', 'flex-wrap', 'flex-col', 'text-center', 'justify-around', 'items-center');
                indicatorDivPair.id = 'day-' + (Math.floor(index/8)+1);
                fiveDayForecast.appendChild(indicatorDivPair);
            }
            let indicatorDiv = document.createElement('div');
            indicatorDiv.classList.add('indicator', 'p-2');
            let indicator = document.createElement('span');
            indicator.classList.add('indicator-item', 'badge', 'text-off_white', 'bg-light_grey', 'border-1', 'border-dark_grey');
            let divContent = document.createElement('p');
            divContent.classList.add('text-xl', 'font-bold', 'text-very_dark_grey');
            indicatorDiv.appendChild(indicator);
            indicatorDiv.appendChild(divContent);
            indicator.id = '5-day-indicator-' + (Math.floor(index/4)+1);
            formatIndicator(indicator, data.list[index].weather[0].description, data.list[index].weather[0].icon);
            divContent.textContent = retrieveDayTimeForDisplay(data.list[index].dt, 0) + ': ' + temperatureToCelcius(data.list[index].main.temp);
            let indicatorDivPair = document.getElementById('day-' + (Math.floor(index/8)+1));
            indicatorDivPair.appendChild(indicatorDiv);
        }
    }
}

// Function to extract 5-day forecast data (legacy|for-reference)
// function get5DayForecast(dataList) {
//     let daysData = [];
//     let currentDate = '';

//     dataList.forEach(item => {
//         let date = item.dt_txt.split(' ')[0];
//         if (date !== currentDate) {
//             currentDate = date;
//             daysData.push({
//                 date: new Date(date).toLocaleDateString(),
//                 temp: item.main.temp,
//                 weather: item.weather[0].description
//             });
//         }
//     });

//     return daysData.slice(0, 5); // Ensure only 5 days are returned
// }

// Function to display 5-day forecast data (legacy|for-reference)
// function display5DayForecast(daysData) {
//     let forecastContainer = document.getElementById('forecast-container');
//     forecastContainer.innerHTML = '';

//     daysData.forEach(dayData => {
//         let forecastDiv = document.createElement('div');
//         forecastDiv.className = 'forecast-day';
//         forecastDiv.innerHTML = `
//             <h3>${dayData.date}</h3>
//             <p>Temp: ${temperatureToCelcius(dayData.temp)}</p>
//             <p>Weather: ${dayData.weather}</p>
//         `;
//         forecastContainer.appendChild(forecastDiv);
//     });
// }