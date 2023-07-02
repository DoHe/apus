class MenuToggle extends HTMLElement {
  constructor() {
    super();

    this.name = 'default';

    const internals = this.attachInternals();
    this.shadow = internals.shadowRoot;
    if (!this.shadow) {
      this.shadow = this.attachShadow({
        mode: 'open',
      });
      this.shadow.innerHTML = `<button>${this.name}</button>`;
    }

    this.shadow.querySelector('button').addEventListener('click', () => console.log('clicked'));

    const name = this.shadow.querySelector('#name');
    name.innerHTML = this.name;
  }

  static get observedAttributes() {
    return ['name'];
  }

  attributeChangedCallback(property, oldValue, newValue) {
    console.log(`attribute changed: ${property} (${oldValue} --> ${newValue})`);
    if (oldValue === newValue) return;
    this[property] = newValue;
    if (property === 'name') {
      this.changedName();
    }
  }

  connectedCallback() {
    // this.shadow.querySelector('#name').innerHTML = this.name;
    console.log(`Connected ${this}`);
  }

  changedName() {
    this.shadow.querySelector('#name').innerHTML = this.name;
  }
}

customElements.define('menu-toggle', MenuToggle);
