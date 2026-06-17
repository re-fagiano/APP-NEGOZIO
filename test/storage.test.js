import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeState, saveState, loadState } from '../src/utils/storage.js';
import { toCsv } from '../src/utils/export.js';

test('normalizeState repairs missing collections and settings', () => {
  const state = normalizeState({ tickets: [{ customerName: 'Mario', device: 'iPhone', issue: 'Display' }] });
  assert.equal(state.tickets.length, 1);
  assert.equal(state.settings.shopName, 'FIXLAB');
  assert.equal(state.inventory.length, 0);
});

test('saveState and loadState persist normalized data', () => {
  const memory = new Map();
  const storage = { getItem: (key) => memory.get(key), setItem: (key, value) => memory.set(key, value) };
  saveState({ tickets: [{ customerName: 'Luca', device: 'PC', issue: 'SSD' }] }, storage);
  const loaded = loadState(storage);
  assert.equal(loaded.tickets[0].customerName, 'Luca');
  assert.ok(loaded.updatedAt);
});

test('toCsv escapes semicolons and quotes', () => {
  const csv = toCsv([{ name: 'A;B', note: 'dice "ok"' }], ['name', 'note']);
  assert.equal(csv, 'name;note\n"A;B";"dice ""ok"""');
});


test('normalizeState clamps invalid enum and numeric values', () => {
  const state = normalizeState({
    tickets: [{ customerName: 'A', device: 'B', issue: 'C', priority: 'Critical', status: 'Lost', estimate: -12 }],
    inventory: [{ code: 'x', description: 'Cable', price: -2, quantity: 3.8 }],
  });
  assert.equal(state.tickets[0].priority, 'Media');
  assert.equal(state.tickets[0].status, 'Aperto');
  assert.equal(state.tickets[0].estimate, 0);
  assert.equal(state.inventory[0].price, 0);
  assert.equal(state.inventory[0].quantity, 3);
});


test('saveState remains usable when storage write fails', () => {
  const storage = { setItem: () => { throw new Error('quota'); } };
  const saved = saveState({ settings: { shopName: 'Negozio', lowStockThreshold: -3 } }, storage);
  assert.equal(saved.settings.shopName, 'Negozio');
  assert.equal(saved.settings.lowStockThreshold, 0);
});


test('normalizeState prevents negative inventory quantity', () => {
  const state = normalizeState({ inventory: [{ code: 'x', description: 'Cable', quantity: -4 }] });
  assert.equal(state.inventory[0].quantity, 0);
});
