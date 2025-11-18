// FileUpload viene importato globalmente nel template

let fileUploader;
let buttonIcon = "";

export function setButtonIconLoading(button, loading = true) {
    if (loading) {
        buttonIcon = $(button).find("i").attr("class");
        $(button).find("i").removeClass().addClass("process-icon-loading");
    } else {
        $(button).find("i").removeClass().addClass(buttonIcon);
    }
}

export function uploadFile(type, e, force = false) {
    if (fileUploader) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        fileUploader.uploadFile(type, e, force);
    }
}

export async function applyAll(item) {
    const request = await window.swalConfirm("Applicare a tutte le combinazioni?");
    if (!request) {
        return false;
    }

    const tbody = item.closest("tbody");
    const rows = tbody.querySelectorAll("tr");
    const row = item.closest("tr");
    const id_supplier = row.querySelector("select").value;
    const number = row.querySelector("input.ss_number").value;
    const date = row.querySelector("input.ss_date").value;

    rows.forEach(function (row) {
        row.querySelector(".ss_id_supplier").value = id_supplier;
        row.querySelector(".ss_id_supplier").dispatchEvent(new Event("change"));
        row.querySelector(".ss_number").value = number;
        row.querySelector(".ss_date").value = date;
    });
}

export async function resetStockQuantities(e, action) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    window.swalLoading();

    const response = await fetch(action, {
        method: "POST",
    });

    if (!response) {
        return false;
    }

    const result = await response.json();
    if (result.result) {
        window.swalSuccess("Aggiornamento completato con successo");
        resetStockServiceQuantities();
    } else {
        window.swalError("Errore durante l'aggiornamento");
    }
}

function resetStockServiceQuantities() {
    const table = document.getElementById("tableStockService");
    const rows = table.querySelectorAll("tbody tr");
    rows.forEach(function (row) {
        const StockQuantity = row.querySelector("input[name^='ss_quantity']");
        const StockVariation = row.querySelector("input[name^='ss_variation']");
        const Supplier = row.querySelector("select[name^='ss_id_supplier']");
        const Num = row.querySelector("input[name^='ss_number']");
        const Date = row.querySelector("input[name^='ss_date']");

        StockQuantity.value = "0";
        StockVariation.value = "0";
        Supplier.value = "";
        Num.value = "";
        Date.value = "";

        Supplier.dispatchEvent(new Event("change"));
    });
}

export async function submitStockQuantities(e, action) {
    e.stopPropagation();
    e.preventDefault();

    const tbody = document.querySelector("#tableStockService tbody");
    const rows = tbody.querySelectorAll("tr");
    const rowsData = [];
    rows.forEach(function (row) {
        const idProductAttribute = row.getAttribute("id_product_attribute");
        const stock = row.querySelector("td:nth-child(2) input").value;
        const quantity = row.querySelector("td:nth-child(3) input").value;
        //const idSupplier = row.querySelector("td:nth-child(4) select").value;
        const number = row.querySelector("td:nth-child(4) input").value;
        const date = row.querySelector("td:nth-child(5) input").value;
        rowsData.push({
            id_product_attribute: idProductAttribute,
            stock: stock,
            quantity: quantity,
            id_supplier: 0,
            number: number,
            date: date,
        });
    });

    let data = {
        rows: JSON.stringify(rowsData),
    };

    window.swalLoading();

    const response = await fetch(action, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(data),
    });

    if (!response) {
        return false;
    }

    const result = await response.json();
    if (result.result) {
        window.swalSuccess("Aggiornamento completato con successo");
        updateStockServiceQuantities();
    } else {
        window.swalError("Errore durante l'aggiornamento");
    }
}

function updateStockServiceQuantities() {
    const table = document.getElementById("tableStockService");
    const rows = table.querySelectorAll("tbody tr");
    rows.forEach(function (row) {
        const StockQuantity = parseInt(row.querySelector("input[name^='ss_quantity']").value);
        const StockVariation = parseInt(row.querySelector("input[name^='ss_variation']").value);
        const result = StockQuantity + StockVariation;

        row.querySelector("input[name^='ss_quantity']").value = result < 0 ? 0 : result;
        row.querySelector("input[name^='ss_variation']").value = "0";
    });
}

// Inizializza il file uploader con le opzioni necessarie
export function initFileUploader(action, isCheckedValue) {
    console.log("initFileUploader ACTION", action);

    fileUploader = new FileUpload({
        url: action,
        isChecked: isCheckedValue,
        translations: {
            attention: "Attenzione",
            selectFile: "Seleziona un file prima di caricare.",
            invalidFormat: "Formato non valido",
            selectXmlFile: "Per favore seleziona un file XML.",
            error: "Error",
            ajaxError: "AJAX ERROR",
        },
    });
}

export function refreshTableStockServiceCombinations() {
    injectTemplate("tableStockServiceTemplate", "tableContentStockService");

    // Inizializza Select2 sui select dopo che il template è stato iniettato
    setTimeout(() => {
        initializeSelect2();
    }, 100);
}

export function injectTemplate(templateId, targetId) {
    if (templateId && targetId) {
        const template = document.getElementById(templateId);
        const target = document.getElementById(targetId);
        if (!template || !target) {
            return;
        }
        const templateContent = template.content;
        const childNode = templateContent.cloneNode(true);
        target.innerHTML = "";
        target.appendChild(childNode);
    }
}

export function updateEan13(ean13) {
    let data = {
        ajax: true,
        action: "updateEan13",
        ean13: ean13,
    };

    $.post("", data, function (response) {
        if (response.result) {
            Swal.fire({
                title: "Operazione completata.",
                text: response.message,
                icon: "success",
                confirmButtonText: "OK",
            });
        } else {
            Swal.fire({
                title: "ERRORE.",
                text: response.message,
                icon: "error",
                confirmButtonText: "OK",
            });
        }
    });
}

// Funzione per gestire i file selezionati
function handleFiles(files) {
    if (files[0]) {
        var file = files[0];
        if (file.name.toLowerCase().endsWith(".xml")) {
            fileNameElement.textContent = file.name;
            $(selectedFileInfo).show();
            $(".dz-message").hide();
        } else {
            Swal.fire({
                title: "{l s='Formato non valido' mod='mpstockservice'}",
                text: "{l s='Per favore seleziona un file XML.' mod='mpstockservice'}",
                icon: "error",
                confirmButtonText: "OK",
            });
            fileInput.value = "";
        }
    }
}

/**
 * Inizializza Select2 su tutti i select del modulo
 */
export function initializeSelect2() {
    // Inizializza Select2 sui select per i fornitori
    $(".ss_id_supplier")
        .select2({
            placeholder: "Seleziona un fornitore",
            allowClear: true,
            width: "100%",
            dropdownAutoWidth: true,
            language: {
                noResults: function () {
                    return "Nessun risultato trovato";
                },
            },
        })
        .on("select2:open", function () {
            // Focus automatico sulla casella di ricerca quando si apre il dropdown
            setTimeout(function () {
                $(".select2-search__field").focus();
            }, 0);
        });

    // Inizializza Select2 su altri select se necessario
    $(".chosen")
        .select2({
            width: "200px",
            minimumResultsForSearch: 10, // Mostra la ricerca solo se ci sono più di 10 opzioni
        })
        .on("select2:open", function () {
            // Focus automatico sulla casella di ricerca quando si apre il dropdown
            setTimeout(function () {
                $(".select2-search__field").focus();
            }, 0);
        });
}
