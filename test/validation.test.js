import test from 'node:test';
import assert from 'node:assert/strict';
import { validateBackupPayload, validateInventoryDraft, validateSettingsDraft, validateTicketDraft } from '../src/utils/validation.js';

test('validateTicketDraft rejects incomplete tickets and invalid values', () => {
  const errors = validateTicketDraft({ customerName: '', device: '', issue: '', priority: 'Urgente', estimate: -1 });
  assert.equal(errors.length, 5);
});

test('validateTicketDraft rejects non-numeric estimates', () => {
  assert.deepEqual(validateTicketDraft({ customerName: 'Mario', device: 'PC', issue: 'SSD', priority: 'Media', estimate: 'abc' }), ['Il preventivo deve essere un numero positivo.']);
});

test('validateInventoryDraft rejects missing article details and invalid quantities', () => {
  const errors = validateInventoryDraft({ code: '', description: '', price: -2, quantity: 1.5 });
  assert.equal(errors.length, 4);
});

test('validateInventoryDraft rejects negative quantities and invalid prices', () => {
  assert.deepEqual(validateInventoryDraft({ code: 'BAT', description: 'Batteria', price: 'abc', quantity: -1 }), [
    'Il prezzo deve essere un numero positivo.',
    'La quantità non può essere negativa.',
  ]);
});

test('validateSettingsDraft rejects invalid shop settings', () => {
  assert.deepEqual(validateSettingsDraft({ shopName: '', lowStockThreshold: -1 }), [
    'Inserisci il nome negozio.',
    'La soglia scorte non può essere negativa.',
  ]);
});

test('validateBackupPayload rejects malformed backup collections', () => {
  assert.deepEqual(validateBackupPayload({ tickets: {}, inventory: [], customers: [] }), ['La proprietà tickets deve essere una lista.']);
});

test('validateBackupPayload rejects malformed settings', () => {
  assert.deepEqual(validateBackupPayload({ settings: [] }), ['La proprietà settings deve essere un oggetto.']);
});
