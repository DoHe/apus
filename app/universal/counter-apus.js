import { css, html } from '../../apus/utils/tags.js';
import ApusComponent from '../../apus/universal/apus-component.js';

class CounterApus extends ApusComponent {
  props() {
    return { count: { default: 0, type: 'int' } };
  }

  styles() {
    return css`
      span {
        color: red;
      }`;
  }

  template() {
    return html`
    <button @click="increaseCount">+</button>
    {{ count }}
    <button @click="decreaseCount">-</button>
  `;
  }

  increaseCount() {
    this.data.count += 1;
  }

  decreaseCount() {
    this.data.count -= 1;
  }
}

customElements.define('counter-apus', CounterApus);

export default CounterApus;
