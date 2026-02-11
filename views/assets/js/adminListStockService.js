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

async function bindToggleStockServiceIcons() {
    const btnToggleStockService = document.querySelectorAll(".btn-toggle-stock-service");

    if (btnToggleStockService) {
        btnToggleStockService.forEach((btn) => {
            btn.addEventListener("click", async function (e) {
                e.preventDefault();
                e.stopPropagation();

                const idProduct = this.dataset.id;
                const formData = new FormData();
                formData.append("ajax", 1);
                formData.append("action", "toggleStockService");
                formData.append("id_product", idProduct);

                try {
                    const response = await fetch(adminControllerUrl, {
                        method: "POST",
                        body: formData,
                    });

                    const data = await response.json();
                    const i = btn;
                    console.log("ICON", i);

                    if (data.success) {
                        if (data.status == "enabled" && i) {
                            i.style.color = "#72c279";
                            i.textContent = "check";
                        } else {
                            i.style.color = "#ff4444";
                            i.textContent = "close";
                            const quantity = btn.closest("tr").querySelector(".quantity").closest("td");
                            quantity.innerHTML = `
                                <div style="
                                    font-size: 1.0rem;
                                    border: none;
                                    padding: 4px;
                                    border: none;
                                    border-bottom: 4px solid #ffbb33;
                                " class="quantity" data-value="0">0</div>
                            `;
                        }
                    } else {
                        console.error("Errore lettura dati di risposta stock service:", data);
                    }
                } catch (error) {
                    console.error("Errore abilitazione/disabilitazione stock service:", error);
                }
            });
        });
    }
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
        pageSize: 50,
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
            setBootstrapTableIcons();
            bindToggleStockServiceIcons();

            new bindEnableDisableStockServiceList(adminControllerUrl);

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
                formatter: function (value, row, index) {
                    return `
                        <a href="${row.url}" target="_blank">
                            <span style="font-family:'monospace';">(${row.id_product})</span>
                            <span>${value}</span>
                        </a>
                        `;
                },
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
                formatter: (value, row, index) => formatterQuantity(value, row, index),
            },
            {
                field: "is_stock_service",
                title: "Stock service",
                align: "center",
                sortable: true,
                formatter: function (value, row, index) {
                    const icons = {
                        true: "check",
                        false: "close",
                    };
                    const colors = {
                        true: "#72c279",
                        false: "#ff4444",
                    };

                    const iconColor = value == 0 ? colors.false : colors.true;
                    const iconType = value == 0 ? icons.false : icons.true;

                    return `<span class="material-icons btn-toggle-stock-service" data-id="${row.id_product}" style="font-size: 1.5rem; font-weight: bold; color: ${iconColor}">${iconType}</span>`;
                },
            },
        ],
    });
}
