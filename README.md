# APP-NEGOZIO

Nuova repository per il gestionale ticket negozio ispirato a `re-fagiano/GESTIONALEticket-google`, con una base frontend statica servita da script Node leggeri e migliorie operative già incluse.

## Funzionalità

- Dashboard con ticket aperti, urgenze, scorte basse e totale preventivi.
- Creazione e ricerca ticket con stati `Aperto`, `In lavorazione` e `Chiuso`.
- Mini magazzino con evidenza delle scorte sotto soglia.
- Backup JSON, ripristino JSON ed export CSV dei ticket.
- Persistenza locale tramite `localStorage`, utile per uso immediato senza backend.
- Controlli statici per evitare log/debug e variabili chiave esposte nel frontend.

## Sviluppo

```bash
npm install
npm run dev
```

## Verifiche

```bash
npm test
npm run lint
npm run build
```

## Note importazione

Il clone Git diretto dal container è stato impedito dal proxy di rete (`CONNECT tunnel failed, response 403`). La struttura pubblica del progetto sorgente è stata consultata da GitHub e questa repository contiene una reimplementazione pulita e pronta da estendere.
