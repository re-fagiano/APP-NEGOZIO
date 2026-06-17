import test from 'node:test';
import assert from 'node:assert/strict';
import { validateBackupPayload, validateInventoryDraft, validateTicketDraft } from '../src/utils/validation.js';

test('validateTicketDraft rejects incomplete tickets and invalid values', () => {
  const errors = validateTicketDraft({ customerName: '', device: '', issue: '', priority: 'Urgente', estimate: -1 });
  assert.equal(errors.length, 5);
});

test('validateInventoryDraft rejects missing article details and invalid quantities', () => {
  const errors = validateInventoryDraft({ code: '', description: '', price: -2, quantity: 1.5 });
  assert.equal(errors.length, 4);
});

test('validateBackupPayload rejects malformed backup collections', () => {
  assert.deepEqual(validateBackupPayload({ tickets: {}, inventory: [], customers: [] }), ['La proprietà tickets deve essere una lista.']);
});
