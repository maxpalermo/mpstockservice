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
