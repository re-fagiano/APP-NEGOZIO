export const VALID_PRIORITIES = Object.freeze(['Bassa', 'Media', 'Alta']);
export const VALID_STATUSES = Object.freeze(['Aperto', 'In lavorazione', 'Chiuso']);

function isFiniteNumber(value) {
  if (value === '' || value === null || value === undefined) return true;
  return Number.isFinite(Number(value));
}

export function validateTicketDraft(draft) {
  const errors = [];
  if (!String(draft.customerName || '').trim()) errors.push('Inserisci il nome cliente.');
  if (!String(draft.device || '').trim()) errors.push('Inserisci il dispositivo.');
  if (!String(draft.issue || '').trim()) errors.push('Descrivi il problema segnalato.');
  if (!VALID_PRIORITIES.includes(draft.priority)) errors.push('Seleziona una priorità valida.');
  if (!isFiniteNumber(draft.estimate) || Number(draft.estimate || 0) < 0) errors.push('Il preventivo deve essere un numero positivo.');
  return errors;
}

export function validateInventoryDraft(draft) {
  const errors = [];
  if (!String(draft.code || '').trim()) errors.push('Inserisci il codice articolo.');
  if (!String(draft.description || '').trim()) errors.push('Inserisci la descrizione articolo.');
  if (!isFiniteNumber(draft.price) || Number(draft.price || 0) < 0) errors.push('Il prezzo deve essere un numero positivo.');
  if (!Number.isInteger(Number(draft.quantity || 0))) errors.push('La quantità deve essere un numero intero.');
  if (Number(draft.quantity || 0) < 0) errors.push('La quantità non può essere negativa.');
  return errors;
}

export function validateSettingsDraft(draft) {
  const errors = [];
  if (!String(draft.shopName || '').trim()) errors.push('Inserisci il nome negozio.');
  if (!Number.isInteger(Number(draft.lowStockThreshold || 0))) errors.push('La soglia scorte deve essere un numero intero.');
  if (Number(draft.lowStockThreshold || 0) < 0) errors.push('La soglia scorte non può essere negativa.');
  return errors;
}

export function validateBackupPayload(payload) {
  const errors = [];
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) errors.push('Il backup deve essere un oggetto JSON.');
  if (payload && payload.tickets !== undefined && !Array.isArray(payload.tickets)) errors.push('La proprietà tickets deve essere una lista.');
  if (payload && payload.inventory !== undefined && !Array.isArray(payload.inventory)) errors.push('La proprietà inventory deve essere una lista.');
  if (payload && payload.customers !== undefined && !Array.isArray(payload.customers)) errors.push('La proprietà customers deve essere una lista.');
  if (Array.isArray(payload?.tickets) && payload.tickets.some((ticket) => !ticket || typeof ticket !== 'object' || Array.isArray(ticket))) errors.push('Ogni ticket del backup deve essere un oggetto.');
  if (Array.isArray(payload?.inventory) && payload.inventory.some((item) => !item || typeof item !== 'object' || Array.isArray(item))) errors.push('Ogni articolo del backup deve essere un oggetto.');
  if (Array.isArray(payload?.customers) && payload.customers.some((customer) => !customer || typeof customer !== 'object' || Array.isArray(customer))) errors.push('Ogni cliente del backup deve essere un oggetto.');
  if (payload?.settings !== undefined && (!payload.settings || typeof payload.settings !== 'object' || Array.isArray(payload.settings))) errors.push('La proprietà settings deve essere un oggetto.');
  return errors;
}
