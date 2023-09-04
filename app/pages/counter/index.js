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

  head() {
    return html`
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@1/css/pico.min.css">
    `;
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
