class Requester {
    endpoint = null;
    requesterContainerId = null;
    legacy = null;
    formRequester = null;
    dialog = null;
    file = null;

    formRequesterId = "requester";
    fileId = "mpstockserviceFileUpload";
    fakeFileId = "mpstockserviceFakeFile";
    btnSelectFileId = "mpstockserviceBtnSelectFile";
    btnLoadFileId = "mpstockserviceBtnLoadFile";
    btnUnloadFileId = "mpstockserviceBtnUnloadFile";

    constructor(endpoint, requesterContainerId, legacy = false, dialogId = null) {
        this.endpoint = endpoint;
        this.requesterContainerId = requesterContainerId;
        this.legacy = Number(legacy);
        if (dialogId) {
            this.dialog = document.getElementById(dialogId);
        }
        this.requester = this.mpStockServiceRenderFileInput(legacy);
    }

    render() {
        const self = this;
        let formRequester = document.getElementById(self.formRequesterId);
        if (!formRequester) {
            const requesterContainer = document.getElementById(self.requesterContainerId);
            if (!requesterContainer) {
                return false;
            }
            formRequester = self.mpStockServiceRenderFileInput(self.legacy);
            requesterContainer.innerHTML = "";
            requesterContainer.append(formRequester);
            this.formRequester = formRequester;
        } else {
            self.formRequester = formRequester;
        }

        self.file = formRequester.querySelector("#" + self.fileId);
        self.bindRenderFileInputActions();
    }

    mpStockServiceRenderFileInput(legacy = 0) {
        const self = this;
        let html;

        if (legacy == 1) {
            html = `
                <div class="form-group d-grow" id="${self.requester}">
                    <label>Importa un file XML</label>
                    <div class="input-group">
                        <input type="file" style="display: none;" id="${self.fileId}" accept=".xml">
                        <input type="text" class="form-control" id="${self.fakeFileId}">
                        <span class="input-group-addon" id="${self.btnSelectFileId}" title="Seleziona file XML" style="background-color: var(--white); color: var(--dark-gray);">
                            <span class="icon icon-folder-open text-default"></span>
                        </span>
                        <span class="input-group-addon" id="${self.btnLoadFileId}" title="Carica prodotti" style="background-color: var(--white); color: var(--dark-gray);">
                            <span class="icon icon-upload text-info" data-color="text-info"></span>
                        </span>
                        <span class="input-group-addon" id="${self.btnUnloadFileId}" title="Scarica prodotti">
                            <span class="icon icon-download text-danger" data-color="text-danger"></span>
                        </span>
                    </div>
                </div>
            `;
        } else {
            html = `
                <div class="form-group d-grow" id="${self.requester}">
                    <label>Importa un file XML</label>
                    <div class="input-group">
                        <input type="file" style="display: none;" id="${self.fileId}" accept=".xml">
                        <input type="text" class="form-control" id="${self.fakeFileId}">
                        <span class="input-group-text" id="${self.btnSelectFileId}" title="Seleziona file XML" style="background-color: var(--white); color: var(--dark-gray);">
                            <span class="material-icons undefined">file_open</span>
                        </span>
                        <span class="input-group-text" id="${self.btnLoadFileId}" title="Carica prodotti" style="background-color: var(--white); color: var(--dark-gray);">
                            <span class="material-icons text-info" data-color="text-info">upload</span>
                        </span>
                        <span class="input-group-text" id="${self.btnUnloadFileId}" title="Scarica prodotti">
                            <span class="material-icons text-danger" data-color="text-danger">download</span>
                        </span>
                    </div>
                </div>
                `;
        }

        const tpl = document.createElement("template");
        tpl.innerHTML = html;

        const container = tpl.content.cloneNode(true).querySelector("div.form-group");

        return container;
    }

    bindRenderFileInputActions(endpoint) {
        const self = this;
        const requester = self.formRequester;

        const onChange = (e, el) => {
            const target = e.target;

            if (target?.id == "mpstockserviceFileUpload") {
                const fake = requester.querySelector("#mpstockserviceFakeFile");
                try {
                    const fileName = el?.files[0].name || "";
                    fake.value = fileName;
                } catch (error) {
                    fake.value = "";
                }
            }
        };

        const onClick = async (e, el) => {
            if (!requester) {
                showErrorMessage("Requester trovato.");
                return false;
            }

            const file = requester.querySelector("#mpstockserviceFileUpload");

            const target = el.closest("span.input-group-addon, span.input-group-text, #mpstockserviceFakeFile");
            if (target) {
                switch (target.id) {
                    case "mpstockserviceFakeFile":
                    case "mpstockserviceBtnSelectFile":
                        file.click();
                        return;
                    case "mpstockserviceBtnLoadFile":
                        showNoticeMessage("Caricamento dei movimenti in corso...");
                        await self.parse("load");
                        return;
                    case "mpstockserviceBtnUnloadFile":
                        showNoticeMessage("Scaricamento dei movimenti in corso...");
                        await self.parse("unload");
                        return;
                }
            }
        };

        const onFocusIn = (e, el) => {
            if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
                el.select();
            }
        };

        const onMouseOver = (e, el) => {
            const btn = el.closest(".input-group-addon, .input-group-text, #mpstockserviceFakeFile");

            if (!btn) {
                return;
            }

            if (btn.id == "mpstockserviceFakeFile") {
                btn.style.cursor = "pointer";
                return;
            }

            btn.style.cursor = "pointer";
            btn.style.backgroundColor = "var(--cyan)";
            btn.style.color = "var(--white)";

            const iconLegacy = btn.querySelector("span.icon");
            if (iconLegacy) {
                iconLegacy.style.color = "var(--white)";
            }
        };

        const onMouseOut = (e, el) => {
            const btn = el.closest(".input-group-addon, .input-group-text, #mpstockserviceFakeFile");
            if (!btn) {
                return;
            }

            if (btn.contains(e.relatedTarget)) {
                return;
            }

            if (btn.id == "mpstockserviceFakeFile") {
                btn.style.cursor = "";
                return;
            }

            btn.style.cursor = "";
            btn.style.backgroundColor = "var(--white)";
            btn.style.color = "var(--dark-gray)";

            const iconLegacy = btn.querySelector("span.icon");
            if (iconLegacy) {
                iconLegacy.style.color = "";
            }
        };

        const container = self.formRequester;
        if (!container) {
            showErrorMessage("Requester non trovato.");
            return false;
        }

        container.addEventListener("change", (e) => {
            const el = e.target instanceof Element ? e.target : null;
            if (!el) return;
            onChange(e, el);
        });

        container.addEventListener("click", (e) => {
            const el = e.target instanceof Element ? e.target : null;
            if (!el) return;

            onClick(e, el);
        });

        container.addEventListener("focusin", (e) => {
            const el = e.target instanceof Element ? e.target : null;
            if (!el) return;
            onFocusIn(e, el);
        });

        container.addEventListener("mouseover", (e) => {
            const el = e.target instanceof Element ? e.target : null;
            if (!el) return;
            onMouseOver(e, el);
        });

        container.addEventListener("mouseout", (e) => {
            const el = e.target instanceof Element ? e.target : null;
            if (!el) return;
            onMouseOut(e, el);
        });
    }

    toggleMpStockServiceDialog() {
        const self = this;
        const dialog = this.dialog;
        const isVisible = dialog.open;

        if (isVisible) {
            self.moveGrowl(null);
            dialog.close();
            return;
        }

        self.moveGrowl(dialog);
        dialog.showModal();
    }

    async parse(type) {
        const self = this;
        const endpoint = this.endpoint;
        const formData = new FormData();
        const fileEl = this.formRequester.querySelector("#" + this.fileId);
        const file = fileEl?.files?.[0] ?? null;

        if (!file) {
            showErrorMessage("Seleziona prima un file XML");
            return;
        }

        formData.append("ajax", 1);
        formData.append("action", "parseFile");
        formData.append("type", type);
        formData.append("file", file);

        const response = await fetch(endpoint, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            showErrorMessage("Errore durante l'elaborazione del file");
            return;
        }

        const data = await response.json();

        if ("table" in data) {
            self.showTableResult(data.table);
        }

        showNoticeMessage("File elaborato con successo");
    }

    showTableResult(tableHTML) {
        const template = document.createElement("template");
        template.innerHTML = tableHTML;

        const dialog = template.content.cloneNode(true).querySelector("dialog");

        if (document.getElementById("dialogTableResult")) {
            document.getElementById("dialogTableResult").remove();
        }

        document.body.appendChild(dialog);

        dialog.showModal();
    }

    moveGrowl(container = null) {
        const legacy = this.legacy;
        let growl;

        if (legacy == 1) {
            growl = document.querySelector("#growls");
        } else {
            growl = document.querySelector("#growls-default");
        }

        if (growl) {
            growl.remove();
        }

        growl = document.createElement("div");
        if (legacy == 1) {
            growl.id = "growls";
        } else {
            growl.id = "growls-default";
        }

        if (container) {
            container.appendChild(growl);
        } else {
            document.body.appendChild(growl);
        }
    }
}
