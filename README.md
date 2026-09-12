# scuolaia — prototipo navigabile

Prototipo front-end statico installabile come web app. Il file principale è `index.html`.

## Funzioni già presenti

- calcolatrice base in stile iPhone;
- modalità calcolatrice scientifica completa;
- codice di ingresso da entrambe le modalità: `##**`;
- ritorno alla calcolatrice dall'icona in alto o dalle impostazioni;
- home con richiesta libera;
- riassunti, traduzioni ed esercizi in modalità demo;
- caricamento file, drag and drop e fotocamera;
- lettura vocale del testo;
- suoni morbidi attivabili e disattivabili;
- icona calcolatrice per l'installazione sul telefono;
- funzionamento offline dopo il primo caricamento grazie al service worker.

## Come provarla in locale

```bash
python3 -m http.server 4173
```

Apri la preview del server. Il service worker per l'uso offline e l'installazione funzionerà in modo completo quando il sito sarà pubblicato in HTTPS.

## Pubblicarla online e condividerla

### Metodo consigliato: GitHub Pages

1. Crea un account su GitHub.
2. Crea un nuovo repository, per esempio `calcolatrice-scuolaia`.
3. Carica nella cartella principale questi file:
   - `index.html`
   - `manifest.webmanifest`
   - `service-worker.js`
   - `icon-192.png`
   - `icon-512.png`
   - `apple-touch-icon.png`
4. Apri **Settings → Pages**.
5. Alla voce di pubblicazione scegli **Deploy from a branch**, seleziona `main` e la cartella `/root`.
6. Salva e attendi la pubblicazione. GitHub mostrerà un indirizzo simile a:

   `https://tuonome.github.io/calcolatrice-scuolaia/`

7. Condividi quell'indirizzo con gli altri.

Ogni volta che vuoi modificare il progetto, cambi `index.html` o gli altri file su GitHub, fai **Commit changes** e GitHub aggiorna il sito. Prima di una modifica importante puoi usare **Duplicate repository** o creare un branch, così hai sempre una copia recuperabile.

### Metodo più semplice: Netlify Drop

1. Vai su Netlify Drop.
2. Trascina l'intera cartella del progetto nella pagina.
3. Netlify restituisce subito un link HTTPS condivisibile.
4. Per aggiornare il sito, trascina di nuovo la cartella aggiornata.

Per conservare la cronologia delle modifiche è comunque meglio usare GitHub.

## Installarla su iPhone

1. Apri il link pubblicato con **Safari**, non da un browser incorporato in WhatsApp o Instagram.
2. Tocca **Condividi**.
3. Scegli **Aggiungi alla schermata Home**.
4. Lascia il nome `Calcolatrice` e conferma.
5. Comparirà l'icona della calcolatrice. Aprendo l'icona si avrà un'esperienza simile a un'app e, dopo il primo caricamento, sarà disponibile anche offline.

## Installarla su Android

1. Apri il link con Chrome.
2. Tocca il menu `⋮`.
3. Scegli **Installa app** oppure **Aggiungi a schermata Home**.
4. Conferma il nome e l'icona.

Il sito deve essere pubblicato in HTTPS perché manifest e service worker funzionino correttamente. GitHub Pages e Netlify forniscono HTTPS automaticamente.

## Da collegare per il prodotto reale

1. OCR per immagini/PDF e gestione di orientamento, ritaglio e qualità della foto.
2. Backend AI con prompt separati per riassunto, mappa/diagramma, traduzione, esercizi e ricerca.
3. Ricerca web con fonti e citazioni.
4. Account, cronologia, cancellazione dati e crittografia.
5. Moderazione, consenso e conformità GDPR per utenti minorenni e scuole.
6. Test con studenti e insegnanti, accessibilità WCAG e modalità offline completa.
7. Sostituzione dei testi demo con risposte del backend: il prototipo attuale non invia documenti a nessun servizio.
