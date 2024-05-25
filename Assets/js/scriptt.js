// this is the search history array + the api key to access the api where we will draw info from.
const searchHistory = [];
const weatherApiRootUrl = 'https://api.openweathermap.org';
const weatherApiKey= '60705b5c42f40060d9fe997927c6a2a2';

// id grabbers to perform certain tasks
const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('#search-input');
const todayContainer = document.querySelector('#today');
const forecastContainer = document.querySelector('#forecast');
const searchHistoryContainer = document.querySelector('#history');

// these are important for the timezones of locations to be reconigzed
dayjs.extend(window.dayjs_plugin_utc);
dayjs.extend(window.dayjs_plugin_timezone);

// in theory this should print all recent searches to the screen
function renderSearchHistory (){
    searchHistoryContainer.innerHTML = '';
//  this should make them buttons to re-search them Without typing!
    for (let i = searchHistory.length - 1; i >= 0; i--){
        const btn = document.createElement('button');
        btn.setAttribute('type', 'button');
        btn.setAttribute('aria-controls', 'today forecast');
        btn.classList.add('history-btn', 'btn-history');
        btn.setAttribute('data-search', searchHistory[i]);
        btn.textContent = searchHistory[i];
        searchHistoryContainer.append(btn);
    }
}
 // if "Search" is empty it doesnt exceute it just returns the function
function appendToHistory(search) {
    if (searchHistory.indexOf(search) !== -1) {
        return;
    } // the following turns the search input into a string
    searchHistory.push(search);
    localStorage.setItem('search-history', JSON.stringify(searchHistory));
    renderSearchHistory();
}


function initSearchHistory(){
    const storedHistory = localStorage.getItem('search-history');
    if (storedHistory) {
        const parsedHistory = JSON.parse(storedHistory);
        searchHistory.length = 0;
        parsedHistory.forEach(item => {
            searchHistory.push(item);
        });
    }
 renderSearchHistory();
}

// the following function should display the data in cards if it works! (5 for 5 days)
function renderCurrentWeather(city, weather) {
    const date = dayjs().format('M/D/YYYY');
const tempF = weather.main.temp;
const windMph = weather.wind.speed;
const humidity = weather.main.humidity;
const iconUrl = `https://openweathermap.org/img/w/${weather.weather[0].icon}.png`;
const iconDescription = weather.weather[0].description || weather[0].main;

const card = document.createElement('div');
const cardBody = document.createElement('div');
const heading = document.createElement('h2');
const weatherIcon = document.createElement('img');
const tempEl = document.createElement('p');
const windEl = document.createElement('p');
const humidityEl = document.createElement('p');

card.setAttribute('class', 'card');
cardBody.setAttribute('class', 'card-body');
card.append(cardBody);

heading.setAttribute('class', 'h3 card-title');
tempEl.setAttribute('class', 'card-text');
windEl.setAttribute('class', 'card-text');
humidityEl.setAttribute('class', 'card-text');

heading.textContent = `${city} (${date})`;
weatherIcon.setAttribute('src', iconUrl);
weatherIcon.setAttribute('alt', iconDescription);
weatherIcon.setAttribute('class', 'weather-img');
heading.append(weatherIcon);
// dear RASHAWN remember to google the "degrees" circle to insert below
tempEl.textContent = `Temp: ${tempF}°F`;
windEl.textContent = `Wind: ${windMph} MPH`;
humidityEl.textContent = `Humidity: ${humidity}`
cardBody.append(heading, tempEl, windEl, humidityEl)

todayContainer.innerHTML = '';
todayContainer.append(card);
//  the above should append each element to each of the 5 cards and below is creating their space 
}

function renderForecastCard(forecast) {
        // variables for data from api
        const iconUrl = `https://openweathermap.org/img/w/${forecast.weather[0].icon}.png`;
        const iconDescription = forecast.weather[0].description;
        const tempF = forecast.main.temp;
        const humidity = forecast.main.humidity;
        const windMph = forecast.wind.speed;
      

const col = document.createElement('div');
const card = document.createElement('div');
const cardbody = document.createElement('div');
const cardTitle = document.createElement('h5');
const weatherIcon = document.createElement('img');
const tempEl = document.createElement('p');
const windEl = document.createElement('p');
const humidityEl = document.createElement('p');

col.append(card);
card.append(cardbody);
cardbody.append(cardTitle, weatherIcon, tempEl, windEl, humidityEl);
// elements above. stylized below
col.setAttribute('class', 'col-md');
col.classList.add('five-day-card');
card.setAttribute('class', 'card bg primary h-100 text white');
cardbody.setAttribute('class', 'card-body p-2');
cardTitle.setAttribute('class', 'card-title');
tempEl.setAttribute('class', 'card-text');
windEl.setAttribute('class', 'card-text');
humidityEl.setAttribute('class', 'card-text');

// now right below will be the actual data
cardTitle.textContent = dayjs(forecast.dt_txt).format('M/D/YYYY');
weatherIcon.setAttribute('src', iconUrl);
weatherIcon.setAttribute('alt', iconDescription);
tempEl.textContent = `Temp: ${tempF} °F`;
windEl.textContent = `Wind: ${windMph} MPH`;
humidityEl.textContent = `Humidity: ${humidity} %`;

forecastContainer.append(col);
}



function renderForecast(dailyForecast) {
    const startDt = dayjs().add(1, 'day').startOf('day').unix();
    const endDt = dayjs().add(6, 'day').startOf('day').unix();

    const headingCol = document.createElement('div');
    const heading = document.createElement('h4');

    headingCol.setAttribute('class', 'col-12');
    heading.textContent = '5-Day Forecast';
    headingCol.append(heading);

    forecastContainer.innerHTML = '';
    forecastContainer.append(headingCol);
// console.log("rashawn this was successfully appended finally.");
    for (let i = 0; i < dailyForecast.length; i++) {
        // First filters through all of the data and returns only data that falls between one day after the current data and up to 5 days later.
        if (dailyForecast[i].dt >= startDt && dailyForecast[i].dt < endDt) {
          // Then filters through the data and returns only data captured at noon for each day.
          if (dailyForecast[i].dt_txt.slice(11, 13) == '12') {
            renderForecastCard(dailyForecast[i]);
          }
        }
      }
    }

//this next part is gonna render the correct weather to match city and date (Accuracy)
function renderItems (city,data) {
    renderCurrentWeather(city, data.list[0], data.city.timezone);
    renderForecast(data.list);
}

function fetchWeather(location) {
    const { lat } = location;
    const { lon } = location;
    const city = location.name;
  
    const apiUrl = `${weatherApiRootUrl}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${weatherApiKey}`;
  
    fetch(apiUrl)
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        renderItems(city, data);
      })
      .catch(function (err) {
        console.error(err);
      });
  }
  
//   hopefully this fixes and defines FETCHCOORDS
  function fetchCoords(search) {
    const apiUrl = `${weatherApiRootUrl}/geo/1.0/direct?q=${search}&limit=5&appid=${weatherApiKey}`;
  
    fetch(apiUrl)
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        if (!data[0]) {
          alert('Location not found');
        } else {
          appendToHistory(search);
          fetchWeather(data[0]);
        }
      })
      .catch(function (err) {
        console.error(err);
      });
  }


function handleSearchFormSubmit(e) {
    // telling the function don't continue if there is nothing in the search form
    if (!searchInput.value) {
      return;
    }
  // this makes it so it actually searches. with out "preventdefault" it'd just clear when you hit "submit/search" and not show any results. now it'll read 24/7
    e.preventDefault();
    const search = searchInput.value.trim();
    fetchCoords(search);
    searchInput.value = '';
    // console.log("fetchcoords are working!!");
  }
//    fetchcoords why are you undefined?

  function handleSearchHistoryClick(e) {
    // Don't do search if current elements is not a search history button
    if (!e.target.matches('.btn-history')) {
      return;
    }
  
    const btn = e.target;
    const search = btn.getAttribute('data-search');
    fetchCoords(search);
  }

  
  // this is just calling functions/setting up the eventlisteners to know when someone submits / make sure it can handle displaying the search history
  initSearchHistory();
  searchForm.addEventListener('submit', handleSearchFormSubmit);
    console.log("How's the weather?");
    searchHistoryContainer.addEventListener('click', handleSearchHistoryClick);
  initSearchHistory();
