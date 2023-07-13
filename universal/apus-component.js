import { info, warn } from './utils/logging.js';
import { kebabize } from './utils/strings.js';
import { html } from './utils/tags.js';
import { isBrowser } from './utils/environment.js';

const eventRegex = /(?<all>(data-eventid="(?<id>\S*)" )?@(?<event>\S*)="(?<funct>\S*)")/g;

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

      this.registerEvents();
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
      this.shadow.querySelector(`[data-propid="${property}"]`).innerHTML = newValue;
    }
  }

  connectedCallback() {
    info('connected', { source: this });
  }

  registerEvents() {
    const matches = this.shadow.innerHTML.matchAll(eventRegex);
    for (const match of matches) {
      const { id, event, funct } = match.groups;
      if (!id || !event || !funct) {
        continue;
      }
      this.shadow.querySelector(`[data-eventid="${id}"]`).addEventListener(
        event,
        this[funct].bind(this),
      );
    }
  }

  compileTemplate() {
    const componentName = kebabize(this.constructor.name);

    let templateString = this.template();
    Object.keys(this.props()).forEach((propName) => {
      templateString = templateString.replace(
        `{{ ${propName} }}`,
        `<span data-propid="${propName}">${this.data[propName]}</span>`,
      );
    });

    let replaced = 0;
    templateString = templateString.replace(
      eventRegex,
      (_, all) => {
        replaced += 1;
        return `data-eventid="${replaced}" ${all}`;
      },
    );

    let stylesString = '';
    if (this.styles) {
      stylesString = `<style>
        ${this.styles()}
      </style>`;
    }

    return html`
    <${componentName} ${this.propsTemplate(this.data)}">
      <template shadowrootmode="open">
        ${stylesString}
        ${templateString}
      </template>
    </${componentName}>
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
