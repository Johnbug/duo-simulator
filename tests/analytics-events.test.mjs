import test from 'node:test';
import assert from 'node:assert/strict';
import { behaviorEvent } from '../lib/analytics-events.mjs';

test('creates an anonymous behavior event with locale and interaction value', () => {
  assert.deepEqual(behaviorEvent('pose_selected', 'ja', 'tent'), {
    name: 'pose_selected',
    properties: { locale: 'ja', value: 'tent' },
  });
});

test('adds a numeric interaction context without accepting arbitrary user text', () => {
  assert.deepEqual(behaviorEvent('model_dragged', 'en', 'fold', 72), {
    name: 'model_dragged',
    properties: { locale: 'en', value: 'fold', context: 72 },
  });
});
