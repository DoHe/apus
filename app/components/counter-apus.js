import { css, html } from '../../apus/utils/tags.js';
import ApusComponent from '../../apus/universal/apus-component.js';

class CounterApus extends ApusComponent {
  props() {
    return { count: { default: 0, type: 'int' } };
  }

  styles() {
    return css`
      .count {
        color: red;
      }

      .container {
        margin: 10px;
      }

      button {
        min-height: 30px;
      }
    `;
  }

  template() {
    return html`
    <div class="container">
      <button @click="increaseCount">➕</button>
      <span class="count">{{ count }}</span>
      <button @click="decreaseCount">➖</button>
    </div>
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
