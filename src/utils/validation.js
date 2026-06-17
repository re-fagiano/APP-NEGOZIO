export const VALID_PRIORITIES = Object.freeze(['Bassa', 'Media', 'Alta']);
export const VALID_STATUSES = Object.freeze(['Aperto', 'In lavorazione', 'Chiuso']);

export function validateTicketDraft(draft) {
  const errors = [];
  if (!String(draft.customerName || '').trim()) errors.push('Inserisci il nome cliente.');
  if (!String(draft.device || '').trim()) errors.push('Inserisci il dispositivo.');
  if (!String(draft.issue || '').trim()) errors.push('Descrivi il problema segnalato.');
  if (!VALID_PRIORITIES.includes(draft.priority)) errors.push('Seleziona una priorità valida.');
  if (Number(draft.estimate || 0) < 0) errors.push('Il preventivo non può essere negativo.');
  return errors;
}

export function validateInventoryDraft(draft) {
  const errors = [];
  if (!String(draft.code || '').trim()) errors.push('Inserisci il codice articolo.');
  if (!String(draft.description || '').trim()) errors.push('Inserisci la descrizione articolo.');
  if (Number(draft.price || 0) < 0) errors.push('Il prezzo non può essere negativo.');
  if (!Number.isInteger(Number(draft.quantity || 0))) errors.push('La quantità deve essere un numero intero.');
  return errors;
}

export function validateBackupPayload(payload) {
  const errors = [];
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) errors.push('Il backup deve essere un oggetto JSON.');
  if (payload && payload.tickets !== undefined && !Array.isArray(payload.tickets)) errors.push('La proprietà tickets deve essere una lista.');
  if (payload && payload.inventory !== undefined && !Array.isArray(payload.inventory)) errors.push('La proprietà inventory deve essere una lista.');
  if (payload && payload.customers !== undefined && !Array.isArray(payload.customers)) errors.push('La proprietà customers deve essere una lista.');
  return errors;
}
