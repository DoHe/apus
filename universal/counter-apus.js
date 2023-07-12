import { html } from './utils/tags.js';
import ApusComponent from './apus-component.js';

class CounterApus extends ApusComponent {
  props() {
    return { count: { default: 0, type: 'int' } };
  }

  template() {
    return html`
    <button @click="increaseCount">+</button>
    {{ count }}
  `;
  }

  increaseCount() {
    this.handleValueChange('count', this.data.count, this.data.count + 1);
  }
}

customElements.define('counter-apus', CounterApus);

export default CounterApus;
