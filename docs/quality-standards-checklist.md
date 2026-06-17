# Checklist standard qualità APP-NEGOZIO

Questa checklist serve per ricontrollare il progetto a ogni incremento e ridurre regressioni.

## Sicurezza dati e frontend

- Escape HTML e attributi per qualunque dato controllato dall'utente.
- Neutralizzazione delle formule nei CSV per evitare CSV/spreadsheet injection.
- Nessuna chiave o segreto nel frontend o negli export.
- Import backup validato prima della normalizzazione e del salvataggio.

## Robustezza runtime

- L'app deve restare utilizzabile se `localStorage` non è disponibile o supera quota.
- I dati persistiti devono essere normalizzati prima di uso e salvataggio.
- Gli identificativi devono preferire entropia crittografica quando disponibile.
- Il dev server non deve uscire dalla root servita e deve gestire URL malformati senza crash.

## Qualità operativa

- Test automatici su sanitizzazione, validazione, export, storage e resolver percorsi.
- Build ripetibile senza dipendenze non necessarie.
- Documentazione aggiornata a ogni cambio architetturale o di sicurezza.
