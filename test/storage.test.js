import test from 'node:test';
import assert from 'node:assert/strict';
import { createId, normalizeState, saveState, loadState } from '../src/utils/storage.js';
import { toCsv } from '../src/utils/export.js';

test('normalizeState repairs missing collections and settings', () => {
  const state = normalizeState({ tickets: [{ customerName: 'Mario', device: 'iPhone', issue: 'Display' }] });
  assert.equal(state.tickets.length, 1);
  assert.equal(state.settings.shopName, 'FIXLAB');
  assert.equal(state.inventory.length, 0);
});

test('normalizeState clamps invalid numbers and enum values', () => {
  const state = normalizeState({
    settings: { shopName: '  Lab  ', lowStockThreshold: -5 },
    tickets: [{ customerName: 'A', device: 'PC', issue: 'SSD', priority: 'Urgente', status: 'Perso', estimate: 'abc' }],
    inventory: [{ code: 'ram', description: 'RAM', price: -10, quantity: 2.9 }],
  });
  assert.equal(state.settings.shopName, 'Lab');
  assert.equal(state.settings.lowStockThreshold, 0);
  assert.equal(state.tickets[0].priority, 'Media');
  assert.equal(state.tickets[0].status, 'Aperto');
  assert.equal(state.tickets[0].estimate, 0);
  assert.equal(state.inventory[0].code, 'RAM');
  assert.equal(state.inventory[0].price, 0);
  assert.equal(state.inventory[0].quantity, 2);
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

test('createId uses crypto.randomUUID when available', () => {
  const originalCrypto = globalThis.crypto;
  Object.defineProperty(globalThis, 'crypto', { value: { randomUUID: () => '123e4567-e89b-12d3-a456-426614174000' }, configurable: true });
  assert.equal(createId('TKT'), 'TKT-123E4567-E89B-12D3-A456-426614174000');
  Object.defineProperty(globalThis, 'crypto', { value: originalCrypto, configurable: true });
});

test('normalizeState tolerates null entries from corrupted local state', () => {
  const state = normalizeState({ tickets: [null], customers: [null], inventory: [null] });
  assert.equal(state.tickets.length, 1);
  assert.equal(state.tickets[0].status, 'Aperto');
  assert.equal(state.customers[0].name, '');
  assert.equal(state.inventory[0].quantity, 0);
});
