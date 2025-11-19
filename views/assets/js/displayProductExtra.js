function showAlertMessageStockService(message, type) {
    const alertMessage = document.getElementById("alert-message-stock-service");
    if (!alertMessage) return;

    alertMessage.classList.remove("alert-success");
    alertMessage.classList.remove("alert-danger");
    alertMessage.classList.remove("d-none");

    alertMessage.innerHTML = message;
    alertMessage.classList.add(type);

    $(alertMessage).fadeIn();

    alertMessage._hideTimeout = setTimeout(() => {
        // Start fade-out
        $(alertMessage).fadeOut();
    }, 5000);
}

function showInputNumber(idProduct, idProductAttribute, value, name) {
    const innerHtml = `
            <input type="number" name="${name}[${idProductAttribute}]" value="${value}" class="form-control text-right" style="width: 150px;" data-id_product="${idProduct}" data-id_product_attribute="${idProductAttribute}">
        `;

    const formGroup = document.createElement("div");
    formGroup.classList.add("d-flex");
    formGroup.classList.add("justify-content-center");
    formGroup.classList.add("align-items-center");
    formGroup.classList.add("grow-1");
    formGroup.innerHTML = innerHtml;

    return formGroup;
}

function showInputText(idProductAttribute, value, name) {
    const innerHtml = `
            <input type="text" name="${name}[${idProductAttribute}]" value="${value}" class="form-control" style="width: 200px;">
        `;

    const formGroup = document.createElement("div");
    formGroup.classList.add("d-flex");
    formGroup.classList.add("justify-content-center");
    formGroup.classList.add("align-items-center");
    formGroup.classList.add("grow-1");
    formGroup.innerHTML = innerHtml;

    return formGroup;
}

function showInputDate(idProductAttribute, value, name) {
    const innerHtml = `
            <input type="date" name="${name}[${idProductAttribute}]" value="${value}" class="form-control" style="width: 150px;">
        `;

    const formGroup = document.createElement("div");
    formGroup.classList.add("d-flex");
    formGroup.classList.add("justify-content-center");
    formGroup.classList.add("align-items-center");
    formGroup.classList.add("grow-1");
    formGroup.innerHTML = innerHtml;

    return formGroup;
}

function showSuppliersSelect(idProductAttribute, value, name) {
    const formGroup = document.createElement("div");
    formGroup.classList.add("d-flex");
    formGroup.classList.add("justify-content-center");
    formGroup.classList.add("align-items-center");
    formGroup.classList.add("grow-1");

    const select = document.createElement("select");
    select.classList.add("form-control");
    select.classList.add("chosen");
    select.setAttribute("name", `id_supplier[${idProductAttribute}]`);

    const option = document.createElement("option");
    option.setAttribute("value", "");
    option.textContent = "Seleziona fornitore";
    select.appendChild(option);

    suppliers.forEach((supplier) => {
        const option = document.createElement("option");
        option.setAttribute("value", supplier.id_supplier);
        option.textContent = supplier.name;
        if (supplier.id_supplier == value) {
            option.setAttribute("selected", "selected");
        }
        select.appendChild(option);
    });

    formGroup.appendChild(select);
    return formGroup;
}

function bindToolbarBtnActions() {
    const btnSaveStockService = document.getElementById("btnSaveStockService");
    const switchStockServiceOn = document.getElementById("switch_stock_service_on");
    const switchStockServiceOff = document.getElementById("switch_stock_service_off");

    btnSaveStockService.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!confirm("Confermi di voler salvare le variazioni?")) {
            return false;
        }

        const rows = getStockServiceData();
        const response = await fetch(adminControllerUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                ajax: 1,
                action: "saveStockService",
                id_product: idProduct,
                is_stock_service: document.getElementById("switch_stock_service_on").checked ? 1 : 0,
                rows: JSON.stringify(rows),
            }),
        });

        const data = await response.json();

        if (data.success) {
            showAlertMessageStockService(data.message, "alert-success");
        } else {
            showAlertMessageStockService(data.message, "alert-danger");
        }

        $("#table-list-stock-service").bootstrapTable("refresh");

        return false;
    });

    const switchStockServiceAction = async (value) => {
        const response = await fetch(adminControllerUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                ajax: 1,
                action: "switchStockService",
                id_product: idProduct,
                switch_stock_service: value,
            }),
        });
        const data = await response.json();

        if (data.success) {
            showAlertMessageStockService(data.message, "alert-success");
        } else {
            showAlertMessageStockService(data.message, "alert-danger");
        }
    };

    switchStockServiceOn.addEventListener("click", async () => {
        console.log("Switch", this.value);
        switchStockServiceAction(1);
    });

    switchStockServiceOff.addEventListener("click", async () => {
        console.log("Switch", this.value);
        switchStockServiceAction(0);
    });
}

function bindButtonsActions() {
    const btnApplyAll = document.querySelectorAll("button[name=btn-apply-all]");

    btnApplyAll.forEach((btn) => {
        btn.addEventListener("click", function () {
            const idProduct = this.getAttribute("data-id_product");
            const idProductAttribute = this.getAttribute("data-id_product_attribute");
            console.log(idProduct);
            console.log(idProductAttribute);
        });
    });
}

function bindInputActions() {
    const inputsQty = document.querySelectorAll('input[name^="variation"][type="number"]');
    inputsQty.forEach((input) => {
        input.addEventListener("input", function () {
            const idProductAttribute = this.getAttribute("data-id_product_attribute");
            const idProduct = this.getAttribute("data-id_product");
            const badge = this.closest("tr").querySelector(".badge");
            const badgeValue = Number(badge.getAttribute("id-value"));
            const variation = Number(this.value);

            const result = badgeValue + variation;
            if (result < 0) {
                result = 0;
            }

            switch (true) {
                case result < 10:
                    badge.setAttribute("class", "badge badge-danger");
                    break;
                case result < 20:
                    badge.setAttribute("class", "badge badge-warning");
                    break;
                case result >= 20:
                    badge.setAttribute("class", "badge badge-success");
                    break;
            }

            badge.textContent = result;
        });
    });
}

function getStockServiceData() {
    const table = document.getElementById("table-list-stock-service");
    const rows = table.querySelectorAll("tbody tr");
    const data = [];
    rows.forEach((row) => {
        const idProduct = row.querySelector('input[name^="variation"]').getAttribute("data-id_product");
        const idProductAttribute = row.querySelector('input[name^="variation"]').getAttribute("data-id_product_attribute");
        const quantity_before = Number(row.querySelector('div[name^="quantity"]').getAttribute("id-value"));
        const variation = Number(row.querySelector('input[name^="variation"]').value);
        const quantity_after = Number(row.querySelector('div[name^="quantity"]').textContent);
        //const id_supplier = Number(row.querySelector('input[name^="id_supplier"]').value);
        const number = row.querySelector('input[name^="document_number"]').value;
        const date = row.querySelector('input[name^="document_date"]').value;
        data.push({
            id_product_attribute: idProductAttribute,
            id_product: idProduct,
            quantity_before: quantity_before,
            variation: variation,
            quantity_after: quantity_after,
            id_supplier: 0,
            number: number,
            date: date,
        });
    });

    return data;
}

function initTableStockService() {
    $("#table-list-stock-service").bootstrapTable({
        url: adminControllerUrl,
        method: "post",
        contentType: "application/x-www-form-urlencoded",
        queryParams: function (params) {
            console.log("PARAMS", params);
            return {
                ajax: 1,
                action: "getStockServiceByProductId",
                id_product: idProduct,
            };
        },
        responseHandler: function (res) {
            // Il controller risponde con un array di righe
            return Array.isArray(res) ? res : res && Array.isArray(res.rows) ? res.rows : [];
        },
        pagination: false,
        search: false,
        showRefresh: true,
        showColumns: false,
        showExport: false,
        pageSize: 100,
        pageList: [10, 25, 50, 100, 250, 500],
        locale: "it-IT",
        classes: "table table-bordered table-hover",
        theadClasses: "thead-light",
        toolbar: "#table-toolbar",
        uniqueId: "id_product_attribute",
        onPostBody: function () {
            console.log("Bootstrap Table initialized successfully");
            bindButtonsActions();
            bindInputActions();
            setBootstrapTableIcons();
        },
        columns: [
            {
                field: "combination",
                title: "Combinazione",
                align: "left",
                sortable: false,
            },
            {
                field: "quantity",
                title: "Quantità",
                align: "center",
                width: 110,
                sortable: false,
                formatter: (value, row, index) => {
                    let color = "success";
                    if (value < 10) {
                        color = "danger";
                    } else if (value < 20) {
                        color = "warning";
                    }
                    return `
                            <div name="quantity[${row.id_product_attribute}]" style="font-size: 1.4rem; border-radius: 50%; padding: 8px;" class="badge badge-${color}" id-value="${value}">${value}</div>
                        `;
                },
            },
            {
                field: "variation",
                title: "Variazione",
                align: "center",
                sortable: false,
                formatter: (value, row, index) => {
                    return showInputNumber(row.id_product, row.id_product_attribute, value, "variation");
                },
            },
            {
                field: "supplier",
                title: "Fornitore",
                align: "center",
                sortable: false,
                visible: false,
                formatter: (value, row, index) => {
                    return showSuppliersSelect(row.id_product_attribute, value, "supplier");
                },
            },
            {
                field: "document_number",
                title: "Numero Documento",
                align: "center",
                formatter: (value, row, index) => {
                    return showInputText(row.id_product_attribute, value, "document_number");
                },
            },
            {
                field: "document_date",
                title: "Data Documento",
                align: "center",
                formatter: (value, row, index) => {
                    if (value != "1970-01-01") {
                        return showInputDate(row.id_product_attribute, value, "document_date");
                    }
                    return showInputDate(row.id_product_attribute, "", "document_date");
                },
            },
            {
                field: "action",
                title: "Azioni",
                align: "center",
                width: 50,
                sortable: false,
                formatter: function (value, row, index) {
                    return `
                            <div class="d-flex justify-content-center align-items-center gap-2">
                                <button type="button" class="btn btn-default btn-sm" name="btn-apply-all" title="Applica a tutti" data-id_product="${row.id_product}" data-id_product_attribute="${row.id_product_attribute}">
                                    <span class="material-icons">edit</span>
                                </button>
                            </div>
                        `;
                },
            },
        ],
    });
}
