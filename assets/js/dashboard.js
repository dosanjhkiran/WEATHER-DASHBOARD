// setting up the variables 
const buttonElement = document.querySelector('button');
const imageContainer = document.querySelector('img');


// when a user clicks on the Enter button, 
// the text will not disappear and it will render the dashboard results
buttonElement.addEventListener('click', function(event) {
    event.preventDefault();
    renderDashboardResults();
    })


function renderDashboardResults() {
    // location-details div
    const locationDetails = document.getElementById('location-details-container');
    let enteredLocation = document.createElement('h2'); // how to nest this under?
    let enteredLocationDescription = document.createElement('p'); // how to nest this under?
   
    // location-weather div
    const locationWeather = document.createElement('div');
    let todaysWeatherForecast = document.createElement('h2'); // how to nest this under?
    let dayOne = document.createElement('div');
};