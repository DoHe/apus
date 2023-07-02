class Component1 extends HTMLElement {
  constructor() {
    super();
    this.prop = 'default';
  }

  static get observedAttributes() {
    return ['prop'];
  }

  attributeChangedCallback(property, oldValue, newValue) {
    if (oldValue === newValue) return;
    this[property] = newValue;
  }

  connectedCallback() {
    const shadow = this.attachShadow({ mode: 'closed' });

    const template = document.getElementById('hello-world').content.cloneNode(true);
    const hwMsg = `Hello ${this.prop}`;

    Array.from(template.querySelectorAll('.hw-text'))
      .forEach((n) => n.textContent = hwMsg);

    shadow.append(template);
  }

  disconnectedCallback() {
    console.log(`${this}is gone`);
  }
}

window.customElements.define('component-1', Component1);
