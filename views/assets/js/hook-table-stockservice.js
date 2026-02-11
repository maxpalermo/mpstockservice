class HookTableStockService {
    tableId = "";
    adminControllerUrl = "";
    uniqueId = "";
    toolbarId = null;
    table = null;

    constructor(adminControllerUrl, idProduct, tableId, uniqueId, toolbarId = null) {
        this.tableId = tableId;
        this.adminControllerUrl = adminControllerUrl;
        this.uniqueId = uniqueId;
        this.toolbarId = toolbarId;
        this.table = $("#" + tableId);
        this.id_product = idProduct;

        this.initTable();
        this.delegate();
    }

    initTable() {
        const self = this;

        self.table.bootstrapTable({
            url: self.adminControllerUrl,
            method: "post",
            contentType: "application/x-www-form-urlencoded",
            queryParams: function (params) {
                const searchParams = {
                    ajax: 1,
                    action: "getStockServiceByProductId",
                    id_product: self.id_product,
                };

                return searchParams;
            },
            search: false,
            filterControl: false,
            filterControlVisible: false,
            filterControlSearchClear: false,
            showFilterControlSwitch: false,
            searchOnEnterKey: true,
            sortSelectOptions: true,
            serverSort: true,
            sidePagination: "server",
            pagination: false,
            showRefresh: true,
            showColumns: false,
            striped: true,
            condensed: true,
            pageSize: 25,
            pageList: [10, 25, 50, 100, 250, 500],
            locale: "it-IT",
            classes: "table table-bordered table-hover",
            theadClasses: "thead-light",
            showExport: false,
            toolbar: self.toolbarId,
            uniqueId: self.uniqueId,
            detailView: false, // Imposta a true per avere il dettaglio della riga
            detailFormatter: (_, row) => {
                return '<div id="detail-' + row.id_carrier_brt_localita + '">Caricamento...</div>';
            },
            onExpandRow: (_, row, $detail) => {
                //Per ora non serve, ma lasciamo il codice per futura implementazione
                //$details è il contenuto da visualizzare
            },
            iconsPrefix: "icon", // usa Font Awesome invece delle glyphicons
            icons: {
                detailOpen: "icon-plus icon-2x", // icona quando è chiuso
                detailClose: "icon-minus icon-2x", // icona quando è aperto
                sortAsc: "icon-sort-amount-asc icon-2x", // icona quando è chiuso
                sortDesc: "icon-sort-amount-desc icon-2x", // icona quando è aperto
            },
            onPostBody: function () {
                self.bindActionButtons();
                self.setBootstrapTableIcons();
                self.fixDropDownPagination();
            },
            columns: [
                {
                    field: "combination",
                    title: "Combinazione",
                    align: "left",
                    sortable: false,
                },
                {
                    field: "ean13",
                    title: "EAN13",
                    align: "center",
                    sortable: false,
                },
                {
                    field: "quantity",
                    title: "Quantità",
                    align: "center",
                    width: 110,
                    sortable: false,
                    formatter: (value, row, index) => formatterQuantity(value, row, index),
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
                                    <span class="material-icons">reply_all</span>
                                </button>
                            </div>
                        `;
                    },
                },
            ],
        });
    }

    fixDropDownPagination() {
        $(".fixed-table-pagination .dropdown-toggle")
            .off("click")
            .on("click", function (e) {
                e.preventDefault();
                e.stopPropagation();
                const $btn = $(this);
                const $menu = $btn.closest(".btn-group").find(".dropdown-menu");

                $(".fixed-table-pagination .dropdown-menu").not($menu).removeClass("show");
                $menu.toggleClass("show");
            });

        // Normalizza il markup del dropdown page-size a Bootstrap 3
        $(".fixed-table-pagination .btn-group.dropdown").each(function () {
            var $group = $(this);
            var $menuDiv = $group.find("> .dropdown-menu");

            if ($menuDiv.length) {
                // Se non è già <ul>, converti
                if ($menuDiv.prop("tagName") !== "UL") {
                    var $ul = $('<ul class="dropdown-menu" role="menu"></ul>');

                    $menuDiv.find("a").each(function () {
                        var $a = $(this);
                        var $li = $("<li></li>");
                        $a.removeClass("dropdown-item"); // classe BS4/5 inutile qui
                        $li.append($a);
                        $ul.append($li);
                    });

                    $menuDiv.replaceWith($ul);
                }
            }

            // Assicura data-toggle (non data-bs-toggle) e inizializza il plugin
            var $btn = $group.find("> .dropdown-toggle");
            if ($btn.attr("data-bs-toggle") === "dropdown") {
                $btn.removeAttr("data-bs-toggle").attr("data-toggle", "dropdown");
            }
            if (typeof $.fn.dropdown === "function") {
                $btn.dropdown();
            }
        });

        $("button[name=filterControlSwitch]").html("<i class='material-icons'>filter_list</i>");

        $(document)
            .off("click.bs-table-page-size")
            .on("click.bs-table-page-size", function () {
                $(".fixed-table-pagination .dropdown-menu").removeClass("show");
            });
    }

    setBootstrapTableIcons() {
        document.querySelectorAll("button[name=refresh] i").forEach((i) => {
            i.setAttribute("class", "material-icons");
            i.innerHTML = "refresh";
        });

        document.querySelectorAll("button[name=clearSearch] i").forEach((i) => {
            i.setAttribute("class", "material-icons");
            i.innerHTML = "clear";
        });
    }

    async fetch(action, data) {
        const self = this;
        const formData = new FormData();
        formData.append("ajax", 1);
        formData.append("action", action);
        Object.entries(data).forEach(([key, value]) => {
            formData.append(key, value);
        });

        const request = await fetch(self.adminControllerUrl, {
            method: "POST",
            body: formData,
        });

        if (!request.ok) {
            throw new Error("fetch: Network response was not ok");
        }

        const response = await request.json();

        return response;
    }

    refreshTable() {
        this.table.bootstrapTable("refresh");
    }

    bindActionButtons() {
        const self = this;
        const table = document.getElementById(self.tableId);
    }

    static closeModal() {
        document.getElementById("DialogMpNote-dialog-form-note").closest("dialog").close();
    }

    delegate() {
        const table = document.getElementById("table-list-stock-service");
        if (!table) {
            showErrorMessage("Tabella non trovata");
            return false;
        }

        table.addEventListener("click", (event) => {
            const el = event.target.closest("button");
            if (!el) {
                return;
            }
            if (el.name.startsWith("btn-apply-all")) {
                const tr = el.closest("tr");
                const document = tr.querySelector("[name^=document_number]").value;
                const date = tr.querySelector("[name^=document_date]").value;

                const tbody = tr.closest("tbody");
                tbody.querySelectorAll("tr").forEach((itm) => {
                    itm.querySelector("[name^=document_number]").value = document;
                    itm.querySelector("[name^=document_date]").value = date;
                });
            }
        });

        table.addEventListener("input", (event) => {
            const el = event.target;
            console.log(el);
            if (el && el.name.startsWith("variation")) {
                const variation = Number(el.value);
                const tr = el.closest("tr");
                const qty = Number(tr.querySelector("div.quantity").dataset.value);
                const result = qty + variation;
                if (result < 0) {
                    result = 0;
                }
                tr.querySelector("div.quantity").textContent = result;
            }
        });
    }
}
