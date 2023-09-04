import { html } from '../../apus/utils/tags.js';
import ApusComponent from '../../apus/universal/apus-component.js';
import CounterApus from '../components/counter-apus.js';

class IndexPage extends ApusComponent {
  template() {
    return html`
    <counter-apus count="30">
      default slot
    </counter-apus>
    <counter-apus count="20">
      <span slot="start">start</span>
      <span slot="end">end</span>
    </counter-apus>
    `;
  }

  title() {
    return 'Index';
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

customElements.define('index-page', IndexPage);

export default IndexPage;
