# Glossario

Termini utili utilizzati per creare il progetto

- **Ref** (`ref`): Serve a rendere reattiva una variabile o a creare un riferimento diretto a un elemento del DOM.
- **onMounted**: Hook eseguito quando la pagina è caricata e l'HTML è pronto.
- **onUnmounted**: Hook eseguito alla distruzione del componente (rimozione filtri/listener).
- **RequestAnimationFrame** (`raf`): Funzione nativa per sincronizzare i calcoli con i frame dello schermo a 60fps (evita scatti).
- **Context** (`ctx`): Oggetto che fornisce i metodi di disegno 2D sulla superficie del canvas.
- **SessionStorage**: Memoria temporanea del browser. Salva i dati solo finché la scheda o la finestra rimane aperta; se chiudi il browser, i dati si cancellano.
- **Router-view**: Il componente "contenitore" di Vue Router. Mostra dinamicamente la pagina corrispondente all'URL attuale (es. cambia contenuto quando passi da Home a About).
- **DOM**: Il DOM (Document Object Model) è la struttura a albero che il browser genera automaticamente quando carica una pagina HTML, permette a linguaggi come JavaScript, Vue, GSAP ecc di dialogare con la pagina web, consentendo di modificare testi, stili, classi o attributi in tempo reale senza dover ricaricare la pagina. esempio classico:
    ```
    <!DOCTYPE html>
    <html>
    <head>
        <title>Sito</title>
    </head>
    <body>
        <h1>Titolo</h1>
        <a href="#">Link</a>
    </body>
    </html>
    ```
