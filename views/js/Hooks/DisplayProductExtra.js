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

export function uploadFile(type, button) {
    if (fileUploader) {
        fileUploader.uploadFile(type, button);
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

export function resetStockQuantities(button) {
    Swal.fire({
        title: "Conferma",
        text: "Azzerare le quantità di stock per il prodotto selezionato?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sì",
        cancelButtonText: "No"
    }).then((result) => {
        if (!result.isConfirmed) {
            return false;
        }
        let data = {
            ajax: true,
            action: "resetStockService",
            id_product: "{$id_product}"
        };
        setButtonIconLoading(button, true);
        $.post("{$ajax_controller}", data, function (response) {
            if (response.result) {
                Swal.fire({
                    title: "{l s='Reset Quantities' mod='mpstockservice'}",
                    text: "{l s='Operation done.' mod='mpstockservice'}",
                    icon: "success",
                    confirmButtonText: "OK"
                });
                if ("{isset($controller)}") {
                    window.location.href = "{$ajax_controller}";
                }
            } else {
                Swal.fire({
                    title: "{l s='Reset Quantities' mod='mpstockservice'}",
                    text: "{l s='Error during reset. Retry.' mod='mpstockservice'}",
                    icon: "error",
                    confirmButtonText: "OK"
                });
            }
            setButtonIconLoading(button, false);
        });
    });
}

export async function submitStockQuantities(e, actionUpdateStockService) {
    e.stopPropagation();
    e.preventDefault();

    const request = await window.swalConfirm("Aggiornare i dati dello Stock Service?");
    if (!request) {
        return false;
    }

    const tbody = document.querySelector("#table_stock tbody");
    const rows = tbody.querySelectorAll("tr");
    const rowsData = [];
    rows.forEach(function (row) {
        const idProductAttribute = row.getAttribute("id_product_attribute");
        const stock = row.querySelector("td:nth-child(2) input").value;
        const quantity = row.querySelector("td:nth-child(3) input").value;
        const idSupplier = row.querySelector("td:nth-child(4) select").value;
        const number = row.querySelector("td:nth-child(5) input").value;
        const date = row.querySelector("td:nth-child(6) input").value;
        rowsData.push({
            id_product_attribute: idProductAttribute,
            stock: stock,
            quantity: quantity,
            id_supplier: idSupplier,
            number: number,
            date: date
        });
    });

    let data = {
        rows: JSON.stringify(rowsData)
    };

    window.swalLoading();

    const response = await fetch(actionUpdateStockService, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams(data)
    });

    if (!response) {
        return false;
    }

    const result = await response.json();
    if (result.result) {
        window.swalSuccess("Aggiornamento completato con successo");
    } else {
        window.swalError("Errore durante l'aggiornamento");
    }
}

export function editEan13() {
    let table = $("#table-combinations-list");
    let rows = table.find("tbody tr");

    $.each(rows, function () {
        let a = $(this).find("td a");
        let id_pa = "";
        if (a.length > 0) {
            let match = a.attr("href").match(/id_product_attribute=(\d+)/);
            if (match) {
                id_pa = match[1];
            }
            let ean13 = $(this).find("td:nth-child(5)").text().trim();
            let input = $("<input>")
                .attr("type", "text")
                .attr("name", "barcode[" + id_pa + "]")
                .addClass("form-control text-center")
                .attr("data-id_pa", id_pa)
                .val(ean13);
            $(this).find("td:nth-child(5)").html(input);
        }
    });
    let tfoot = $("<tfoot>").append(
        $("<tr>").append(
            $("<td>")
                .attr("colspan", "7")
                .addClass("text-right")
                .append($("<button>").addClass("btn btn-default").attr("id", "submitEditEan13").attr("type", "button").append($("<i>").addClass("process-icon-save")).append($("<span>").text("{l s='Salva EAN13' mod='mpstockservice'}")))
        )
    );
    table.append(tfoot);
}

// Inizializza il file uploader con le opzioni necessarie
export function initFileUploader(ajaxControllerUrl, isCheckedValue) {
    fileUploader = new FileUpload({
        ajaxController: ajaxControllerUrl,
        isChecked: isCheckedValue,
        translations: {
            attention: "Attenzione",
            selectFile: "Seleziona un file prima di caricare.",
            invalidFormat: "Formato non valido",
            selectXmlFile: "Per favore seleziona un file XML.",
            error: "Error",
            ajaxError: "AJAX ERROR"
        }
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
        ean13: ean13
    };

    $.post(ajax_controller, data, function (response) {
        if (response.result) {
            Swal.fire({
                title: "Operazione completata.",
                text: response.message,
                icon: "success",
                confirmButtonText: "OK"
            });
        } else {
            Swal.fire({
                title: "ERRORE.",
                text: response.message,
                icon: "error",
                confirmButtonText: "OK"
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
                confirmButtonText: "OK"
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
                }
            }
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
            minimumResultsForSearch: 10 // Mostra la ricerca solo se ci sono più di 10 opzioni
        })
        .on("select2:open", function () {
            // Focus automatico sulla casella di ricerca quando si apre il dropdown
            setTimeout(function () {
                $(".select2-search__field").focus();
            }, 0);
        });
}
