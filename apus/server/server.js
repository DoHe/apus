import { createServer } from 'http';

import './shim.js';
import loadPages from './pages.js';
import { html } from '../utils/tags.js';
import { info, log } from '../utils/logging.js';
import serveStatic from './static.js';
import loadDefaultLayout from './layouts.js';

const DEFAULT_HOSTNAME = '127.0.0.1';
const DEFAULT_PORT = 8080;

const componentWrapperTemplate = (component, componentImport) => html`
${component}
<script type="module" src="${componentImport}"></script>
`;

const mainTemplate = ({
  lang = 'en',
  title = 'apus',
  head = '',
  body = '',
  config = {},
}) => html`
<!DOCTYPE html>
<html lang="${lang}">

<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <link rel="prefetch" href="/apus/utils/tags.js" />
  <link rel="prefetch" href="/apus/utils/logging.js" />
  <link rel="prefetch" href="/apus/utils/strings.js" />
  <link rel="prefetch" href="/apus/utils/environment.js" />
  <link rel="prefetch" href="/apus/universal/apus-component.js" />

  <link rel="apple-touch-icon" sizes="180x180" href="app/static/apple-touch-icon.png">
  <link rel="icon" type="image/png" sizes="48x48" href="app/static/favicon-48.png" />
  <link rel="icon" type="image/png" sizes="32x32" href="app/static/favicon-32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="app/static/favicon-16.png">
  <link rel="manifest" href="app/static/manifest.json">
  <meta name="msapplication-TileColor" content="#da532c">
  <meta name="theme-color" content="#ffffff">
  ${head}
</head>

<body>
  <script>window.apus = { config:${JSON.stringify(config)} }</script>
  ${body}
</body>

</html>
`;

const createHandler = (config, pages, defaultLayout) => (async (req, res) => {
  info('request', { url: req.url });
  const handled = await serveStatic(req, res, '.');
  if (handled) {
    info('serverd by static');
    return;
  }

  const page = pages.get(req.url);
  if (!page) {
    res.statusCode = 400;
    res.end('Path could not be found');
    return;
  }
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  const { module, path } = page;
  const ComponentClass = module.default;
  const component = new ComponentClass();
  const renderedComponentTemplate = component.compileTemplate();
  const componentWrapper = componentWrapperTemplate(renderedComponentTemplate, path);
  const title = component.title?.() || '';
  let head = component.head?.() || '';
  let body = componentWrapper;
  if (defaultLayout) {
    body = defaultLayout.body(body);
    head = defaultLayout.head(head);
  }
  const renderedMainTemplate = mainTemplate({
    body, title, head, config,
  });
  res.end(renderedMainTemplate);
});

async function serve(config) {
  global.apus = { config };
  const pages = await loadPages('./app/pages');
  const defaultLayout = await loadDefaultLayout('../../app/layouts');
  const server = createServer(
    createHandler(config, pages, defaultLayout),
  );
  const port = config.port || DEFAULT_PORT;
  const hostname = config.hostname || DEFAULT_HOSTNAME;

  server.listen(port, hostname, () => {
    log('server started', { hostname, port });
  });
}

export { serve };
