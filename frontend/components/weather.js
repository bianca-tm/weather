import { LitElement, html, css } from 'lit';

class Weather extends LitElement {
  static properties = {
    city: { type: String },
    temperature: { type: Number },
    weatherDescription: { type: String }
};

  constructor() {
    super();
    this.city = 'Dallas';
    this.temperature = null;
    this.weatherDescription = '';
  }

  connectedCallback() {
    super.connectedCallback();
    this.fetchWeather();
    fetch('/api/message')
      .then((response) => response.json())
      .then((data) => {
        this.message = data.message;
      });
  }

  async fetchWeather() {
    console.log('Fetching weather data...');
    const response = await fetch(`/api/weather?city=${this.city}`);
    const data = await response.json();
    console.log('Data received:', data); // Log the received data
    this.temperature = data.temperature;
    this.weatherDescription = data.weatherDescription;
  }

  render() {
    return html`
    <div>
      <h1>Weather in ${this.city}</h1>
      <p>Temperature: ${this.temperature}°C</p>
      <p>Condition: ${this.weatherDescription}</p>
    </div>
  `;
  }
}

customElements.define('weather', Weather);
