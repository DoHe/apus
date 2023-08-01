import * as fs from 'fs/promises';
import * as path from 'path';
import * as url from 'url';

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
    console.log({ pathname });
    const data = await fs.readFile(pathname, 'utf8');
    res.statusCode = 200;
    res.setHeader('Content-type', map[ext] || 'text/plain');
    res.end(data);
    return true;
  } catch (error) {
    return false;
  }
};

export default serveStatic;
