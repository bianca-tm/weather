import { LitElement, html, css } from 'lit';

class Weather extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 16px;
      color: var(--weather-text-color, black);
    }
  `;

  static properties = {
    message: { type: String },
  };

  constructor() {
    super();
    this.message = 'weather app incoming!';
  }

  connectedCallback() {
    super.connectedCallback();
    fetch('/api/message')
      .then((response) => response.json())
      .then((data) => {
        this.message = data.message;
      });
  }

  render() {
    return html`<p>${this.message}</p>`;
  }
}

customElements.define('weather', Weather);
