import { info, warn } from '../utils/logging.js';
import { kebabize } from '../utils/strings.js';
import { html } from '../utils/tags.js';
import { isBrowser } from '../utils/environment.js';

const eventRegex = /(?<all>(data-eventid="(?<id>\S*)" )?@(?<event>\S*)="(?<funct>\S*)")/g;
const conditionRegex = /<.*? if="(?<func>\S*?)"[\s\S]*?<\/.*?>/g;
const componentRegexTemplate = (componentName) => (
  `(?<componentBegin><${componentName} (?<props>[\\s\\S]*?)>)(?<content>[\\s\\S]*?)(?<componentEnd><\\/${componentName}>)`
);

class ApusComponent extends HTMLElement {
  constructor(initialData = {}) {
    super();
    if (new.target === ApusComponent) {
      throw new TypeError('Cannot construct ApusComponent instances directly');
    }

    if (typeof this.props !== 'function') {
      throw new TypeError('Must override props()');
    }

    if (typeof this.template !== 'function') {
      throw new TypeError('Must override template()');
    }

    const apusComponent = this;
    const data = {};
    this.data = data;

    Object.entries(this.props()).forEach(([propName, prop]) => {
      const maskedPropName = `#${propName}`;
      Object.defineProperty(data, propName, {
        get() {
          return this[maskedPropName].value;
        },
        set(value) {
          apusComponent.handleValueChange(
            propName,
            apusComponent.data[maskedPropName],
            value,
          );
        },
      });
      data[maskedPropName] = {
        value: prop.default,
        type: prop.type,
      };
    });

    if (initialData) {
      Object.entries(initialData).forEach(([propName, propValue]) => {
        data[propName] = propValue;
      });
    }
    if (isBrowser()) {
      const internals = this.attachInternals();
      this.shadow = internals.shadowRoot;
      if (!this.shadow) {
        warn('no shadow', { source: this });
        this.shadow = this.attachShadow({
          mode: 'open',
        });
        this.shadow.innerHTML = this.compileShadowTemplate();
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

  handleValueChange(name, oldValue, newValue) {
    const maskedName = `#${name}`;
    info('value changed', {
      name, maskedName, oldValue, newValue, source: this,
    });
    if (oldValue === newValue) return;
    if (name in this.data) {
      const dataType = this.data[maskedName].type;
      let parsedNewValue = newValue;
      switch (dataType) {
        case 'int':
          parsedNewValue = parseInt(newValue, 10);
          break;
        case 'string':
          parsedNewValue = `${newValue}`;
          break;
        default:
      }
      this.data[maskedName].value = parsedNewValue;
      if (this.shadow) {
        this.shadow.querySelector(`[data-propid="${name}"]`).innerHTML = newValue;
        for (const element of this.shadow.querySelectorAll('[if]')) {
          const functName = element.getAttribute('if');
          const condition = this[functName]?.();
          if (element.tagName === 'TEMPLATE') {
            if (!condition) {
              continue;
            }
            element.outerHTML = element.innerHTML;
          } else if (condition) {
            continue;
          } else {
            element.outerHTML = `<template if="${functName}">${element.outerHTML}</template>`;
          }
        }
      }
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

  compileShadowTemplate() {
    let templateString = this.template();
    templateString = this.resolveVariables(templateString);
    templateString = this.resolveEvents(templateString);
    templateString = this.resolveConditions(templateString);
    templateString = this.resolveComponents(templateString);
    const stylesString = this.compileStyles();

    return html`
    ${stylesString}
    ${templateString}
  `;
  }

  resolveVariables(compiled) {
    let templateString = compiled;
    Object.keys(this.data).forEach((maskedDataName) => {
      const dataName = maskedDataName.replace('#', '');
      templateString = templateString.replaceAll(
        `{{ ${dataName} }}`,
        `<span data-propid="${dataName}">${this.data[dataName]}</span>`,
      );
    });
    return templateString;
  }

  resolveEvents(compiled) {
    let replaced = 0;
    return compiled.replace(
      eventRegex,
      (_, all) => {
        replaced += 1;
        return `data-eventid="${replaced}" ${all}`;
      },
    );
  }

  resolveConditions(compiled) {
    return compiled.replaceAll(
      conditionRegex,
      (match, func) => {
        if (this[func]?.()) {
          return match;
        }
        return `<template if="${func}">${match}</template>`;
      },
    );
  }

  resolveComponents(compiled) {
    if (isBrowser() || !this.components) {
      return compiled;
    }
    let templateString = compiled;
    this.components().forEach((ComponentClass) => {
      const elementName = kebabize(ComponentClass.name);
      const regex = new RegExp(componentRegexTemplate(elementName), 'g');
      templateString = templateString.replaceAll(
        regex,
        (_, componentBegin, props, content, componentEnd) => {
          const initialData = this.parseProps(props);
          const component = new ComponentClass(initialData);
          const componentTemplate = component.compileShadowTemplate();
          return `${componentBegin}
            <template shadowrootmode="open">
              ${componentTemplate}
            </template>
            ${content}
          ${componentEnd}`;
        },
      );
    });
    return templateString;
  }

  compileStyles() {
    if (!this.styles) {
      return '';
    }
    return `<style>
        ${this.styles()}
      </style>`;
  }

  compileTemplate() {
    const componentName = kebabize(this.constructor.name);
    return html`
    <${componentName}>
      <template shadowrootmode="open">
        ${this.compileShadowTemplate()}
      </template>
    </${componentName}>
  `;
  }

  parseProps(propsString) {
    const propsArray = propsString.replaceAll(/\s/g, ' ').split(' ');
    const props = {};
    propsArray.forEach((prop) => {
      const [propName, propValue] = prop.split('=');
      props[propName] = propValue.replaceAll('"', '');
    });
    return props;
  }
}

export default ApusComponent;
