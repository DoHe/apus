import './shim.js';
import { createServer } from 'http';
import { html } from '../universal/utils/tags.js';
import { log } from '../universal/utils/logging.js';
import serveStatic from './static.js';

const hostname = '127.0.0.1';
const port = 8080;

const mainTemplate = (component, componentImport) => html`
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="utf-8">
  <title>Apus</title>
</head>

<body>
  ${component}
  <script type="module" src="${componentImport}"></script>
</body>

</html>
`;

const server = createServer(async (req, res) => {
  log('request', { url: req.url });
  const handled = await serveStatic(req, res, '.');
  if (handled) {
    log('serverd by static');
    return;
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  const module = await import('../universal/counter.js');
  const renderedComponentTemplate = module.template({});
  const renderedMainTemplate = mainTemplate(renderedComponentTemplate, 'universal/counter.js');
  res.end(renderedMainTemplate);
});

server.listen(port, hostname, () => {
  log('server started', { hostname, port });
});
