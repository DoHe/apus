import { html } from './utils.js';

const shadowTemplate = (data) => html`
  <button>+</button>
  <span id="count"></span>
`;

const template = (data) => html`
  <button-counter count="${data.count || 0}">
    <template shadowrootmode="open">
      ${shadowTemplate(data)}
    </template>
  </button-counter>
`;

class ButtonCounter extends HTMLElement {
  constructor() {
    super();

    this.data = {
      count: 0,
    };

    const internals = this.attachInternals();
    this.shadow = internals.shadowRoot;
    if (!this.shadow) {
      console.log('no shadow');
      this.shadow = this.attachShadow({
        mode: 'open',
      });
      this.shadow.innerHTML = shadowTemplate();
    }

    this.shadow.querySelector('button').addEventListener('click', () => {
      this.handleValueChange('count', this.count, this.count + 1);
    });

    const count = this.shadow.querySelector('#count');
    count.innerHTML = this.count;
  }

  static get observedAttributes() {
    return ['count'];
  }

  attributeChangedCallback(property, oldValue, newValue) {
    console.log('attribute changed');
    this.handleValueChange(property, oldValue, newValue);
  }

  handleValueChange(property, oldValue, newValue) {
    console.log('value changed');
    if (oldValue === newValue) return;
    this[property] = newValue;
    if (property === 'count') {
      this.count = parseInt(this.count, 10);
      this.changedCount();
    }
  }

  connectedCallback() {
    console.log('Connected');
  }

  changedCount() {
    this.shadow.querySelector('#count').innerHTML = this.count;
  }
}

customElements.define('button-counter', ButtonCounter);

export { ButtonCounter, template };