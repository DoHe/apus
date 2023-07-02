class ButtonCounter extends HTMLElement {
  constructor() {
    super();

    this.count = 0;

    const internals = this.attachInternals();
    this.shadow = internals.shadowRoot;
    if (!this.shadow) {
      this.shadow = this.attachShadow({
        mode: 'open',
      });
      this.shadow.innerHTML = `
        <button>+</button>
        <span id="count">${this.count}</span>
    `;
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
    console.log(`attribute changed: ${property} (${oldValue} --> ${newValue})`);
    this.handleValueChange(property, oldValue, newValue);
  }

  handleValueChange(property, oldValue, newValue) {
    console.log(`value changed: ${property} (${oldValue} --> ${newValue})`);
    if (oldValue === newValue) return;
    this[property] = newValue;
    if (property === 'count') {
      this.count = parseInt(this.count, 10);
      this.changedCount();
    }
  }

  connectedCallback() {
    console.log(`Connected ${this}`);
  }

  changedCount() {
    this.shadow.querySelector('#count').innerHTML = this.count;
  }
}

customElements.define('button-counter', ButtonCounter);
