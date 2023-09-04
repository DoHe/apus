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

      .counter-container {
        display: flex;
        justify-content: center;
        margin: 10px;
      }

      button {
        min-height: 30px;
      }
    `;
  }

  template() {
    return html`
      <div class="counter-container">
        <div>
          <slot name="start"></slot>
          <button @click="increaseCount">➕</button>
          <span class="count">{{ count }}</span>
          <slot></slot>
          <button @click="decreaseCount">➖</button>
          <slot name="end"></slot>
          <div if="isCountHigh">That is a high count</div>
        </div>
      </div>
    `;
  }

  increaseCount() {
    this.data.count += 1;
  }

  decreaseCount() {
    this.data.count -= 1;
  }

  isCountHigh() {
    return this.data.count > 20;
  }
}

customElements.define('counter-apus', CounterApus);

export default CounterApus;
