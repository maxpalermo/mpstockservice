class BindStockServiceEventsDelegation {
    module = document.getElementById("module_mpstockservice");
    endpoint = null;
    file = null;
    fakeFile = null;
    btnForceStockServiceElementName = null;
    btnSelectFile = null;
    btnLoadFile = null;
    btnUnloadFile = null;
    switchStockServiceOnOff = null;
    switchStockServiceForceImport = null;
    table = null;
    tableClass = null;
    productId = null;

    constructor(endpoint, productId) {
        this.endpoint = endpoint;
        this.productId = productId;
        this.cacheDOM();
        this.bind();
        console.log("DOMContent Bind MpStockService");
    }

    cacheDOM() {
        this.table = document.getElementById("table-list-stock-service");
        this.file = document.getElementById("mpstockserviceFileUpload");
        this.fakeFile = document.getElementById("mpstockserviceFakeFile");
        this.btnForceStockServiceName = "force_update";
        this.btnSelectFile = document.getElementById("mpstockserviceBtnSelectFile");
        this.btnLoadFile = document.getElementById("mpstockserviceBtnLoadFile");
        this.btnUnloadFile = document.getElementById("mpstockserviceBtnUnloadFile");
        this.switchStockServiceOnOff = document.querySelectorAll("input[name='switchStockServiceOnOff']");
        this.switchStockServiceForceImport = document.querySelectorAll("input[name='switchStockServiceForceImport']");
        this.tableClass = new BindStockServiceBsTable(this.table, this.endpoint, this.productId);
    }

    bind() {
        const self = this;

        if (!self.module) {
            console.error("MpStockServiceBindEventsDelegation: container #module_mpstockservice not found");
            return;
        }

        if (self.file) {
            self.file.addEventListener("change", () => {
                if (self.fakeFile) {
                    self.fakeFile.value = self.file.files?.[0]?.name ?? "";
                }
            });
        }

        self.module.addEventListener("click", async (e) => {
            const target = e.target;
            const el = target instanceof Element ? target : null;
            if (!el) {
                return;
            }

            mpStockServiceBindFileInput(el, self.endpoint);

            if (el.id === "mpstockserviceBtnSaveStockService") {
                if (confirm("Aggiornare lo stock service?") == false) {
                    return;
                }
                const status = await self.update();
                if (status == 1) {
                    showSuccessMessage("Operazione eseguita.");
                }
                self.refresh();
            }

            const btnEan13 = el.closest("[name=btnSaveEan13]");
            if (btnEan13) {
                if (!confirm("Modificare il codice EAN13?")) {
                    return;
                }
                const value = btnEan13.closest("div.input-group").querySelector("input").value;
                const id = btnEan13.dataset.id;
                const data = await fetchCall(self.endpoint, "saveEan13", { ean13: value, id_product_attribute: id });
                if (data.result == true) {
                    showSuccessMessage(data.message);
                } else {
                    showErrorMessage(data.message);
                }
                self.refresh();

                return;
            }

            const input = el.closest("input");
            if (!input) {
                return;
            }

            if (input.name === "switchStockServiceOnOff") {
                if (!confirm("Modificare lo Stock Service?")) {
                    e.preventDefault();
                    return;
                }
                const value = input.value;
                const data = await fetchCall(self.endpoint, "toggle", { toggle: value, id_product: self.productId });
                if (data.result == true) {
                    showSuccessMessage("Stock Service aggiornato");
                } else {
                    showErrorMessage("Stock service non aggiornato");
                }
                self.refresh();

                showHideTable();

                return;
            }
        });

        self.module.addEventListener("mouseover", (e) => {
            const target = e.target;
            const el = target instanceof Element ? target : null;
            if (!el) {
                return;
            }

            const btn = el?.closest?.(".input-group-text");
            if (btn) {
                const icon = btn.querySelector("span.material-icons");

                btn.style.cursor = "pointer";
                btn.style.backgroundColor = "var(--cyan)";
                btn.style.color = "var(--white)";
                icon.classList = "material-icons text-white";
            }

            const fakeFile = el?.closest("#mpstockserviceFakeFile");
            if (fakeFile) {
                fakeFile.style.cursor = "pointer";
            }
        });

        self.module.addEventListener("mouseout", (e) => {
            const target = e.target;
            const el = target instanceof Element ? target : null;
            const btn = el?.closest?.(".input-group-text");
            if (btn) {
                btn.style.cursor = "";
                btn.style.backgroundColor = "var(--white)";
                btn.style.color = "var(--dark-gray)";
                const icon = btn.querySelector("span.material-icons");
                if (icon) {
                    const color = icon.dataset.color;
                    icon.classList = "material-icons " + color;
                }
            }

            const fakeFile = el?.closest("#mpstockserviceFakeFile");
            if (fakeFile) {
                fakeFile.style.cursor = "";
            }
        });

        self.module.addEventListener("focusin", (e) => {
            const el = e.target;
            if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
                el.select();
            }
        });

        self.table.addEventListener("click", (event) => {
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
                let result = qty + variation;
                if (result < 0) {
                    result = 0;
                }
                tr.querySelector("div.quantity").textContent = result;
            }
        });
    }

    async update() {
        const self = this;
        const rows = [];
        const isStockService = self.module.querySelector("[name=switchStockServiceOnOff]:checked").value;

        if (isStockService == 0) {
            showErrorMessage("Il prodotto non ha lo Stock Service attivato.");
            return false;
        }

        const tr = self.table.querySelectorAll("tbody tr");
        if (tr.length == 0) {
            showErrorMessage("Errore durante la lettura della tabella");
            return false;
        }

        tr.forEach((itm) => {
            const row = {};
            row.idx = itm.dataset.index;
            const tds = itm.querySelectorAll("td");
            tds.forEach((td, index) => {
                switch (index) {
                    case 0:
                        row.name = td.textContent.trim();
                        break;
                    case 1:
                        row.ean13 = td.querySelector("input")?.value.trim() || "";
                        break;
                    case 2:
                        row.quantity = Number(td.querySelector("div").textContent.trim());
                    case 3:
                        row.variation = Number(td.querySelector("input")?.value ?? 0);
                        break;
                    case 4:
                        row.documentNumber = td.querySelector("input")?.value ?? "";
                        break;
                    case 5:
                        row.documentDate = td.querySelector("input")?.value ?? "";
                        break;
                }
            });

            rows.push(row);
        });

        console.log(rows);
        const params = {
            switchOnOff: self.module.querySelector("input[name='switchStockServiceOnOff']:checked").value,
            switchForced: self.module.querySelector("input[name='switchStockServiceForceImport']:checked").value,
            rows: rows,
        };

        await fetchCall(self.endpoint, "update", params);

        return true;
    }

    refresh() {
        $(this.table).bootstrapTable("refresh");
    }
}
