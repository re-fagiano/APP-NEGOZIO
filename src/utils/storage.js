import { VALID_PRIORITIES, VALID_STATUSES } from './validation.js';

export const STORAGE_KEY = 'app-negozio-state-v1';

export const defaultState = Object.freeze({
  tickets: [],
  customers: [],
  inventory: [],
  settings: { shopName: 'FIXLAB', lowStockThreshold: 2 },
  updatedAt: null,
});

function cloneDefaultState() {
  return normalizeState(defaultState);
}

export function loadState(storage = globalThis.localStorage) {
  if (!storage) return cloneDefaultState();
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return cloneDefaultState();
    return normalizeState(JSON.parse(raw));
  } catch {
    return cloneDefaultState();
  }
}

export function saveState(state, storage = globalThis.localStorage) {
  const nextState = normalizeState({ ...state, updatedAt: new Date().toISOString() });
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(nextState));
  } catch {
    // Keep returning the normalized state so the UI remains usable even if storage is unavailable or full.
  }
  return nextState;
}

export function normalizeState(state) {
  return {
    tickets: Array.isArray(state?.tickets) ? state.tickets.map(normalizeTicket) : [],
    customers: Array.isArray(state?.customers) ? state.customers.map(normalizeCustomer) : [],
    inventory: Array.isArray(state?.inventory) ? state.inventory.map(normalizeInventoryItem) : [],
    settings: normalizeSettings(state?.settings),
    updatedAt: typeof state?.updatedAt === 'string' ? state.updatedAt : null,
  };
}

export function createId(prefix) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${randomToken()}`;
}

function randomToken() {
  const cryptoApi = globalThis.crypto;
  if (cryptoApi?.getRandomValues) {
    const bytes = new Uint8Array(4);
    cryptoApi.getRandomValues(bytes);
    return [...bytes].map((byte) => byte.toString(36).padStart(2, '0')).join('').toUpperCase();
  }
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

function normalizeSettings(settings) {
  const threshold = Math.max(0, Math.trunc(safeNumber(settings?.lowStockThreshold, defaultState.settings.lowStockThreshold)));
  return {
    shopName: String(settings?.shopName || defaultState.settings.shopName).trim() || defaultState.settings.shopName,
    lowStockThreshold: threshold,
  };
}

function safeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function normalizeTicket(ticket) {
  const status = VALID_STATUSES.includes(ticket.status) ? ticket.status : 'Aperto';
  const priority = VALID_PRIORITIES.includes(ticket.priority) ? ticket.priority : 'Media';
  return {
    id: ticket.id || createId('TKT'),
    customerName: String(ticket.customerName || '').trim(),
    phone: String(ticket.phone || '').trim(),
    device: String(ticket.device || '').trim(),
    issue: String(ticket.issue || '').trim(),
    status,
    priority,
    estimate: Math.max(0, safeNumber(ticket.estimate)),
    createdAt: ticket.createdAt || new Date().toISOString(),
    notes: String(ticket.notes || '').trim(),
  };
}

export function normalizeCustomer(customer) {
  return {
    id: customer.id || createId('CLI'),
    name: String(customer.name || '').trim(),
    phone: String(customer.phone || '').trim(),
    email: String(customer.email || '').trim(),
  };
}

export function normalizeInventoryItem(item) {
  return {
    id: item.id || createId('ART'),
    position: String(item.position || '').trim(),
    code: String(item.code || '').trim().toUpperCase(),
    description: String(item.description || '').trim(),
    price: Math.max(0, safeNumber(item.price)),
    quantity: Math.max(0, Math.trunc(safeNumber(item.quantity))),
  };
}
