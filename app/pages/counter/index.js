import { html } from '../../../apus/utils/tags.js';
import ApusComponent from '../../../apus/universal/apus-component.js';
import CounterApus from '../../components/counter-apus.js';

class CounterPage extends ApusComponent {
  template() {
    return html`
    <counter-apus count="100"></counter-apus>
    <counter-apus count="-100"></counter-apus>
    `;
  }

  title() {
    return 'Counter';
  }

  props() {
    return {};
  }

  components() {
    return [
      CounterApus,
    ];
  }
}

customElements.define('counter-page', CounterPage); // TODO: move to common component

export default CounterPage;
