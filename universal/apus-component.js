import { info, warn } from './utils/logging.js';
import { kebabize } from './utils/strings.js';
import { html, isBrowser } from './utils/tags.js';

class ApusComponent extends HTMLElement {
  constructor() {
    super();
    if (new.target === ApusComponent) {
      throw new TypeError('Cannot construct ApusComponent instances directly');
    }

    if (typeof this.props !== 'function') {
      throw new TypeError('Must override props()');
    }

    if (typeof this.props !== 'function') {
      throw new TypeError('Must override template()');
    }

    this.data = {};
    Object.entries(this.props()).forEach(([propName, prop]) => {
      this.data[propName] = prop.default;
    });

    info('browser', { isBrowser: isBrowser() });
    if (isBrowser()) {
      const internals = this.attachInternals();
      this.shadow = internals.shadowRoot;
      if (!this.shadow) {
        warn('no shadow', { source: this });
        this.shadow = this.attachShadow({
          mode: 'open',
        });
        this.shadow.innerHTML = this.compileTemplate();
      }

      this.shadow.querySelector('button').addEventListener('click', () => {
        this.handleValueChange('count', this.data.count, this.data.count + 1);
      });
    }
  }

  static get observedAttributes() {
    return ['count'];
  }

  attributeChangedCallback(property, oldValue, newValue) {
    info('attribute changed', {
      property, oldValue, newValue, source: this,
    });
    this.handleValueChange(property, oldValue, newValue);
  }

  handleValueChange(property, oldValue, newValue) {
    info('value changed', {
      property, oldValue, newValue, source: this,
    });
    if (oldValue === newValue) return;
    this[property] = newValue;
    if (property in this.data) {
      const propType = this.props()[property].type;
      let parsedNewValue = newValue;
      switch (propType) {
        case 'int':
          parsedNewValue = parseInt(newValue, 10);
          break;
        case 'string':
          parsedNewValue = `${newValue}`;
          break;
        default:
      }
      this.data[property] = parsedNewValue;
      this.shadow.querySelector(`#${property}`).innerHTML = newValue;
    }
  }

  connectedCallback() {
    info('connected', { source: this });
  }

  compileTemplate() {
    const elementName = kebabize(this.constructor.name);

    let templateString = this.template();
    Object.keys(this.props()).forEach((propName) => {
      templateString = templateString.replace(
        `{{ ${propName} }}`,
        `<span id="${propName}">${this.data[propName]}</span>`,
      );
    });

    return html`
      <${elementName} ${this.propsTemplate(this.data)}">
        <template shadowrootmode="open">
          ${templateString}
        </template>
      </${elementName}>
    `;
  }

  propsTemplate() {
    let propsString = '';
    Object.keys(this.props()).forEach((propName) => {
      propsString += `${propName}="${this.data[propName]}" `;
    });
    return propsString;
  }
}

export default ApusComponent;
