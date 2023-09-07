import * as fs from 'fs';
import * as path from 'path';

async function* walk(dir) {
  for await (const d of await fs.promises.opendir(dir)) {
    const entry = path.join(dir, d.name);
    if (d.isDirectory()) yield* walk(entry);
    else if (d.isFile()) yield entry;
  }
}

const loadPages = async (pagesDir) => {
  const pages = new Map();
  for await (const page of walk(pagesDir)) {
    const fileName = path.basename(page);
    if (fileName !== 'index.js') {
      continue;
    }
    let urlPath = path.dirname(path.relative(pagesDir, page));
    urlPath = urlPath === '.' ? '/' : `/${urlPath}`;
    pages.set(
      urlPath,
      {
        module: await import(page),
        path: `${urlPath}/index.js`,
      }
      ,
    );
  }
  return pages;
};

export default loadPages;
