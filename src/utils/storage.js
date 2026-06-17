export const STORAGE_KEY = 'app-negozio-state-v1';

export const defaultState = Object.freeze({
  tickets: [],
  customers: [],
  inventory: [],
  settings: { shopName: 'FIXLAB', lowStockThreshold: 2 },
  updatedAt: null,
});

export function loadState(storage = globalThis.localStorage) {
  if (!storage) return structuredClone(defaultState);
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return structuredClone(defaultState);
  try {
    return normalizeState(JSON.parse(raw));
  } catch {
    return structuredClone(defaultState);
  }
}

export function saveState(state, storage = globalThis.localStorage) {
  const nextState = normalizeState({ ...state, updatedAt: new Date().toISOString() });
  storage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  return nextState;
}

export function normalizeState(state) {
  return {
    tickets: Array.isArray(state?.tickets) ? state.tickets.map(normalizeTicket) : [],
    customers: Array.isArray(state?.customers) ? state.customers.map(normalizeCustomer) : [],
    inventory: Array.isArray(state?.inventory) ? state.inventory.map(normalizeInventoryItem) : [],
    settings: { ...defaultState.settings, ...(state?.settings || {}) },
    updatedAt: state?.updatedAt || null,
  };
}

export function createId(prefix) {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${random}`;
}

export function normalizeTicket(ticket) {
  return {
    id: ticket.id || createId('TKT'),
    customerName: String(ticket.customerName || '').trim(),
    phone: String(ticket.phone || '').trim(),
    device: String(ticket.device || '').trim(),
    issue: String(ticket.issue || '').trim(),
    status: ticket.status || 'Aperto',
    priority: ticket.priority || 'Media',
    estimate: Number(ticket.estimate || 0),
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
    price: Number(item.price || 0),
    quantity: Number(item.quantity || 0),
  };
}
