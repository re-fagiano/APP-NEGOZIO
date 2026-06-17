# Roadmap per rendere APP-NEGOZIO solida ed efficace

## Criticità principali

1. **Persistenza solo locale**: `localStorage` è utile per partire, ma non basta per dati reali perché non offre backup centralizzato, multiutente, permessi o recupero affidabile.
2. **Dominio ancora troppo monolitico**: la UI principale contiene ancora rendering, eventi e logica applicativa nello stesso file. Va separata in moduli o componenti quando si aggiungono funzioni.
3. **Validazione minima**: i dati devono essere validati prima di entrare nello stato e prima di importare backup. È stato introdotto un primo livello di validazione, ma servono regole di business più precise.
4. **Assenza autenticazione e ruoli**: per un uso in negozio con dati cliente reali servono login, ruoli operatore/admin e audit log.
5. **Nessuna sincronizzazione cloud**: per evitare perdita dati servono database, backup automatici e procedure di ripristino.
6. **Test UI non ancora presenti**: i test attuali coprono utility e sicurezza di base; per regressioni reali servono test end-to-end su flussi ticket/magazzino.

## Migliorie applicate in questo passaggio

- Validazione centralizzata per ticket, articoli magazzino e payload backup.
- Messaggi utente non bloccanti con area `role="alert"`.
- Test del resolver reale del dev server, evitando duplicazione della logica nel test.
- Separazione del resolver percorsi in un modulo riusabile.

## Priorità prossime

1. Estrarre ticket, magazzino e dashboard in moduli/componenti separati.
2. Aggiungere un backend con database SQLite/PostgreSQL e migrazione dati da `localStorage`.
3. Aggiungere autenticazione, ruoli e log operazioni sensibili.
4. Aggiungere Playwright o test browser equivalenti per i flussi principali.
5. Introdurre import/export versionato dei backup con numero schema e migrazioni.
