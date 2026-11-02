const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

test('role values from map layers are never HTML-parsed', () => {
  assert.doesNotMatch(html, /cellRole\.innerHTML/);
  assert.match(html, /String\(roles\)\.split\(','\)\.forEach/);
  assert.match(html, /cellRole\.appendChild\(document\.createTextNode\(role\)\)/);
  assert.match(html, /cellRole\.appendChild\(document\.createElement\('br'\)\)/);
});

// Real-browser origin smoke tests cover HTML script parsing without brittle regexes.
