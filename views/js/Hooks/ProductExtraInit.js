/**
 * Inizializzazione per il modulo Stock Service
 */

/**
 * Inizializza il modulo Stock Service
 *
 * @param {Object} params Parametri di configurazione
 * @param {string} params.ajax_controller URL del controller AJAX
 * @param {boolean} params.is_stock_service Flag che indica se il servizio stock è attivo
 * @param {Array} params.combinations Combinazioni del prodotto
 * @param {string} params.id_product ID del prodotto
 * @param {Object} params.DisplayProductExtra Modulo con le funzioni di DisplayProductExtra
 */
export function initStockService(params) {
    const { ajax_controller, is_stock_service, id_product, DisplayProductExtra, actions } = params;

    // Aggiorniamo la tabella delle combinazioni
    DisplayProductExtra.refreshTableStockServiceCombinations();

    // Inizializziamo i componenti
    const inputSsVariation = document.querySelectorAll('input[name^="ss_variation"]');
    const inputOptSs = document.querySelectorAll('input[name^="opt_ss"]');
    const btnLoadQty = document.getElementById("loadqty");
    const btnUnloadQty = document.getElementById("unloadqty");
    const btnResetQty = document.getElementById("resetqty");
    const btnSubmitStockProduct = document.getElementById("submitStockProduct");
    const btnApplyAll = document.querySelectorAll('button[name="btnApplyAll"]');
    const inputTypeText = document.querySelectorAll('input[type="text"]');

    inputTypeText.forEach((input) => {
        input.addEventListener("focus", function () {
            this.select();
        });
    });

    btnApplyAll.forEach((button) => {
        button.addEventListener("click", function () {
            DisplayProductExtra.applyAll(this);
        });
    });

    // Inizializziamo i listener per i pulsanti
    inputOptSs.forEach((input) => {
        input.addEventListener("change", async (e) => {
            const answer = await window.swalConfirm("Stai per variare il servizio di gestione dello stock.\n\nVuoi procedere?");
            if (!answer) {
                return false;
            }

            const response = await fetch(actions.actionToggleStockService, {
                method: "POST"
            });
            if (!response) {
                return false;
            }

            window.swalSuccess("Variazione Stock Service effettuata con successo");
        });
    });

    // Event listeners per i pulsanti
    btnLoadQty.addEventListener("click", async (e) => {
        const response = await window.swalConfirm("Caricare le quantità selezionate?");
        if (response) {
            DisplayProductExtra.uploadFile("load", e);
        }
    });

    btnUnloadQty.addEventListener("click", async (e) => {
        const response = await window.swalConfirm("Scaricare le quantità selezionate?");
        if (response) {
            DisplayProductExtra.uploadFile("unload", e);
        }
    });

    btnResetQty.addEventListener("click", async (e) => {
        const response = await window.swalConfirm("Azzera tutte le quantità?");
        if (response) {
            DisplayProductExtra.resetStockQuantities(e);
        }
    });

    btnSubmitStockProduct.addEventListener("click", async (e) => {
        const response = await window.swalConfirm("Conferma l'operazione?");
        if (response) {
            DisplayProductExtra.submitStockQuantities(e, actions.actionUpdateStockService);
        }
    });

    // Inizializziamo il file uploader
    DisplayProductExtra.initFileUploader(ajax_controller, is_stock_service);
}
