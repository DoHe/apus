import * as url from 'url';
import { relative } from 'path';
import { createServer } from 'http';

import './shim.js';
import { html } from '../universal/utils/tags.js';
import { info, log } from '../universal/utils/logging.js';
import serveStatic from './static.js';

const DEFAULT_HOSTNAME = '127.0.0.1';
const DEFAULT_PORT = 8080;

const mainTemplate = (component, componentImport) => html`
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="utf-8">
  <title>Apus</title>
  <link rel="prefetch" href="/framework/universal/utils/tags.js" />
  <link rel="prefetch" href="/framework/universal/utils/logging.js" />
  <link rel="prefetch" href="/framework/universal/utils/strings.js" />
  <link rel="prefetch" href="/framework/universal/utils/environment.js" />
  <link rel="prefetch" href="/framework/universal/universal/apus-component.js" />
</head>

<body>
  ${component}
  <script type="module" src="${componentImport}"></script>
  <div>
    <span>test span</span>
  </div>
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
  const renderedComponentTemplate = component.compileTemplate({});
  const renderedMainTemplate = mainTemplate(renderedComponentTemplate, componentPath);
  res.end(renderedMainTemplate);
});

function serve(config) {
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
