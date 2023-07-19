import { html } from '../../apus/utils/tags.js';
import ApusComponent from '../../apus/universal/apus-component.js';
import CounterApus from '../components/counter-apus.js';

class IndexPage extends ApusComponent {
  template() {
    return html`
    <counter-apus count="30"></counter-apus>
    <counter-apus count="20"></counter-apus>
    `;
  }

  title() {
    return 'Index';
  }

  props() {
    return {};
  }

  components() {
    return {
      CounterApus,
    };
  }
}

customElements.define('index-page', IndexPage);

export default IndexPage;
