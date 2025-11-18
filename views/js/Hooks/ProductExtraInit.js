/**
 * Inizializzazione per il modulo Stock Service
 */

/**
 * Inizializza il modulo Stock Service
 *
 * @param {Object} params Parametri di configurazione
 * @param {boolean} params.is_stock_service Flag che indica se il servizio stock è attivo
 * @param {Object} params.DisplayProductExtra Modulo con le funzioni di DisplayProductExtra
 */
export function initStockService(params) {
    const { is_stock_service, DisplayProductExtra, actions } = params;

    // Aggiorniamo la tabella delle combinazioni
    DisplayProductExtra.refreshTableStockServiceCombinations();

    // Inizializziamo i componenti
    const inputSsVariation = document.querySelectorAll('input[name^="ss_variation"]');
    const inputOptSs = document.querySelectorAll('input[name^="input-is_stock_service"]');
    const btnLoadQty = document.getElementById("loadqty");
    const btnUnloadQty = document.getElementById("unloadqty");
    const btnResetQty = document.getElementById("resetqty");
    const btnSubmitStockProduct = document.getElementById("submitStockProduct");
    const btnApplyAll = document.querySelectorAll('button[name="btnApplyAll"]');
    const inputTypeText = document.querySelectorAll('input[type="text"]');
    const forceUpload = document.querySelector("input[name='input-force_upload']");

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
                method: "POST",
                headers: {
                    "X-PS-Module-Token": actions.token,
                    "Content-Type": "application/x-www-form-urlencoded",
                    "X-Requested-With": "XMLHttpRequest"
                },
                body: new URLSearchParams({
                    value: input.value
                })
            });
            if (!response) {
                return false;
            }
            const data = await response.json();
            if (!data.result) {
                window.swalError(data.message);
                return false;
            }

            window.swalSuccess("Variazione Stock Service effettuata con successo");
        });
    });

    // Event listeners per i pulsanti
    btnLoadQty.addEventListener("click", async (e) => {
        const response = await window.swalConfirm("Caricare le quantità selezionate?");
        if (response) {
            const value = forceUpload.closest("div.ps-switch").querySelector("input:checked").value;
            console.log("forceUpload", "load", value);

            DisplayProductExtra.uploadFile("load", e, value);
        }
    });

    btnUnloadQty.addEventListener("click", async (e) => {
        const response = await window.swalConfirm("Scaricare le quantità selezionate?");
        if (response) {
            const value = forceUpload.closest("div.ps-switch").querySelector("input:checked").value;
            console.log("forceUpload", "unload", value);
            DisplayProductExtra.uploadFile("unload", e, value);
        }
    });

    btnResetQty.addEventListener("click", async (e) => {
        const response = await window.swalConfirm("Azzerare lo stock service  per il prodotto selezionato?");
        if (response) {
            DisplayProductExtra.resetStockQuantities(e, actions.actionResetStockService);
        }
    });

    btnSubmitStockProduct.addEventListener("click", async (e) => {
        const response = await window.swalConfirm("Aggiornare i dati dello Stock Service?");
        if (response) {
            DisplayProductExtra.submitStockQuantities(e, actions.actionUpdateStockService);
        }
    });

    // Inizializziamo il file uploader
    DisplayProductExtra.initFileUploader(actions.actionUploadFile, is_stock_service);
}
