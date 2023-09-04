import { html } from '../../apus/utils/tags.js';

class DefaultLayout {
  static body(body) {
    return html`
      <nav style="margin: 0 30px;">
        <ul>
          <li><strong>Apus Example App</strong></li>
        </ul>
        <ul>
          <li><a href="https://github.com/DoHe/apus/">Repo</a></li>
        </ul>
      </nav>
      <main class="container">
        ${body}
      </main>
    `;
  }

  static head(head) {
    return html`
      ${head}
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/@picocss/pico@next/css/pico.min.css"
      />
    `;
  }
}

export default DefaultLayout;
