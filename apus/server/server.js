import * as url from 'url';
import { relative } from 'path';
import { createServer } from 'http';

import './shim.js';
import { html } from '../utils/tags.js';
import { info, log } from '../utils/logging.js';
import serveStatic from './static.js';
import { kebabize } from '../utils/strings.js';

const DEFAULT_HOSTNAME = '127.0.0.1';
const DEFAULT_PORT = 8080;

const componentWrapperTemplate = (component, componentImport) => html`
${component}
<script type="module" src="${componentImport}"></script>
`;

const clientOnlyComponentWrapperTemplate = (componentname, componentImport) => html`
<${componentname}></${componentname}>
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
  <link rel="prefetch" href="/apus/universal/universal/apus-component.js" />
  ${head}
</head>

<body>
  <script>window.apus = { config:${JSON.stringify(config)} }</script>
  ${body}
</body>

</html>
`;

const createHandler = (config) => (async (req, res) => {
  info('request', { url: req.url });
  const handled = await serveStatic(req, res, '.');
  if (handled) {
    info('serverd by static');
    return;
  }

  const currentDir = url.fileURLToPath(new URL('.', import.meta.url));
  const appDir = relative(currentDir, './app');
  const componentPath = `${appDir}/${config.mainComponent}`;
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  const module = await import(componentPath);
  const ComponentClass = module.default;
  const component = new ComponentClass();
  const renderedComponentTemplate = component.compileTemplate();
  const componentWrapper = componentWrapperTemplate(renderedComponentTemplate, componentPath);
  /* const componentWrapper = clientOnlyComponentWrapperTemplate(
    kebabize(ComponentClass.name),
    componentPath,
  ); */
  const renderedMainTemplate = mainTemplate({ body: componentWrapper, config });
  res.end(renderedMainTemplate);
});

function serve(config) {
  global.apus = { config };
  const server = createServer(
    createHandler(config),
  );
  const port = config.port || DEFAULT_PORT;
  const hostname = config.hostname || DEFAULT_HOSTNAME;

  server.listen(port, hostname, () => {
    log('server started', { hostname, port });
  });
}

export { serve };
