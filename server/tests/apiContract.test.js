import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as apiModule from '../../src/services/api.js';
import { app } from '../server.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
const srcDir = path.resolve(rootDir, 'src');

/**
 * Recursively find all .js and .jsx files in a directory
 */
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

/**
 * Clean layer regex source to get path prefix
 */
function extractPathFromRegexp(source) {
  if (!source) return '';
  return source
    .replace(/\\\//g, '/')
    .replace(/^\^/, '')
    .replace(/\/\?\(\?=\/\|\$\)/g, '')
    .replace(/\(\?=\/\|\$\)/g, '')
    .replace(/\/\?/g, '')
    .replace(/\?$/, '')
    .replace(/\/+$/, '');
}

/**
 * Extract all routes registered on an Express application
 */
function extractExpressRoutes(app) {
  const routes = [];

  function parseLayer(layer, basePath = '') {
    if (layer.route) {
      const routePath = (basePath + (layer.route.path || '')).replace(/\/+/g, '/');
      const methods = Object.keys(layer.route.methods || {}).map((m) => m.toUpperCase());
      routes.push({ path: routePath, methods });
    } else if (layer.name === 'router' && layer.handle?.stack) {
      const subPrefix = extractPathFromRegexp(layer.regexp?.source || '');
      const newPrefix = (basePath + '/' + subPrefix).replace(/\/+/g, '/');
      layer.handle.stack.forEach((subLayer) => {
        parseLayer(subLayer, newPrefix);
      });
    }
  }

  if (app._router && app._router.stack) {
    app._router.stack.forEach((layer) => {
      parseLayer(layer, '');
    });
  }

  return routes;
}

/**
 * Normalize an endpoint pattern for comparison (e.g. replace :id or ${id} with :param)
 */
function normalizePattern(p) {
  return p
    .split('?')[0] // strip query string
    .replace(/\$\{([^}]+)\}/g, ':param') // replace template vars
    .replace(/:[a-zA-Z0-9_]+/g, ':param') // replace express route params
    .replace(/\/+/g, '/') // clean multi slashes
    .replace(/\/$/, ''); // strip trailing slash
}

describe('Frontend API Contract & Route Integrity', () => {
  it('fails if any function called as xxxAPI.fn() in src is not defined in api.js', () => {
    const srcFiles = getAllFiles(srcDir);
    const apiCallRegex = /\b([a-zA-Z0-9_]+API)\.([a-zA-Z0-9_]+)\b/g;

    const missingCalls = [];

    srcFiles.forEach((filePath) => {
      // Skip api.js itself
      if (path.resolve(filePath) === path.resolve(srcDir, 'services/api.js')) return;

      const content = fs.readFileSync(filePath, 'utf8');
      let match;
      while ((match = apiCallRegex.exec(content)) !== null) {
        const apiName = match[1];
        const fnName = match[2];

        const targetApi = apiModule[apiName];
        if (!targetApi) {
          missingCalls.push({
            file: path.relative(rootDir, filePath),
            api: apiName,
            fn: fnName,
            reason: `API object '${apiName}' is not exported by src/services/api.js`,
          });
        } else if (typeof targetApi[fnName] !== 'function') {
          missingCalls.push({
            file: path.relative(rootDir, filePath),
            api: apiName,
            fn: fnName,
            reason: `Function '${apiName}.${fnName}' is undefined in src/services/api.js`,
          });
        }
      }
    });

    if (missingCalls.length > 0) {
      console.error('Undefined API calls found in src/:', missingCalls);
    }

    expect(missingCalls).toEqual([]);
  });

  it('fails if any client endpoint in api.js has no matching server route', () => {
    const apiSource = fs.readFileSync(path.resolve(srcDir, 'services/api.js'), 'utf8');
    // Match api.<method>(<path>, ...)
    const endpointCallRegex = /api\.(get|post|put|patch|delete)\(\s*([`'"][^,)]+)/g;

    const clientEndpoints = [];
    let match;
    while ((match = endpointCallRegex.exec(apiSource)) !== null) {
      const method = match[1].toUpperCase();
      let rawArg = match[2].trim();

      // Clean rawArg up to ending quote or query start
      let cleanPath = rawArg
        .replace(/^[`'"]/, '')
        .replace(/[`'"].*$/, '')
        .split('?')[0];

      // Handle conditional query strings in template literals like `${providerId ? ...`
      if (cleanPath.includes('${') && cleanPath.includes('?')) {
        cleanPath = cleanPath.replace(/\$\{[^}]*\?.*$/, '');
      }

      clientEndpoints.push({ method, rawPath: cleanPath });
    }

    expect(clientEndpoints.length).toBeGreaterThan(0);

    const serverRoutes = extractExpressRoutes(app);
    expect(serverRoutes.length).toBeGreaterThan(0);

    const unmatched = [];

    clientEndpoints.forEach(({ method, rawPath }) => {
      // Prepend /api since api.js uses baseURL with /api
      const fullClientPath = ('/api/' + rawPath).replace(/\/api\/api\//, '/api/').replace(/\/+/g, '/');
      const normalizedClient = normalizePattern(fullClientPath);

      // Check against server routes
      const matched = serverRoutes.some((route) => {
        if (!route.methods.includes(method)) return false;
        const normalizedServer = normalizePattern(route.path);
        return normalizedServer === normalizedClient;
      });

      if (!matched) {
        unmatched.push({
          method,
          rawPath,
          fullClientPath,
          normalizedClient,
        });
      }
    });

    if (unmatched.length > 0) {
      console.error('Unmatched client endpoints without server route:', unmatched);
      console.error(
        'Registered server routes sample:',
        serverRoutes.slice(0, 20).map((r) => `${r.methods.join(',')} ${r.path}`)
      );
    }

    expect(unmatched).toEqual([]);
  });
});
