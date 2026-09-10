import test from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { VibeCafeTelemetry } from '../components/vibecafe-telemetry.mjs';

test('renders the VibeCafe browser telemetry script exactly once', () => {
  const html = renderToStaticMarkup(VibeCafeTelemetry());

  assert.equal(
    html.match(/https:\/\/vibecafe\.ai\/telemetry\/v1\.js/g)?.length,
    1,
  );
  assert.match(html, /data-vc-product-id="cmtvaksfh00000agmeifzkaet"/);
  assert.match(html, /data-vc-auth-key="vc_web_[^"]+"/);
  assert.doesNotMatch(html, /telemetry\/v1\.js\?/);
});
