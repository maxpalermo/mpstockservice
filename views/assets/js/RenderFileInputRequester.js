function mpStockServiceRenderFileInput(legacy = false) {
    let html;
    const fileId = "mpstockserviceFileUpload";
    const fakeFileId = "mpstockserviceFakeFile";
    const btnSelectFileId = "mpstockserviceBtnSelectFile";
    const btnLoadFileId = "mpstockserviceBtnLoadFile";
    const btnUnloadFileId = "mpstockserviceBtnUnloadFile";

    if (legacy) {
        html = `
        <div class="form-group d-grow" id="requester">
            <label>Importa un file XML</label>
            <div class="input-group">
                <input type="file" style="display: none;" id="${fileId}" accept=".xml">
                <input type="text" class="form-control" id="${fakeFileId}">
                <span class="input-group-addon" id="${btnSelectFileId}" title="Seleziona file XML" style="background-color: var(--white); color: var(--dark-gray);">
                    <span class="icon icon-folder-open text-default"></span>
                </span>
            </div>
            <div class="pull-right" style="margin-top: 0.5rem;">
                <button class="btn btn-default btn-ss-action" id="${btnLoadFileId}" title="Carica prodotti">
                    <span class="icon icon-upload text-info" data-color="text-info"></span>
                    <span>Carica le quantità</span>
                </button>
                <button class="btn btn-default btn-ss-action" id="${btnUnloadFileId}" title="Scarica prodotti">
                    <span class="icon icon-download text-danger" data-color="text-danger"></span>
                    <span>Scarica le quantità</span>
                </button>
                <button class="btn btn-default" title="Chiudi" onclick="toggleMpStockServiceDialog()">
                    <span class="icon icon-close text-danger" data-color="text-danger"></span>
                    <span>Chiudi</span>
                </button>
            </div>
        </div>
    `;
    } else {
        html = `
            <div class="form-group d-grow" id="requester">
                <label>Importa un file XML</label>
                <div class="input-group">
                    <input type="file" style="display: none;" id="${fileId}" accept=".xml">
                    <input type="text" class="form-control" id="${fakeFileId}">
                    <span class="input-group-text" id="${btnSelectFileId}" title="Seleziona file XML" style="background-color: var(--white); color: var(--dark-gray);">
                        <span class="material-icons undefined">file_open</span>
                    </span>
                </div>
                <div class="pull-right" style="margin-top: 0.5rem;">
                    <button class="btn btn-default btn-ss-action" id="${btnLoadFileId}" title="Carica prodotti">
                        <span class="material-icons text-info" data-color="text-info">upload</span>
                        <span>Carica le quantità</span>
                    </button>
                    <button class="btn btn-default btn-ss-action" id="${btnUnloadFileId}" title="Scarica prodotti">
                        <span class="material-icons text-danger" data-color="text-danger">download</span>
                        <span>Scarica le quantità</span>
                    </button>
                    <button class="btn btn-default" title="Chiudi" onclick="toggleMpStockServiceDialog()">
                        <span class="icon icon-close text-danger" data-color="text-danger"></span>
                        <span>Chiudi</span>
                    </button>
                </div>
            </div>
        `;
    }

    const tpl = document.createElement("template");
    tpl.innerHTML = html;

    const formGroup = tpl.content.cloneNode(true).querySelector("div.form-group");

    return formGroup;
}

function bindRenderFileInputActions(endpoint) {
    const onChange = (e, el) => {
        const target = e.target;

        if (target?.id == "mpstockserviceFileUpload") {
            const requester = document.getElementById("requester");
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
        const requester = document.getElementById("requester");
        if (!requester) {
            showErrorMessage("Container file upload non trovato.");
            return false;
        }

        const file = requester.querySelector("#mpstockserviceFileUpload");

        const target = el.closest("span.input-group-addon, span.input-group-text, .btn-ss-action ,#mpstockserviceFakeFile");
        if (target) {
            switch (target.id) {
                case "mpstockserviceFakeFile":
                case "mpstockserviceBtnSelectFile":
                    file.click();
                    return;
                case "mpstockserviceBtnLoadFile":
                    showNoticeMessage("Caricamento dei movimenti in corso...");
                    await mpStockServiceParseFile("load", file, endpoint);
                    return;
                case "mpstockserviceBtnUnloadFile":
                    showNoticeMessage("Scaricamento dei movimenti in corso...");
                    await mpStockServiceParseFile("unload", file, endpoint);
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
        const btn = el.closest(".input-group-addon, .input-group-text, .btn-ss-action, #mpstockserviceFakeFile");
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

    const container = document.getElementById("import-panel");
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

function toggleMpStockServiceDialog() {
    const dialog = document.getElementById("import-panel");
    const isVisible = dialog.open;

    if (isVisible) {
        mpStockServiceMoveGrowl(null, true);
        dialog.close();
        return;
    }

    mpStockServiceMoveGrowl(dialog, true);
    dialog.showModal();
}

async function mpStockServiceParseFile(type, file, endpoint) {
    console.table("TYPE", type, "ENDPOINT", "FILE", file);

    const formData = new FormData();
    formData.append("ajax", 1);
    formData.append("action", "parseFile");
    formData.append("type", type);

    file = file?.files?.[0] ?? null;

    if (!file) {
        showErrorMessage("Seleziona prima un file XML");
        return;
    }

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
        mpStockServiceShowTableResult(data.table);
    }

    showNoticeMessage("File elaborato con successo");
}

function mpStockServiceShowTableResult(tableHTML) {
    const template = document.createElement("template");
    template.innerHTML = tableHTML;

    const dialog = template.content.cloneNode(true).querySelector("dialog");

    if (document.getElementById("dialogTableResult")) {
        document.getElementById("dialogTableResult").remove();
    }

    document.body.appendChild(dialog);

    dialog.showModal();
}
