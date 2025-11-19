async function showImportResults(data) {
    const dialogExists = document.getElementById("import-stock-service-results");
    if (dialogExists) {
        const tableExists = dialogExists.querySelector("table");
        if (tableExists) {
            const rows = Array.isArray(data?.rows) ? data.rows : [];
            $(tableExists).bootstrapTable("load", rows);
        }
        dialogExists.showModal();
        return;
    }

    const template = document.getElementById("template-import-stock-service-results");
    console.log(template);

    const fragment = template.content.cloneNode(true);
    console.log("cloneNode", fragment);

    const dialog = fragment.querySelector("dialog");
    console.log("dialog", dialog);

    const table = fragment.querySelector("table");
    console.log("table", table);

    document.body.appendChild(dialog);

    // Close on ESC (cancel event)
    dialog.addEventListener("cancel", (e) => {
        // Allow default close but ensure consistency
        // If you want to prevent default and handle manually, uncomment next line
        // e.preventDefault(); dialog.close();
    });

    // Close on backdrop click
    dialog.addEventListener("click", (e) => {
        const rect = dialog.getBoundingClientRect();
        const inDialog = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
        if (!inDialog) {
            dialog.close();
        }
    });

    // Remove node on close to avoid duplicates/memory leaks
    dialog.addEventListener("close", () => {
        dialog.remove();
    });

    // Initialize table after dialog is in DOM
    if (typeof clearImportMessages === "function") clearImportMessages();
    if (typeof initTableResults === "function") {
        initTableResults(data.rows);
    }
    if (typeof addImportMessage === "function") addImportMessage("success", "Import completato");

    dialog.showModal();

    // Ensure the table scrolls within the modal-body and footer stays visible
    const modalBody = dialog.querySelector(".modal-body");
    if (modalBody) {
        const bodyHeight = modalBody.clientHeight;
        $("#table-import-stock-service-results").bootstrapTable("resetView", { height: bodyHeight - 16 });
    }
}

function closeDialog(idDialog) {
    document.getElementById(idDialog).close();
}

function clearImportMessages() {
    const c = document.getElementById("import-stock-service-messages");
    if (c) c.innerHTML = "";
}

function addImportMessage(type, text) {
    const c = document.getElementById("import-stock-service-messages");
    if (!c) return;
    const div = document.createElement("div");
    div.className = "alert alert-" + type;
    div.textContent = text;
    c.appendChild(div);
}

function initTableResults(data) {
    $("#table-import-stock-service-results").bootstrapTable({
        //url: adminControllerUrl,
        data: data,
        method: "post",
        contentType: "application/x-www-form-urlencoded",
        queryParams: function (params) {
            return {
                ajax: 1,
                action: "getLocalita",
            };
        },
        responseHandler: function (res) {
            // Il controller risponde con { localita: [...] }
            return res && Array.isArray(res.localita) ? res.localita : [];
        },
        pagination: true,
        search: false,
        showRefresh: true,
        showColumns: false,
        showExport: false,
        pageSize: 50,
        pageList: [10, 25, 50, 100, 250, 500],
        locale: "it-IT",
        classes: "table table-condensed",
        theadClasses: "thead-light",
        uniqueId: "id_product_attribute",
        onPostBody: function () {
            console.log("Bootstrap Table initialized successfully");

            setBootstrapTableIcons();
        },
        columns: [
            {
                field: "image_path",
                title: "Immagine",
                align: "center",
                width: 72,
                sortable: false,
                formatter: (value, row, index) => {
                    return `<img src="${value}" class="img-thumbnail" alt="${row.combination}" style="width: 50px; height: 50px;">`;
                },
            },
            {
                field: "ean13",
                title: "EAN",
                align: "center",
                width: 110,
                sortable: false,
            },
            {
                field: "product_name",
                title: "Nome",
                align: "left",
                sortable: false,
            },
            {
                field: "combination",
                title: "Combinazione",
                align: "left",
                sortable: false,
            },
            {
                field: "quantity_before",
                title: "Quantità",
                align: "center",
                width: 92,
                sortable: false,
                formatter: (value, row, index) => {
                    let color = "success";
                    if (value < 10) {
                        color = "danger";
                    } else if (value < 20) {
                        color = "warning";
                    }
                    return `
                            <div style="font-size: 1.4rem; border-radius: 50%; padding: 8px;" class="badge badge-${color}" id-value="${value}">${value}</div>
                        `;
                },
            },
            {
                field: "movement",
                title: "Variazione",
                align: "center",
                width: 92,
                sortable: false,
                formatter: (value, row, index) => {
                    let color = "success";
                    if (value < 0) {
                        color = "danger";
                    } else {
                        color = "success";
                    }
                    return `
                            <div style="font-size: 1.4rem; border-radius: 50%; padding: 8px;" class="badge badge-${color}" id-value="${value}">${value}</div>
                        `;
                },
            },
            {
                field: "quantity_after",
                title: "Quantità",
                align: "center",
                width: 92,
                sortable: false,
                formatter: (value, row, index) => {
                    let color = "success";
                    if (value < 10) {
                        color = "danger";
                    } else if (value < 20) {
                        color = "warning";
                    }
                    return `
                            <div style="font-size: 1.4rem; border-radius: 50%; padding: 8px;" class="badge badge-${color}" id-value="${value}">${value}</div>
                        `;
                },
            },
            {
                field: "is_stock_service",
                title: "Stock",
                align: "center",
                width: 72,
                sortable: false,
                formatter: (value, row, index) => {
                    let color = "text-danger";
                    let icon = "close";
                    if (value == true) {
                        color = "text-success";
                        icon = "check";
                    }
                    return `
                            <div class="material-icons ${color}">${icon}</div>
                        `;
                },
            },
            {
                field: "skipped",
                title: "Saltato",
                align: "center",
                width: 72,
                sortable: false,
                formatter: (value, row, index) => {
                    let color = "text-danger";
                    let icon = "close";
                    if (value == true) {
                        color = "text-success";
                        icon = "check";
                    }
                    return `
                            <div class="material-icons ${color}">${icon}</div>
                        `;
                },
            },
            {
                field: "imported",
                title: "Importato",
                align: "center",
                width: 72,
                sortable: false,
                formatter: (value, row, index) => {
                    let color = "text-danger";
                    let icon = "close";
                    if (value == true) {
                        color = "text-success";
                        icon = "check";
                    }
                    return `
                            <div class="material-icons ${color}">${icon}</div>
                        `;
                },
            },
        ],
    });
}
