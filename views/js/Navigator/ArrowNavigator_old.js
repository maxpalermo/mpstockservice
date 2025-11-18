// NavigatoreInput.js

/**
 * Classe per gestire la navigazione tramite tasti freccia (Su/Giù)
 * tra un set di elementi selezionati tramite selettore CSS.
 */
export default class NavigatoreInput {
    /**
     * Crea un'istanza di NavigatoreInput.
     * @param {string} selector - Il selettore CSS per identificare gli elementi navigabili.
     */
    constructor(selector) {
        if (!selector) {
            throw new Error("Il selettore CSS è obbligatorio per inizializzare NavigatoreInput.");
        }
        this.selector = selector;
        this.elementi = []; // Array che conterrà gli elementi DOM

        // È fondamentale fare il bind di 'this' per il metodo che gestirà l'evento,
        // altrimenti 'this' all'interno di gestisciKeyDown non si riferirà all'istanza della classe.
        this.gestisciKeyDown = this.gestisciKeyDown.bind(this);

        // Inizializza trovando gli elementi e aggiungendo il listener
        this.aggiornaElementi();
        this.aggiungiListener();

        console.log(`NavigatoreInput inizializzato per il selettore: "${this.selector}". Trovati ${this.elementi.length} elementi.`);
    }

    /**
     * Trova (o ri-trova) gli elementi nel DOM che corrispondono al selettore
     * e li memorizza nell'array this.elementi.
     */
    aggiornaElementi() {
        const elementiNodeList = document.querySelectorAll(this.selector);
        this.elementi = Array.from(elementiNodeList); // Converte NodeList in Array
        // console.log("Elementi navigabili aggiornati:", this.elementi);
    }

    /**
     * Aggiunge il listener per l'evento 'keydown' al documento.
     */
    aggiungiListener() {
        // Aggiungiamo il listener al documento per catturare l'evento globalmente
        document.addEventListener("keydown", this.gestisciKeyDown);
        console.log("Listener 'keydown' aggiunto.");
    }

    /**
     * Rimuove il listener per l'evento 'keydown' dal documento.
     * Utile per pulire quando l'istanza non è più necessaria.
     */
    rimuoviListener() {
        document.removeEventListener("keydown", this.gestisciKeyDown);
        console.log("Listener 'keydown' rimosso.");
    }

    /**
     * Trova l'indice dell'elemento attualmente focalizzato all'interno dell'array this.elementi.
     * @returns {number} L'indice dell'elemento attivo, o -1 se nessuno degli elementi gestiti è attivo.
     */
    trovaIndiceElementoAttivo() {
        const elementoAttivo = document.activeElement;
        // Verifica se l'elemento attivo è presente nel nostro array di elementi gestiti
        if (elementoAttivo && this.elementi.includes(elementoAttivo)) {
            return this.elementi.indexOf(elementoAttivo);
        }
        return -1;
    }

    /**
     * Sposta il focus sull'elemento successivo nella lista, gestendo il loop.
     */
    vaiAlProssimo() {
        if (this.elementi.length === 0) return; // Nessun elemento da navigare

        let indiceCorrente = this.trovaIndiceElementoAttivo();
        // Se nessun elemento è attualmente selezionato (-1), partiamo virtualmente
        // da "prima del primo", così l'incremento porta a 0.
        if (indiceCorrente === -1) indiceCorrente = -1;

        // Calcola l'indice successivo usando il modulo per gestire il loop
        const indiceProssimo = (indiceCorrente + 1) % this.elementi.length;

        this._impostaFocus(this.elementi[indiceProssimo]);
    }

    /**
     * Sposta il focus sull'elemento precedente nella lista, gestendo il loop.
     */
    vaiAlPrecedente() {
        if (this.elementi.length === 0) return;

        let indiceCorrente = this.trovaIndiceElementoAttivo();
        // Se nessun elemento è attualmente selezionato (-1), partiamo virtualmente
        // da "dopo l'ultimo", così il decremento porta all'ultimo elemento.
        if (indiceCorrente === -1) indiceCorrente = 0; // Partire da 0 fa sì che (0 - 1 + N) % N dia N-1

        // Calcola l'indice precedente usando il modulo, aggiungendo la lunghezza
        // per gestire correttamente i numeri negativi prima del modulo.
        const indicePrecedente = (indiceCorrente - 1 + this.elementi.length) % this.elementi.length;

        this._impostaFocus(this.elementi[indicePrecedente]);
    }

    /**
     * Metodo helper privato per impostare il focus e selezionare il contenuto.
     * @private
     * @param {HTMLElement} elemento - L'elemento su cui impostare il focus.
     */
    _impostaFocus(elemento) {
        if (elemento) {
            console.log(`NavigatoreInput: Sposto focus su elemento con name="${elemento.name || "N/A"}", id="${elemento.id || "N/A"}"`);
            elemento.focus();
            // Se l'elemento ha un metodo select (es. input text, textarea), seleziona il contenuto
            if (typeof elemento.select === "function") {
                elemento.select();
            }
        }
    }

    /**
     * Gestore per l'evento 'keydown'. Controlla se il tasto premuto è Freccia Su o Giù
     * e se il focus è su uno degli elementi gestiti, quindi chiama la funzione di navigazione appropriata.
     * @param {KeyboardEvent} event - L'oggetto evento keydown.
     */
    gestisciKeyDown(event) {
        // Verifica se il focus è attualmente su uno degli elementi che gestiamo
        const indiceAttivo = this.trovaIndiceElementoAttivo();

        if (indiceAttivo !== -1) {
            // Il focus è su uno dei nostri elementi
            if (event.key === "ArrowDown") {
                event.preventDefault(); // Impedisce il comportamento di default (es. scroll)
                this.vaiAlProssimo();
            } else if (event.key === "ArrowUp") {
                event.preventDefault(); // Impedisce il comportamento di default
                this.vaiAlPrecedente();
            }
        }
        // Se il focus non è su uno dei nostri elementi, l'evento viene ignorato da questa classe.
    }

    /**
     * Metodo per distruggere l'istanza e pulire i listener.
     */
    distruggi() {
        this.rimuoviListener();
        this.elementi = []; // Svuota l'array
        console.log("NavigatoreInput distrutto.");
    }
}
