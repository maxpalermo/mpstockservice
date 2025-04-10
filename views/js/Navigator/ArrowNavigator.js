// NavigatoreInput.js

/**
 * Classe per gestire la navigazione tramite tasti freccia (Su/Giù)
 * tra un set di elementi selezionati tramite selettore CSS.
 * Include la funzionalità per scorrere l'elemento nel viewport se non è visibile quando riceve il focus.
 */
export default class NavigatoreInput {
    /**
     * Crea un'istanza di NavigatoreInput.
     * @param {string} selector - Il selettore CSS per identificare gli elementi navigabili.
     * @param {object} options - Opzioni aggiuntive (es. { scrollBehavior: 'smooth' })
     */
    constructor(selector, options = {}) {
        if (!selector) {
            throw new Error("Il selettore CSS è obbligatorio per inizializzare NavigatoreInput.");
        }
        this.selector = selector;
        this.elementi = [];
        this.options = {
            scrollBehavior: "smooth", // Valore di default per lo scroll
            scrollBlock: "nearest",
            scrollInline: "nearest",
            ...options // Sovrascrive i default con le opzioni passate
        };

        // Bind di 'this' per il metodo che gestirà l'evento
        this.gestisciKeyDown = this.gestisciKeyDown.bind(this);

        // Inizializza
        this.aggiornaElementi();
        this.aggiungiListener();

        console.log(`NavigatoreInput inizializzato per: "${this.selector}". Opzioni scroll:`, this.options);
    }

    // --- Metodi Esistenti (aggiornaElementi, aggiungiListener, rimuoviListener, trovaIndiceElementoAttivo) ---
    /**
     * Trova (o ri-trova) gli elementi nel DOM che corrispondono al selettore
     * e li memorizza nell'array this.elementi.
     */
    aggiornaElementi() {
        const elementiNodeList = document.querySelectorAll(this.selector);
        this.elementi = Array.from(elementiNodeList);
        console.log(`NavigatoreInput: Trovati ${this.elementi.length} elementi.`);
    }

    /**
     * Aggiunge il listener per l'evento 'keydown' al documento.
     */
    aggiungiListener() {
        document.addEventListener("keydown", this.gestisciKeyDown);
        console.log("NavigatoreInput: Listener 'keydown' aggiunto.");
    }

    /**
     * Rimuove il listener per l'evento 'keydown' dal documento.
     */
    rimuoviListener() {
        document.removeEventListener("keydown", this.gestisciKeyDown);
        console.log("NavigatoreInput: Listener 'keydown' rimosso.");
    }

    /**
     * Trova l'indice dell'elemento attualmente focalizzato all'interno dell'array this.elementi.
     * @returns {number} L'indice dell'elemento attivo, o -1 se nessuno degli elementi gestiti è attivo.
     */
    trovaIndiceElementoAttivo() {
        const elementoAttivo = document.activeElement;
        if (elementoAttivo && this.elementi.includes(elementoAttivo)) {
            return this.elementi.indexOf(elementoAttivo);
        }
        return -1;
    }
    // --- Fine Metodi Esistenti ---

    /**
     * Sposta il focus sull'elemento successivo nella lista, gestendo il loop.
     */
    vaiAlProssimo() {
        if (this.elementi.length === 0) return;
        let indiceCorrente = this.trovaIndiceElementoAttivo();
        if (indiceCorrente === -1) indiceCorrente = -1; // Parte da -1 se nessun elemento attivo

        const indiceProssimo = (indiceCorrente + 1) % this.elementi.length;
        this._impostaFocus(this.elementi[indiceProssimo]);
    }

    /**
     * Sposta il focus sull'elemento precedente nella lista, gestendo il loop.
     */
    vaiAlPrecedente() {
        if (this.elementi.length === 0) return;
        let indiceCorrente = this.trovaIndiceElementoAttivo();
        if (indiceCorrente === -1) indiceCorrente = 0; // Parte da 0 se nessun elemento attivo

        const indicePrecedente = (indiceCorrente - 1 + this.elementi.length) % this.elementi.length;
        this._impostaFocus(this.elementi[indicePrecedente]);
    }

    /**
     * Controlla se un elemento è completamente visibile all'interno della viewport.
     * @private
     * @param {HTMLElement} element L'elemento da controllare.
     * @returns {boolean} True se l'elemento è completamente visibile, altrimenti false.
     */
    _isElementInViewport(element) {
        if (!element || typeof element.getBoundingClientRect !== "function") {
            return false;
        }
        const rect = element.getBoundingClientRect();
        return rect.top >= 0 && rect.left >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && rect.right <= (window.innerWidth || document.documentElement.clientWidth);
    }

    /**
     * Metodo helper privato per impostare il focus, selezionare il contenuto
     * e assicurarsi che l'elemento sia visibile.
     * @private
     * @param {HTMLElement} elemento - L'elemento su cui impostare il focus.
     */
    _impostaFocus(elemento) {
        if (elemento) {
            // console.log(`NavigatoreInput: Tento focus su ${elemento.id || elemento.name}`);
            elemento.focus(); // Imposta il focus

            // Seleziona il testo se possibile
            if (typeof elemento.select === "function") {
                elemento.select();
            }

            // --- Scroll into view se necessario ---
            // Usiamo un piccolo timeout per dare tempo al browser di processare il focus
            // prima di controllare la visibilità e scrollare (risultati più fluidi)
            setTimeout(() => {
                // Ricontrolla quale elemento ha il focus *adesso*, potrebbe essere cambiato
                const elementoConFocusAttuale = document.activeElement;
                // Assicurati che il focus sia ancora sull'elemento che volevamo
                if (elementoConFocusAttuale === elemento) {
                    if (!this._isElementInViewport(elemento)) {
                        console.log(`NavigatoreInput: Elemento [${elemento.id || elemento.name}] non visibile dopo focus, scrollo...`);
                        elemento.scrollIntoView({
                            behavior: this.options.scrollBehavior,
                            block: this.options.scrollBlock,
                            inline: this.options.scrollInline
                        });
                    } else {
                        // console.log(`NavigatoreInput: Elemento [${elemento.id || elemento.name}] visibile dopo focus.`);
                    }
                }
            }, 0); // Deferisce l'esecuzione
        }
    }

    /**
     * Gestore per l'evento 'keydown'.
     * @param {KeyboardEvent} event - L'oggetto evento keydown.
     */
    gestisciKeyDown(event) {
        const indiceAttivo = this.trovaIndiceElementoAttivo();

        if (indiceAttivo !== -1) {
            // Il focus è su uno dei nostri elementi
            if (event.key === "ArrowDown") {
                event.preventDefault();
                this.vaiAlProssimo();
            } else if (event.key === "ArrowUp") {
                event.preventDefault();
                this.vaiAlPrecedente();
            }
        }
    }

    /**
     * Metodo per distruggere l'istanza e pulire i listener.
     */
    distruggi() {
        this.rimuoviListener();
        this.elementi = [];
        console.log("NavigatoreInput distrutto.");
    }
}
