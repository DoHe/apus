import { html } from '../../../apus/utils/tags.js';
import ApusComponent from '../../../apus/universal/apus-component.js';

class CounterPage extends ApusComponent {
  template() {
    return html`
    <counter-apus count="100"/>
    <counter-apus count="-100"/>
    `;
  }

  title() {
    return 'Counter';
  }
}

customElements.define('counter-page', CounterPage); // TODO: move to common component

export default CounterPage;
