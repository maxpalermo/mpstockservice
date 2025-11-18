function bindEnableDisableStockService() {
    const btnEnableStockService = document.querySelectorAll("button[name=btn-enable-stock-service]");
    const btnDisableStockService = document.querySelectorAll("button[name=btn-disable-stock-service]");

    btnEnableStockService.forEach((btn) => {
        btn.addEventListener("click", async () => {
            const idProduct = btn.getAttribute("data-id");
            await enableStockService(idProduct);
            refreshAdminStockServiceTable();
        });
    });

    btnDisableStockService.forEach((btn) => {
        btn.addEventListener("click", async () => {
            const idProduct = btn.getAttribute("data-id");
            await disableStockService(idProduct);
            refreshAdminStockServiceTable();
        });
    });
}

async function enableStockService(idProduct) {
    const response = await fetch(adminControllerUrl, {
        method: "POST",
        body: new URLSearchParams({
            action: "enableStockService",
            ajax: 1,
            id_product: idProduct,
        }),
    });
    const data = await response.json();
    return data;
}

async function disableStockService(idProduct) {
    const response = await fetch(adminControllerUrl, {
        method: "POST",
        body: new URLSearchParams({
            action: "disableStockService",
            ajax: 1,
            id_product: idProduct,
        }),
    });
    const data = await response.json();
    return data;
}

function refreshAdminStockServiceTable() {
    $("#table-list-stock-service").bootstrapTable("refresh");
}

function showImportPanel() {
    const importPanel = document.getElementById("table-toolbar");
    if ($(importPanel).is(":visible")) {
        $(importPanel).fadeOut(200); // nasconde con fade
    } else {
        $(importPanel).fadeIn(200); // mostra con fade
    }
}

function bindActionButtons() {
    const btnEditStockService = document.querySelectorAll("button[name=btn-edit-stock-service]");
    const btnDeleteStockService = document.querySelectorAll("button[name=btn-delete-stock-service]");

    btnEditStockService.forEach((btn) => {
        btn.addEventListener("click", function () {
            const idProduct = this.getAttribute("data-id");
            console.log(idProduct);
        });
    });

    btnDeleteStockService.forEach((btn) => {
        btn.addEventListener("click", function () {
            const idProduct = this.getAttribute("data-id");
            console.log(idProduct);
        });
    });
}

function initAdminStockServiceTable() {
    $("#table-list-stock-service").bootstrapTable({
        url: adminControllerUrl,
        method: "post",
        contentType: "application/x-www-form-urlencoded",
        queryParams: function (params) {
            console.log("QueryParams", params);

            return {
                ajax: 1,
                action: "getStockServiceList",
                limit: params.limit,
                offset: params.offset,
                search: params.search,
                sort: params.sort == undefined ? "a.id_product" : params.sort,
                order: params.order == undefined ? "asc" : params.order,
            };
        },
        serverSort: true,
        sidePagination: "server",
        pagination: true,
        search: true,
        showRefresh: true,
        showColumns: false,
        pageSize: 25,
        pageList: [10, 25, 50, 100, 250, 500],
        locale: "it-IT",
        classes: "table table-bordered table-hover",
        theadClasses: "thead-light",
        showExport: false,
        toolbar: "#toolbar-table",
        uniqueId: "id_product",
        detailView: true,
        detailFormatter: (index, row) => {
            return '<div id="detail-' + row.id_product + '">Caricamento...</div>';
        },
        onExpandRow: (index, row, $detail) => {
            fetch(adminControllerUrl, {
                method: "POST",
                body: new URLSearchParams({
                    action: "getTableStockServiceByProductId",
                    ajax: 1,
                    id_product: row.id_product,
                }),
            })
                .then((response) => response.json())
                .then((data) => {
                    // data.table è l’HTML generato dal Twig detailsStockServiceRow.html.twig
                    $detail.html(data.table);
                })
                .catch((error) => {
                    console.error("Errore caricamento dettaglio:", error);
                    $detail.html('<div class="text-danger">Errore nel caricamento dei dettagli.</div>');
                });
        },
        iconsPrefix: "icon", // usa Font Awesome invece delle glyphicons
        icons: {
            detailOpen: "icon-plus icon-2x", // icona quando è chiuso
            detailClose: "icon-minus icon-2x", // icona quando è aperto
        },
        onPostBody: function () {
            console.log("Bootstrap Table initialized successfully");
            bindActionButtons();
            bindEnableDisableStockService();

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

            $(document)
                .off("click.bs-table-page-size")
                .on("click.bs-table-page-size", function () {
                    $(".fixed-table-pagination .dropdown-menu").removeClass("show");
                });
        },
        columns: [
            {
                field: "image",
                title: "Immagine",
                align: "center",
                width: 50,
                sortable: false,
                formatter: function (value, row, index) {
                    return `<img src="${value}" alt="${row.reference}" width="50" class="img-thumbnail">`;
                },
            },
            {
                field: "reference",
                title: "Riferimento",
                align: "left",
                sortable: true,
            },
            {
                field: "product_name",
                title: "Nome",
                align: "left",
                sortable: true,
            },
            {
                field: "quantity",
                title: "Quantità",
                align: "center",
                sortable: true,
            },
            {
                field: "is_stock_service",
                title: "Stock service",
                align: "center",
                sortable: true,
                formatter: function (value, row, index) {
                    console.log(row.id_product, row.is_stock_service);
                    return row.is_stock_service == 1 ? `<span class="material-icons text-success" style="font-size: 1.5rem;">check</span>` : `<span class="material-icons text-danger" style="font-size: 1.5rem;">close</span>`;
                },
            },
            {
                field: "action",
                title: "Azioni",
                align: "center",
                width: 50,
                sortable: false,
                formatter: function (value, row, index) {
                    if (row.is_stock_service == 1) {
                        return `
                                <div class="d-flex justify-content-center align-items-center gap-2">
                                    <button type="button" class="btn btn-danger btn-sm" name="btn-disable-stock-service" title="Disabilita" data-id="${row.id_product}">
                                        <span class="material-icons">close</span>
                                    </button>
                                </div>`;
                    } else {
                        return `
                                <div class="d-flex justify-content-center align-items-center gap-2">
                                    <button type="button" class="btn btn-success btn-sm" name="btn-enable-stock-service" title="Abilita" data-id="${row.id_product}">
                                        <span class="material-icons">check</span>
                                    </button>
                                </div>`;
                    }
                },
            },
        ],
    });
}
