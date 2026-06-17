import { loadState, saveState, createId } from './utils/storage.js';
import { downloadText, toCsv } from './utils/export.js';
import './styles.css';

let state = loadState();
let filter = '';

const app = document.querySelector('#app');

function persist() {
  state = saveState(state);
  render();
}

function addTicket(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
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
  persist();
}

function addInventory(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  state.inventory.unshift({
    id: createId('ART'),
    position: data.position,
    code: data.code,
    description: data.description,
    price: Number(data.price || 0),
    quantity: Number(data.quantity || 0),
  });
  event.currentTarget.reset();
  persist();
}

function setTicketStatus(id, status) {
  state.tickets = state.tickets.map((ticket) => (ticket.id === id ? { ...ticket, status } : ticket));
  persist();
}

function deleteTicket(id) {
  state.tickets = state.tickets.filter((ticket) => ticket.id !== id);
  persist();
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
  file.text().then((content) => {
    state = JSON.parse(content);
    persist();
  });
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
        <h1>${state.settings.shopName}</h1>
        <p>Ticket riparazioni, clienti, magazzino e backup locale in un'unica dashboard.</p>
      </div>
      <div class="actions">
        <button id="backup">Scarica backup JSON</button>
        <button id="csv">Esporta ticket CSV</button>
        <label class="file">Ripristina JSON<input id="restore" type="file" accept="application/json" /></label>
      </div>
    </header>
    <section class="stats">
      <article><strong>${stats.openTickets}</strong><span>Ticket aperti</span></article>
      <article><strong>${stats.urgentTickets}</strong><span>Priorità alta</span></article>
      <article><strong>${stats.lowStock}</strong><span>Scorte basse</span></article>
      <article><strong>€ ${stats.revenue.toFixed(2)}</strong><span>Preventivi totali</span></article>
    </section>
    <main class="grid">
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
        <div class="panel-header"><h2>Ticket</h2><input id="search" value="${filter}" placeholder="Cerca ticket..." /></div>
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
  document.querySelector('#backup').addEventListener('click', backupJson);
  document.querySelector('#csv').addEventListener('click', exportTicketsCsv);
  document.querySelector('#restore').addEventListener('change', restoreBackup);
  document.querySelector('#search').addEventListener('input', (event) => { filter = event.target.value; render(); });
  document.querySelectorAll('[data-status]').forEach((button) => button.addEventListener('click', () => setTicketStatus(button.dataset.id, button.dataset.status)));
  document.querySelectorAll('[data-delete]').forEach((button) => button.addEventListener('click', () => deleteTicket(button.dataset.delete)));
}

function ticketTemplate(ticket) {
  return `<article class="ticket ${ticket.priority.toLowerCase()}">
    <div><strong>${ticket.customerName}</strong><span>${ticket.device}</span></div>
    <p>${ticket.issue}</p>
    <small>${ticket.id} · ${ticket.priority} · ${ticket.status} · € ${Number(ticket.estimate || 0).toFixed(2)}</small>
    <div class="row">
      <button data-id="${ticket.id}" data-status="In lavorazione">In lavorazione</button>
      <button data-id="${ticket.id}" data-status="Chiuso">Chiudi</button>
      <button class="danger" data-delete="${ticket.id}">Elimina</button>
    </div>
  </article>`;
}

function itemTemplate(item) {
  const low = item.quantity <= state.settings.lowStockThreshold ? ' class="low"' : '';
  return `<li${low}><strong>${item.code}</strong> ${item.description}<span>${item.quantity} pz · € ${Number(item.price || 0).toFixed(2)}</span></li>`;
}

render();
