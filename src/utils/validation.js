export const VALID_PRIORITIES = Object.freeze(['Bassa', 'Media', 'Alta']);
export const VALID_STATUSES = Object.freeze(['Aperto', 'In lavorazione', 'Chiuso']);
export const MAX_TEXT_LENGTHS = Object.freeze({ customerName: 80, phone: 30, device: 80, issue: 600, notes: 1000, code: 40, description: 160 });

function exceedsLength(value, max) {
  return String(value || '').trim().length > max;
}

function hasValidPhoneFormat(value) {
  const phone = String(value || '').trim();
  return !phone || /^[+()\d\s.-]{6,30}$/.test(phone);
}

function isFiniteNumber(value) {
  if (value === '' || value === null || value === undefined) return true;
  return Number.isFinite(Number(value));
}

function isFiniteNumber(value) {
  if (value === '' || value === null || value === undefined) return true;
  return Number.isFinite(Number(value));
}

export function validateTicketDraft(draft) {
  const errors = [];
  if (!String(draft.customerName || '').trim()) errors.push('Inserisci il nome cliente.');
  if (exceedsLength(draft.customerName, MAX_TEXT_LENGTHS.customerName)) errors.push('Il nome cliente è troppo lungo.');
  if (!hasValidPhoneFormat(draft.phone)) errors.push('Inserisci un telefono valido.');
  if (!String(draft.device || '').trim()) errors.push('Inserisci il dispositivo.');
  if (exceedsLength(draft.device, MAX_TEXT_LENGTHS.device)) errors.push('Il dispositivo è troppo lungo.');
  if (!String(draft.issue || '').trim()) errors.push('Descrivi il problema segnalato.');
  if (exceedsLength(draft.issue, MAX_TEXT_LENGTHS.issue)) errors.push('La descrizione del problema è troppo lunga.');
  if (exceedsLength(draft.notes, MAX_TEXT_LENGTHS.notes)) errors.push('Le note interne sono troppo lunghe.');
  if (!VALID_PRIORITIES.includes(draft.priority)) errors.push('Seleziona una priorità valida.');
  if (!isFiniteNumber(draft.estimate) || Number(draft.estimate || 0) < 0) errors.push('Il preventivo deve essere un numero positivo.');
  return errors;
}

export function validateInventoryDraft(draft) {
  const errors = [];
  if (!String(draft.code || '').trim()) errors.push('Inserisci il codice articolo.');
  if (exceedsLength(draft.code, MAX_TEXT_LENGTHS.code)) errors.push('Il codice articolo è troppo lungo.');
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
  if (payload?.settings !== undefined && (!payload.settings || typeof payload.settings !== 'object' || Array.isArray(payload.settings))) errors.push('La proprietà settings deve essere un oggetto.');
  return errors;
}
