class Weather extends HTMLElement {
  constructor() {
    super();
    this.city = 'Dallas';
    this.state = 'Texas';
    this.cityInput = 'Dallas';
    this.stateInput = 'Texas';
    this.currentWeather = {};
    this.forecast = [];
    this.activeTab = 'current';
    this.loading = false;
    this.error = '';
    this.theme = localStorage.getItem('weather-theme') || 'light';
    this.submitLockedUntil = 0;
  }

  connectedCallback() {
    this.render();
    this.fetchWeather();
  }

  validateLocationInput(city, state) {
    const normalizedCity = city.trim().toLowerCase();
    const normalizedState = state.trim().toLowerCase();

    if (!normalizedCity || !normalizedState) {
      return 'Please enter both a city and a state.';
    }

    if (normalizedCity.length < 2 || normalizedState.length < 2) {
      return 'Please enter a valid city and state.';
    }

    return '';
  }

  showErrorPopup(message) {
    this.error = message;
    this.render();
    const popup = this.querySelector('.popup');
    if (popup) {
      popup.classList.add('show');
      setTimeout(() => popup.classList.remove('show'), 2600);
    }
  }

  async fetchWeather() {
    const now = Date.now();
    if (now < this.submitLockedUntil) {
      this.showErrorPopup('Please wait a moment before requesting weather again.');
      return;
    }

    const city = this.cityInput.trim() || this.city;
    const state = this.stateInput.trim() || this.state;
    const validationError = this.validateLocationInput(city, state);

    if (validationError) {
      this.currentWeather = {};
      this.forecast = [];
      this.showErrorPopup(validationError);
      return;
    }

    this.loading = true;
    this.error = '';
    this.submitLockedUntil = now + 3000;
    this.render();

    try {
      const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to fetch weather.');
      }

      this.city = data.city || city;
      this.state = data.state || state;
      this.cityInput = this.city;
      this.stateInput = this.state;
      this.currentWeather = data.current || {};
      this.forecast = data.forecast || [];
    } catch (error) {
      this.currentWeather = {};
      this.forecast = [];
      this.error = error.message || 'Unable to load weather right now.';
      this.showErrorPopup(this.error);
      this.activeTab = 'current';
    } finally {
      this.loading = false;
      this.render();
    }
  }

  handleSubmit(event) {
    event.preventDefault();
    this.fetchWeather();
  }

  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('weather-theme', this.theme);
    this.render();
  }

  formatHumidity(value) {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
      return '—';
    }

    return `${Math.round(Number(value))}%`;
  }

  renderCurrentWeather() {
    const weather = this.currentWeather || {};
    return `
      <div class="panel">
        <p class="status">Current conditions for ${this.city}, ${this.state}</p>
        <h2>${weather.weather || 'No conditions available'}</h2>
        <div class="metrics">
          <div class="metric">
            <strong>${weather.temperature ?? '—'}${weather.temperatureUnit ? ` ${weather.temperatureUnit}` : ''}</strong>
            <span>Temperature</span>
          </div>
          <div class="metric">
            <strong>${weather.windSpeed ?? '—'}</strong>
            <span>Wind</span>
          </div>
          <div class="metric">
            <strong>${weather.windDirection ?? '—'}</strong>
            <span>Direction</span>
          </div>
          <div class="metric">
            <strong>${this.formatHumidity(weather.relativeHumidity)}</strong>
            <span>Humidity</span>
          </div>
        </div>
      </div>
    `;
  }

  renderForecast() {
    if (!this.forecast.length) {
      return '<div class="panel"><p class="status">Forecast unavailable for this location.</p></div>';
    }

    return `
      <div class="panel">
        <p class="status">Next 10 hours</p>
        <div class="forecast-grid">
          ${this.forecast.map((period) => `
            <div class="forecast-item">
              <div class="forecast-time">${new Date(period.startTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</div>
              <div class="forecast-temp">${period.temperature}${period.temperatureUnit}</div>
              <div class="forecast-text">${period.shortForecast}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  render() {
    document.body.dataset.theme = this.theme;

    this.innerHTML = `
      <div class="card">
        <div class="header">
          <div>
            <p class="status">Weather dashboard</p>
            <h1 class="location">${this.city}, ${this.state}</h1>
          </div>
          <button class="theme-toggle" type="button" data-action="theme">${this.theme === 'light' ? '🌙 Dark' : '☀️ Light'}</button>
        </div>

        <form id="weather-form">
          <input id="city-input" value="${this.cityInput}" placeholder="City" aria-label="City" />
          <input id="state-input" value="${this.stateInput}" placeholder="State" aria-label="State" />
          <button type="submit" ${this.loading ? 'disabled' : ''}>${this.loading ? 'Please wait…' : 'Update'}</button>
        </form>

        <div class="tabs">
          <button class="tab ${this.activeTab === 'current' ? 'active' : ''}" type="button" data-tab="current">Current Weather</button>
          <button class="tab ${this.activeTab === 'forecast' ? 'active' : ''}" type="button" data-tab="forecast">10-Hour Forecast</button>
        </div>

        ${this.error ? `<div class="popup">${this.error}</div>` : ''}
        ${this.loading ? '<p class="status">Loading weather…</p>' : ''}
        ${!this.loading && this.activeTab === 'current' ? this.renderCurrentWeather() : ''}
        ${!this.loading && this.activeTab === 'forecast' ? this.renderForecast() : ''}
      </div>
    `;

    this.querySelector('#weather-form')?.addEventListener('submit', (event) => this.handleSubmit(event));
    this.querySelector('#city-input')?.setAttribute('autocomplete', 'address-level2');
    this.querySelector('#state-input')?.setAttribute('autocomplete', 'address-level1');
    this.querySelector('[data-action="theme"]')?.addEventListener('click', () => this.toggleTheme());
    this.querySelectorAll('.tab').forEach((button) => {
      button.addEventListener('click', () => {
        this.activeTab = button.dataset.tab;
        this.render();
      });
    });

    this.querySelector('#city-input')?.addEventListener('input', (event) => {
      this.cityInput = event.target.value;
    });
    this.querySelector('#state-input')?.addEventListener('input', (event) => {
      this.stateInput = event.target.value;
    });
  }
}

customElements.define('weather-dashboard', Weather);
