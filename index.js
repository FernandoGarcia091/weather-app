const container = document.querySelector('.container');
const weatherBox = document.querySelector('.weather-box');
const weatherDetails = document.querySelector('.weather-details');
const error404 = document.querySelector('.not-found');

const form = document.querySelector('#searchForm');
const input = document.querySelector('#locationInput');

const APIKey = '17e91745620808fa3ef31249eb7b1c8f';

// --- Clear when clicking away ---
// Small delay so clicking the search button still works
input.addEventListener('blur', () => {
  setTimeout(() => {
    input.value = '';
  }, 200);
});

// Optional: press Escape to clear 
input.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') input.value = '';
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const query = input.value.trim();
  if (!query) return;

  try {
    // 1) Geocode the query -> get lat/lon
    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=1&appid=${APIKey}`;
    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();

    if (!Array.isArray(geoData) || geoData.length === 0) {
      showError();
      return;
    }

    const { lat, lon, name, state, country } = geoData[0];

    // 2) Weather by lat/lon (more accurate than q=)
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${APIKey}`;
    const weatherRes = await fetch(weatherUrl);
    const json = await weatherRes.json();

    if (!json || (json.cod && Number(json.cod) !== 200)) {
      showError();
      return;
    }

    renderWeather(json, { name, state, country });

  } catch (err) {
    showError();
  }
});

function showError() {
  container.style.height = '400px';
  weatherBox.style.display = 'none';
  weatherDetails.style.display = 'none';

  error404.style.display = 'block';
  error404.classList.remove('fadeIn'); // reset animation
  void error404.offsetWidth;          // reflow to restart animation
  error404.classList.add('fadeIn');
}

function renderWeather(json, place) {
  error404.style.display = 'none';
  error404.classList.remove('fadeIn');

  const image = document.querySelector('.weather-box img');
  const temperature = document.querySelector('.weather-box .temperature');
  const description = document.querySelector('.weather-box .description');
  const humidity = document.querySelector('.weather-details .humidity span');
  const wind = document.querySelector('.weather-details .wind span');

  const main = json.weather?.[0]?.main || '';
  const desc = json.weather?.[0]?.description || '';

  switch (main) {
    case 'Clear':  image.src = 'images/clear.png'; break;
    case 'Rain':   image.src = 'images/rain.png'; break;
    case 'Snow':   image.src = 'images/snow.png'; break;
    case 'Clouds': image.src = 'images/cloud.png'; break;
    case 'Haze':
    case 'Mist':   image.src = 'images/mist.png'; break;
    default:       image.src = '';
  }

  temperature.innerHTML = `${Math.round(json.main.temp)}<span>°F</span>`;
  description.innerHTML = desc;

  humidity.innerHTML = `${json.main.humidity}%`;
  wind.innerHTML = `${Math.round(json.wind.speed)} mph`;

  weatherBox.style.display = '';
  weatherDetails.style.display = '';
  weatherBox.classList.add('fadeIn');
  weatherDetails.classList.add('fadeIn');
  container.style.height = '590px';

  // Show matched location
  const pretty = `${place.name}${place.state ? ', ' + place.state : ''}, ${place.country}`;
  input.value = pretty;
}