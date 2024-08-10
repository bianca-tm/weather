const express = require('express');
const path = require('path');
const app = express();
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

// what port localhost will be going to
const PORT = 3000;

// link to the frontend
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/api/message', (req, res) => {
    res.json({ message: 'Hello from the backend!' });
});

app.get('/api/weather', async (req, res) => {
    const city = req.query.city || 'Dallas';
    const apiKey = process.env.WEATHERSTACK_API_KEY;
  
    try {
      const response = await axios.get(`http://api.weatherstack.com/current`, {
        params: {
          access_key: apiKey,
          query: city
        }
      });

      const data = response.data;
      
      res.json({
        city: data.location.name,
        country: data.location.country,
        temperature: data.current.temperature,
        weatherDescription: data.current.weather_descriptions[0]
      });
    } catch (error) {
      res.status(500).json({ error: 'Unable to fetch weather data' });
    }
  });

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
