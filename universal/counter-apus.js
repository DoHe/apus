import { html } from './utils/tags.js';
import ApusComponent from './apus-component.js';

class CounterApus extends ApusComponent {
  props() {
    return { count: { default: 0, type: 'int' } };
  }

  template() {
    return html`
    <button>+</button>
    {{ count }}
  `;
  }
}

customElements.define('counter-apus', CounterApus);

export default CounterApus;
