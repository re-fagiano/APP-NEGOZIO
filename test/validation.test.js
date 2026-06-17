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

test('validateBackupPayload ensures backup arrays contain only objects', () => {
  assert.deepEqual(validateBackupPayload({ tickets: [null], inventory: [[]], customers: ['bad'] }), [
    'Ogni ticket del backup deve essere un oggetto.',
    'Ogni articolo del backup deve essere un oggetto.',
    'Ogni cliente del backup deve essere un oggetto.',
  ]);
});

test('validateTicketDraft rejects invalid phone numbers and excessive text lengths', () => {
  const errors = validateTicketDraft({
    customerName: 'A'.repeat(81),
    phone: 'abc',
    device: 'D'.repeat(81),
    issue: 'I'.repeat(601),
    notes: 'N'.repeat(1001),
    priority: 'Media',
    estimate: 0,
  });
  assert.deepEqual(errors, [
    'Il nome cliente è troppo lungo.',
    'Inserisci un telefono valido.',
    'Il dispositivo è troppo lungo.',
    'La descrizione del problema è troppo lunga.',
    'Le note interne sono troppo lunghe.',
  ]);
});

test('validateInventoryDraft rejects excessive article text lengths', () => {
  assert.deepEqual(validateInventoryDraft({ code: 'C'.repeat(41), description: 'D'.repeat(161), price: 1, quantity: 1 }), [
    'Il codice articolo è troppo lungo.',
    'La descrizione articolo è troppo lunga.',
  ]);
});
