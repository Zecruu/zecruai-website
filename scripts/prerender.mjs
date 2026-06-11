import fs from 'node:fs/promises';
import path from 'node:path';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { createServer } from 'vite';

const root = process.cwd();
const dist = path.join(root, 'dist');

const pages = [
  { route: 'home', file: 'index.html' },
  { route: 'getting-started', file: path.join('getting-started', 'index.html') },
  { route: 'faq', file: path.join('faq', 'index.html') },
  { route: 'not-found', file: '404.html' },
];

function injectRoot(html, rendered) {
  const next = html.replace(
    /<div id="root">[\s\S]*?<\/div>/,
    `<div id="root">${rendered}</div>`,
  );
  if (next === html) {
    throw new Error('Could not find root div for prerender injection');
  }
  return next;
}

const server = await createServer({
  root,
  appType: 'custom',
  logLevel: 'error',
  server: { middlewareMode: true },
});

try {
  const mod = await server.ssrLoadModule('/src/App.tsx');
  const App = mod.default;

  for (const page of pages) {
    const filePath = path.join(dist, page.file);
    const html = await fs.readFile(filePath, 'utf8');
    const rendered = renderToString(React.createElement(App, { initialRoute: page.route }));
    await fs.writeFile(filePath, injectRoot(html, rendered));
    console.log(`prerendered ${page.file}`);
  }
} finally {
  await server.close();
}
