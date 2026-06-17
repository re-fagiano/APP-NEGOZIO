import { VALID_PRIORITIES, VALID_STATUSES } from './validation.js';

export const STORAGE_KEY = 'app-negozio-state-v1';
export const STORAGE_SCHEMA_VERSION = 1;

export const defaultState = Object.freeze({
  schemaVersion: STORAGE_SCHEMA_VERSION,
  tickets: [],
  customers: [],
  inventory: [],
  settings: { shopName: 'FIXLAB', lowStockThreshold: 2 },
  updatedAt: null,
});

function numberOrZero(value) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? Math.max(0, number) : 0;
}

function integerOrZero(value) {
  return Math.trunc(numberOrZero(value));
}

function getDefaultStorage() {
  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
}

export function loadState(storage = getDefaultStorage()) {
  if (!storage) return structuredClone(defaultState);
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return structuredClone(defaultState);
  try {
    return normalizeState(JSON.parse(raw));
  } catch {
    return structuredClone(defaultState);
  }
}

export function saveState(state, storage = getDefaultStorage()) {
  const nextState = normalizeState({ ...state, updatedAt: new Date().toISOString() });
  if (!storage) return nextState;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  } catch {
    throw new Error('Impossibile salvare lo stato nel browser.');
  }
  return nextState;
}

export function normalizeState(state) {
  return {
    schemaVersion: STORAGE_SCHEMA_VERSION,
    tickets: Array.isArray(state?.tickets) ? state.tickets.map(normalizeTicket) : [],
    customers: Array.isArray(state?.customers) ? state.customers.map(normalizeCustomer) : [],
    inventory: Array.isArray(state?.inventory) ? state.inventory.map(normalizeInventoryItem) : [],
    settings: normalizeSettings(state?.settings),
    updatedAt: state?.updatedAt || null,
  };
}

export function normalizeSettings(settings) {
  return {
    ...defaultState.settings,
    ...(settings || {}),
    shopName: String(settings?.shopName || defaultState.settings.shopName).trim(),
    lowStockThreshold: integerOrZero(settings?.lowStockThreshold ?? defaultState.settings.lowStockThreshold),
  };
}

export function createId(prefix) {
  if (globalThis.crypto?.randomUUID) return `${prefix}-${globalThis.crypto.randomUUID().toUpperCase()}`;
  const bytes = new Uint8Array(8);
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
    return `${prefix}-${Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
  }
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${random}`;
}

export function normalizeTicket(ticket = {}) {
  const source = ticket && typeof ticket === 'object' && !Array.isArray(ticket) ? ticket : {};
  return {
    id: source.id || createId('TKT'),
    customerName: String(source.customerName || '').trim(),
    phone: String(source.phone || '').trim(),
    device: String(source.device || '').trim(),
    issue: String(source.issue || '').trim(),
    status: VALID_STATUSES.includes(source.status) ? source.status : 'Aperto',
    priority: VALID_PRIORITIES.includes(source.priority) ? source.priority : 'Media',
    estimate: numberOrZero(source.estimate),
    createdAt: source.createdAt || new Date().toISOString(),
    notes: String(source.notes || '').trim(),
  };
}

export function normalizeCustomer(customer = {}) {
  const source = customer && typeof customer === 'object' && !Array.isArray(customer) ? customer : {};
  return {
    id: source.id || createId('CLI'),
    name: String(source.name || '').trim(),
    phone: String(source.phone || '').trim(),
    email: String(source.email || '').trim(),
  };
}

export function normalizeInventoryItem(item = {}) {
  const source = item && typeof item === 'object' && !Array.isArray(item) ? item : {};
  return {
    id: source.id || createId('ART'),
    position: String(source.position || '').trim(),
    code: String(source.code || '').trim().toUpperCase(),
    description: String(source.description || '').trim(),
    price: numberOrZero(source.price),
    quantity: integerOrZero(source.quantity),
  };
}
