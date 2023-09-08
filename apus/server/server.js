import { createServer } from 'http';

import { createServer as createViteServer } from 'vite';
import connect from 'connect';

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

const createHandler = (config, pages, defaultLayout, vite) => (async (req, res, next) => {
  try {
    info('request', { url: req.url });
    const { rootDir } = config;
    const handled = await serveStatic(req, res, rootDir);
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
    let componentTemplate;
    if (component.mode?.() !== 'client') {
      componentTemplate = component.compileTemplate();
    } else {
      componentTemplate = component.template();
    }
    const componentWrapper = componentWrapperTemplate(componentTemplate, path);
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

    const url = req.originalUrl;
    const template = await vite.transformIndexHtml(url, renderedMainTemplate);

    res.end(template);
  } catch (e) {
    vite.ssrFixStacktrace(e);
    next(e);
  }
});

async function serve(config) {
  const app = connect();

  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom',
  });
  app.use(vite.middlewares);

  global.apus = { config };
  const { rootDir } = config;
  const pages = await loadPages(`${rootDir}/pages`);
  const defaultLayout = await loadDefaultLayout('../../app/layouts');
  const handler = createHandler(config, pages, defaultLayout, vite);
  app.use((req, res, next) => handler(req, res, next));

  const port = config.port || DEFAULT_PORT;
  const hostname = config.hostname || DEFAULT_HOSTNAME;
  const server = createServer(app);
  server.listen(port, hostname, () => {
    log('server started', { hostname, port });
  });
}

export { serve };
