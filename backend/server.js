const express = require('express');
const path = require('path');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const USER_AGENT = process.env.NWS_USER_AGENT || 'binkr-weather';

const DEFAULT_LOCATION = {
  city: 'Dallas',
  state: 'Texas',
  lat: 32.7767,
  lon: -96.7970
};

const LOCATION_LOOKUP = {
  'dallas,texas': DEFAULT_LOCATION,
  'dallas,tx': DEFAULT_LOCATION,
  'dallas': DEFAULT_LOCATION
};

async function geocodeLocation(city, state) {
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept-Language': 'en'
      },
      params: {
        format: 'jsonv2',
        city,
        state,
        countrycodes: 'us',
        limit: 3
      }
    });

    const [result] = response.data || [];

    if (!result) {
      return null;
    }

    return {
      lat: Number(result.lat),
      lon: Number(result.lon),
      address: result.address || {}
    };
  } catch (error) {
    console.warn('Geocoding failed for requested location:', error.message);
    return null;
  }
}

function getRequestHeaders() {
  return {
    'User-Agent': USER_AGENT,
    Accept: 'application/geo+json'
  };
}

async function resolveLocation(query = {}, geocodeFn = geocodeLocation) {
  const city = (query.city || DEFAULT_LOCATION.city).trim();
  const state = (query.state || DEFAULT_LOCATION.state).trim();
  const key = `${city.toLowerCase()},${state.toLowerCase()}`;

  if (LOCATION_LOOKUP[key]) {
    return LOCATION_LOOKUP[key];
  }

  const geocoded = await geocodeFn(city, state);

  if (!geocoded) {
    throw new Error(`We couldn't find weather data for "${city}, ${state}". Please check the spelling or try a different city/state combination.`);
  }

  const matchedCity = (geocoded.address?.city || geocoded.address?.town || geocoded.address?.village || '').toString().toLowerCase();
  const matchedState = (geocoded.address?.state || geocoded.address?.state_code || '').toString().toLowerCase();
  const requestedCity = city.toLowerCase();
  const requestedState = state.toLowerCase();

  const cityMatches = matchedCity && matchedCity.includes(requestedCity);
  const stateMatches = matchedState && (matchedState === requestedState || matchedState.includes(requestedState));

  if (!cityMatches || !stateMatches) {
    throw new Error(`The city and state do not appear to match. Please use a valid city/state combination.`);
  }

  return {
    lat: geocoded.lat,
    lon: geocoded.lon,
    city,
    state
  };
}

async function getWeatherPoint(location) {
  const response = await axios.get(`https://api.weather.gov/points/${location.lat},${location.lon}`, {
    headers: getRequestHeaders()
  });

  return response.data;
}

async function getCurrentConditions(pointProperties) {
  const stationCollectionUrl = pointProperties.observationStations;

  if (!stationCollectionUrl) {
    return null;
  }

  const stationsResponse = await axios.get(stationCollectionUrl, {
    headers: getRequestHeaders()
  });

  const stationId = stationsResponse.data.features?.[0]?.id?.split('/').pop();

  if (!stationId) {
    return null;
  }

  const response = await axios.get(`https://api.weather.gov/stations/${stationId}/observations/latest`, {
    headers: getRequestHeaders()
  });

  const props = response.data.properties || {};

  return {
    station: stationId,
    timestamp: props.timestamp,
    temperature: props.temperature?.value,
    temperatureUnit: props.temperature?.unit,
    windSpeed: props.windSpeed?.value,
    windDirection: props.windDirection?.value,
    relativeHumidity: props.relativeHumidity?.value,
    weather: props.textDescription
  };
}

async function getHourlyForecast(pointProperties) {
  const forecastUrl = pointProperties.forecastHourly;

  if (!forecastUrl) {
    return [];
  }

  const response = await axios.get(forecastUrl, {
    headers: getRequestHeaders()
  });

  return (response.data.properties?.periods || []).slice(0, 10).map((period) => ({
    startTime: period.startTime,
    endTime: period.endTime,
    temperature: period.temperature,
    temperatureUnit: period.temperatureUnit,
    shortForecast: period.shortForecast,
    windSpeed: period.windSpeed,
    windDirection: period.windDirection
  }));
}

// link to the frontend
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/api/message', (req, res) => {
  res.json({ message: 'Hello from the backend! :) ' });
});

app.get('/api/weather', async (req, res) => {
  try {
    const location = await resolveLocation(req.query);
    const point = await getWeatherPoint(location);
    const [current, forecast] = await Promise.all([
      getCurrentConditions(point.properties),
      getHourlyForecast(point.properties)
    ]);

    res.json({
      city: location.city,
      state: location.state,
      location: {
        lat: location.lat,
        lon: location.lon
      },
      current,
      forecast
    });
  } catch (error) {
    console.error('Unable to fetch weather data', error.message);
    const statusCode = error.message.includes('couldn\'t find weather data') || error.message.includes('city and state do not appear to match')
      ? 400
      : 500;
    res.status(statusCode).json({ error: error.message || 'Unable to fetch weather data from the National Weather Service.' });
  }
});

app.get('/api/weather/current', async (req, res) => {
  try {
    const location = await resolveLocation(req.query);
    const point = await getWeatherPoint(location);
    const current = await getCurrentConditions(point.properties);

    res.json({
      city: location.city,
      state: location.state,
      location: {
        lat: location.lat,
        lon: location.lon
      },
      current
    });
  } catch (error) {
    console.error('Unable to fetch current weather', error.message);
    const statusCode = error.message.includes('couldn\'t find weather data') || error.message.includes('city and state do not appear to match')
      ? 400
      : 500;
    res.status(statusCode).json({ error: error.message || 'Unable to fetch current weather data.' });
  }
});

app.get('/api/weather/forecast', async (req, res) => {
  try {
    const location = await resolveLocation(req.query);
    const point = await getWeatherPoint(location);
    const forecast = await getHourlyForecast(point.properties);

    res.json({
      city: location.city,
      state: location.state,
      location: {
        lat: location.lat,
        lon: location.lon
      },
      forecast
    });
  } catch (error) {
    console.error('Unable to fetch forecast', error.message);
    const statusCode = error.message.includes('couldn\'t find weather data') || error.message.includes('city and state do not appear to match')
      ? 400
      : 500;
    res.status(statusCode).json({ error: error.message || 'Unable to fetch forecast data.' });
  }
});

if (require.main === module) {
  app.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
  });
}

module.exports = {
  app,
  resolveLocation
};
