import test from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { GithubLink } from '../components/github-link.mjs';

test('renders an accessible GitHub repository link in a new tab', () => {
  const html = renderToStaticMarkup(GithubLink({ onClick() {} }));

  assert.match(html, /href="https:\/\/github\.com\/Johnbug\/duo-simulator"/);
  assert.match(html, /target="_blank"/);
  assert.match(html, /rel="noreferrer"/);
  assert.match(html, /aria-label="GitHub repository"/);
});
