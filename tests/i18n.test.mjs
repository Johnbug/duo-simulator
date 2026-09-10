import test from 'node:test';
import assert from 'node:assert/strict';
import {
  defaultLocale,
  getLocaleFromAcceptLanguage,
  hasLocale,
  localePath,
} from '../lib/i18n.mjs';

test('selects a supported locale from browser language preferences', () => {
  assert.equal(getLocaleFromAcceptLanguage('en-US,en;q=0.9,zh;q=0.8'), 'en');
  assert.equal(getLocaleFromAcceptLanguage('ja-JP,ja;q=0.9'), 'ja');
  assert.equal(getLocaleFromAcceptLanguage('zh-TW,zh;q=0.9'), 'zh');
});

test('falls back to Chinese when browser languages are unsupported or absent', () => {
  assert.equal(getLocaleFromAcceptLanguage('fr-FR,fr;q=0.9'), defaultLocale);
  assert.equal(getLocaleFromAcceptLanguage(null), defaultLocale);
});

test('recognizes only the three public locale segments', () => {
  assert.equal(hasLocale('zh'), true);
  assert.equal(hasLocale('en'), true);
  assert.equal(hasLocale('ja'), true);
  assert.equal(hasLocale('en-US'), false);
});

test('replaces an existing locale segment while preserving the remaining path', () => {
  assert.equal(localePath('/zh', 'en'), '/en');
  assert.equal(localePath('/en/details', 'ja'), '/ja/details');
  assert.equal(localePath('/', 'zh'), '/zh');
});
