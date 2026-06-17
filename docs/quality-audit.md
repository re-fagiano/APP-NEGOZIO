# Audit tecnico APP-NEGOZIO

## Punti deboli individuati e corretti

1. **Rendering HTML non sanificato**: i dati inseriti dall'utente venivano interpolati dentro template HTML. È stato aggiunto escaping centralizzato per testo e attributi.
2. **Ripristino backup fragile**: un JSON non valido poteva interrompere il flusso UI. Ora l'import intercetta l'errore e mostra un messaggio comprensibile.
3. **Dev server vulnerabile a path traversal**: la risoluzione del percorso non garantiva pienamente che il file richiesto restasse nella root servita. Ora viene usato un resolver con root assoluta e blocco dei percorsi esterni.
4. **Copertura test limitata**: sono stati aggiunti test mirati per escaping HTML/attributi e prevenzione path traversal.

## Prossimi miglioramenti consigliati

- Sostituire il rendering basato su `innerHTML` con componenti DOM o un framework quando il progetto crescerà.
- Aggiungere un backend con autenticazione se i ticket contengono dati reali dei clienti.
- Aggiungere import CSV per magazzino e ticket se serve migrare dati da fogli di calcolo.
- Aggiungere screenshot/regression test UI quando sarà disponibile un browser in pipeline CI.
