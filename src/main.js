import { loadState, saveState, createId, normalizeState } from './utils/storage.js';
import { downloadText, toCsv } from './utils/export.js';
import { escapeAttribute, escapeHtml } from './utils/sanitize.js';
import { validateBackupPayload, validateInventoryDraft, validateSettingsDraft, validateTicketDraft, VALID_STATUSES } from './utils/validation.js';

let state = loadState();
let filter = '';
let feedback = null;

const app = document.querySelector('#app');

function persist(message = null) {
  try {
    state = saveState(state);
    feedback = message;
  } catch {
    state = normalizeState(state);
    feedback = { type: 'error', text: 'Dati aggiornati solo in memoria: impossibile salvare nel browser.' };
  }
  render();
}

function showFeedback(type, text) {
  feedback = { type, text };
  render();
}

function addTicket(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  const errors = validateTicketDraft(data);
  if (errors.length) {
    showFeedback('error', errors.join(' '));
    return;
  }
  state.tickets.unshift({
    id: createId('TKT'),
    customerName: data.customerName,
    phone: data.phone,
    device: data.device,
    issue: data.issue,
    priority: data.priority,
    status: 'Aperto',
    estimate: Number(data.estimate || 0),
    notes: data.notes,
    createdAt: new Date().toISOString(),
  });
  event.currentTarget.reset();
  persist({ type: 'success', text: 'Ticket creato correttamente.' });
}

function addInventory(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  const errors = validateInventoryDraft(data);
  if (errors.length) {
    showFeedback('error', errors.join(' '));
    return;
  }
  state.inventory.unshift({
    id: createId('ART'),
    position: data.position,
    code: data.code,
    description: data.description,
    price: Number(data.price || 0),
    quantity: Number(data.quantity || 0),
  });
  event.currentTarget.reset();
  persist({ type: 'success', text: 'Articolo aggiunto al magazzino.' });
}

function setTicketStatus(id, status) {
  if (!VALID_STATUSES.includes(status)) {
    showFeedback('error', 'Stato ticket non valido.');
    return;
  }
  state.tickets = state.tickets.map((ticket) => (ticket.id === id ? { ...ticket, status } : ticket));
  persist({ type: 'success', text: 'Stato ticket aggiornato.' });
}

function deleteTicket(id) {
  const ticket = state.tickets.find((item) => item.id === id);
  if (!ticket) return;
  const confirmed = globalThis.confirm?.(`Eliminare il ticket ${ticket.id} di ${ticket.customerName}?`) ?? true;
  if (!confirmed) return;
  state.tickets = state.tickets.filter((item) => item.id !== id);
  persist({ type: 'success', text: 'Ticket eliminato.' });
}

function updateSettings(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  const errors = validateSettingsDraft(data);
  if (errors.length) {
    showFeedback('error', errors.join(' '));
    return;
  }
  state.settings = {
    ...state.settings,
    shopName: data.shopName.trim(),
    lowStockThreshold: Number(data.lowStockThreshold || 0),
  };
  persist({ type: 'success', text: 'Impostazioni salvate.' });
}

function backupJson() {
  downloadText(`app-negozio-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(state, null, 2));
}

function exportTicketsCsv() {
  downloadText('ticket.csv', toCsv(state.tickets, ['id', 'customerName', 'phone', 'device', 'issue', 'priority', 'status', 'estimate', 'createdAt']), 'text/csv');
}

function restoreBackup(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  file.text()
    .then((content) => {
      let payload;
      try {
        payload = JSON.parse(content);
      } catch {
        showFeedback('error', 'Il file selezionato non contiene un JSON valido.');
        return;
      }
      const errors = validateBackupPayload(payload);
      if (errors.length) {
        showFeedback('error', errors.join(' '));
        return;
      }
      state = normalizeState(payload);
      persist({ type: 'success', text: 'Backup ripristinato correttamente.' });
    })
    .catch(() => showFeedback('error', 'Impossibile leggere il file di backup.'));
}

function dashboard() {
  const openTickets = state.tickets.filter((ticket) => ticket.status !== 'Chiuso').length;
  const urgentTickets = state.tickets.filter((ticket) => ticket.priority === 'Alta').length;
  const lowStock = state.inventory.filter((item) => item.quantity <= state.settings.lowStockThreshold).length;
  const revenue = state.tickets.reduce((sum, ticket) => sum + Number(ticket.estimate || 0), 0);
  return { openTickets, urgentTickets, lowStock, revenue };
}

function render() {
  const stats = dashboard();
  const visibleTickets = state.tickets.filter((ticket) => JSON.stringify(ticket).toLowerCase().includes(filter.toLowerCase()));
  app.innerHTML = `
    <header class="hero">
      <div>
        <p class="eyebrow">Gestionale negozio</p>
        <h1>${escapeHtml(state.settings.shopName)}</h1>
        <p>Ticket riparazioni, clienti, magazzino e backup locale in un'unica dashboard.</p>
      </div>
      <div class="actions">
        <button id="backup">Scarica backup JSON</button>
        <button id="csv">Esporta ticket CSV</button>
        <label class="file">Ripristina JSON<input id="restore" type="file" accept="application/json" /></label>
      </div>
    </header>
    ${feedback ? `<p class="feedback ${escapeAttribute(feedback.type)}" role="status">${escapeHtml(feedback.text)}</p>` : ''}
    <section class="stats">
      <article><strong>${stats.openTickets}</strong><span>Ticket aperti</span></article>
      <article><strong>${stats.urgentTickets}</strong><span>Priorità alta</span></article>
      <article><strong>${stats.lowStock}</strong><span>Scorte basse</span></article>
      <article><strong>€ ${stats.revenue.toFixed(2)}</strong><span>Preventivi totali</span></article>
    </section>
    <main class="grid">
      <section class="panel">
        <h2>Impostazioni negozio</h2>
        <form id="settings-form" class="form">
          <input name="shopName" value="${escapeAttribute(state.settings.shopName)}" placeholder="Nome negozio" required />
          <input name="lowStockThreshold" type="number" step="1" min="0" value="${Number(state.settings.lowStockThreshold || 0)}" placeholder="Soglia scorte basse" />
          <button type="submit">Salva impostazioni</button>
        </form>
      </section>
      <section class="panel">
        <h2>Nuovo ticket</h2>
        <form id="ticket-form" class="form">
          <input name="customerName" placeholder="Cliente" required />
          <input name="phone" placeholder="Telefono" />
          <input name="device" placeholder="Dispositivo" required />
          <textarea name="issue" placeholder="Problema segnalato" required></textarea>
          <select name="priority"><option>Media</option><option>Alta</option><option>Bassa</option></select>
          <input name="estimate" type="number" step="0.01" min="0" placeholder="Preventivo €" />
          <textarea name="notes" placeholder="Note interne"></textarea>
          <button type="submit">Crea ticket</button>
        </form>
      </section>
      <section class="panel wide">
        <div class="panel-header"><h2>Ticket</h2><input id="search" value="${escapeAttribute(filter)}" placeholder="Cerca ticket..." /></div>
        <div class="cards">${visibleTickets.map(ticketTemplate).join('') || '<p class="empty">Nessun ticket presente.</p>'}</div>
      </section>
      <section class="panel">
        <h2>Magazzino rapido</h2>
        <form id="inventory-form" class="form">
          <input name="position" placeholder="Posizione" />
          <input name="code" placeholder="Codice" required />
          <input name="description" placeholder="Descrizione" required />
          <input name="price" type="number" step="0.01" min="0" placeholder="Prezzo" />
          <input name="quantity" type="number" step="1" placeholder="Quantità" />
          <button type="submit">Aggiungi articolo</button>
        </form>
        <ul class="inventory">${state.inventory.map(itemTemplate).join('') || '<li>Nessun articolo.</li>'}</ul>
      </section>
    </main>`;

  document.querySelector('#ticket-form').addEventListener('submit', addTicket);
  document.querySelector('#inventory-form').addEventListener('submit', addInventory);
  document.querySelector('#settings-form').addEventListener('submit', updateSettings);
  document.querySelector('#backup').addEventListener('click', backupJson);
  document.querySelector('#csv').addEventListener('click', exportTicketsCsv);
  document.querySelector('#restore').addEventListener('change', restoreBackup);
  document.querySelector('#search').addEventListener('input', (event) => {
    const cursor = event.target.selectionStart;
    filter = event.target.value;
    render();
    const search = document.querySelector('#search');
    search.focus();
    search.setSelectionRange(cursor, cursor);
  });
  document.querySelectorAll('[data-status]').forEach((button) => button.addEventListener('click', () => setTicketStatus(button.dataset.id, button.dataset.status)));
  document.querySelectorAll('[data-delete]').forEach((button) => button.addEventListener('click', () => deleteTicket(button.dataset.delete)));
}

function ticketTemplate(ticket) {
  const priorityClass = escapeAttribute(String(ticket.priority || '').toLowerCase());
  const ticketId = escapeAttribute(ticket.id);
  return `<article class="ticket ${priorityClass}">
    <div><strong>${escapeHtml(ticket.customerName)}</strong><span>${escapeHtml(ticket.device)}</span></div>
    <p>${escapeHtml(ticket.issue)}</p>
    ${ticket.notes ? `<p class="note"><strong>Note:</strong> ${escapeHtml(ticket.notes)}</p>` : ''}
    <small>${escapeHtml(ticket.id)} · ${escapeHtml(ticket.priority)} · ${escapeHtml(ticket.status)} · € ${Number(ticket.estimate || 0).toFixed(2)}</small>
    <div class="row">
      <button data-id="${ticketId}" data-status="In lavorazione">In lavorazione</button>
      <button data-id="${ticketId}" data-status="Chiuso">Chiudi</button>
      <button class="danger" data-delete="${ticketId}">Elimina</button>
    </div>
  </article>`;
}

function itemTemplate(item) {
  const low = item.quantity <= state.settings.lowStockThreshold ? ' class="low"' : '';
  return `<li${low}><strong>${escapeHtml(item.code)}</strong> ${escapeHtml(item.description)}<span>${Number(item.quantity || 0)} pz · € ${Number(item.price || 0).toFixed(2)}</span></li>`;
}

render();
