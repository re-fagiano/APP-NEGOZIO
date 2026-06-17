import test from 'node:test';
import assert from 'node:assert/strict';
import { neutralizeSpreadsheetFormula, toCsv } from '../src/utils/export.js';

test('neutralizeSpreadsheetFormula prefixes spreadsheet formulas', () => {
  assert.equal(neutralizeSpreadsheetFormula('=IMPORTXML("http://example.com")'), '\'=IMPORTXML("http://example.com")');
  assert.equal(neutralizeSpreadsheetFormula('@cmd'), "'@cmd");
  assert.equal(neutralizeSpreadsheetFormula('plain text'), 'plain text');
});

test('toCsv neutralizes formula injection before exporting', () => {
  assert.equal(toCsv([{ name: '=2+2' }], ['name']), "name\n'=2+2");
});
