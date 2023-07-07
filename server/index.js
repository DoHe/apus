import './shim.js';
import { createServer } from 'http';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as url from 'url';
import { html } from '../universal/utils.js';

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

const serveStatic = async (req, res, staticDir) => {
  const parsedUrl = url.parse(req.url);
  const pathname = `${staticDir}${parsedUrl.pathname}`;
  const { ext } = path.parse(pathname);
  const map = {
    '.ico': 'image/x-icon',
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
  };

  try {
    const data = await fs.readFile(pathname, 'utf8');
    res.statusCode = 200;
    res.setHeader('Content-type', map[ext] || 'text/plain');
    res.end(data);
    return true;
  } catch (error) {
    return false;
  }
};

const server = createServer(async (req, res) => {
  console.log(`Request for: ${req.url}`);
  const handled = await serveStatic(req, res, '.');
  if (handled) {
    console.log('serverd by static');
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
  console.log(`Server running at http://${hostname}:${port}/`);
});
