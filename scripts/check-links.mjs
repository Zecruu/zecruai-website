import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');
const htmlFiles = [
  'index.html',
  path.join('getting-started', 'index.html'),
  path.join('faq', 'index.html'),
  '404.html',
];

function attrs(html, name) {
  return [...html.matchAll(new RegExp(`${name}="([^"]+)"`, 'g'))].map((match) => match[1]);
}

function ids(html) {
  return new Set(attrs(html, 'id'));
}

function isExternal(href) {
  return /^(https?:|mailto:|tel:)/i.test(href);
}

function targetFile(fromFile, href) {
  const withoutHash = href.split('#')[0];
  if (!withoutHash) return fromFile;
  let resolved = path.resolve(path.dirname(fromFile), withoutHash);
  if (href.endsWith('/')) {
    resolved = path.join(resolved, 'index.html');
  }
  return resolved;
}

const failures = [];

for (const relativeFile of htmlFiles) {
  const file = path.join(dist, relativeFile);
  const html = await fs.readFile(file, 'utf8');
  const pageIds = ids(html);

  for (const href of attrs(html, 'href')) {
    if (isExternal(href)) continue;

    const [pathPart, hash] = href.split('#');
    const resolved = targetFile(file, href);

    if (pathPart && !(await exists(resolved))) {
      failures.push(`${relativeFile}: missing target for ${href}`);
      continue;
    }

    if (hash) {
      if (pathPart) {
        const targetHtml = await fs.readFile(resolved, 'utf8');
        if (!ids(targetHtml).has(hash)) {
          failures.push(`${relativeFile}: missing anchor #${hash} in ${href}`);
        }
      } else if (!pageIds.has(hash)) {
        failures.push(`${relativeFile}: missing anchor #${hash}`);
      }
    }
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`checked internal links for ${htmlFiles.length} html files`);

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}
