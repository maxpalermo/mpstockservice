class bindStockServiceImport {
    adminControllerUrl = null;
    file = null;
    fakeFile = null;
    btnForceStockServiceName = null;
    btnSelectFile = null;
    btnLoadFile = null;
    btnUnloadFile = null;
    callback = null;

    constructor(adminControllerUrl, fileElementId, fakeFileElementId, btnForceStockServiceElementName, btnSelectFileElementId, btnLoadFileElementId, btnUnloadFileElementId, callback) {
        this.adminControllerUrl = adminControllerUrl;
        this.file = document.getElementById(fileElementId);
        this.fakeFile = document.getElementById(fakeFileElementId);
        this.btnForceStockServiceName = btnForceStockServiceElementName;
        this.btnSelectFile = document.getElementById(btnSelectFileElementId);
        this.btnLoadFile = document.getElementById(btnLoadFileElementId);
        this.btnUnloadFile = document.getElementById(btnUnloadFileElementId);
        this.callback = callback;
        this.bind();
    }

    bind() {
        const self = this;

        this.btnSelectFile.addEventListener("click", () => {
            self.file.click();
        });

        this.btnLoadFile.addEventListener("click", async () => {
            const result = await self.loadFile();
            callbackMethod("showImportResults", result);
        });

        this.btnUnloadFile.addEventListener("click", async () => {
            const result = await self.unloadFile();
            callbackMethod("showImportResults", result);
        });

        this.file.addEventListener("change", () => {
            try {
                const fileName = self.file.files[0].name || "";
                self.fakeFile.value = fileName;
            } catch (error) {
                self.fakeFile.value = "";
            }
        });
    }

    async loadFile() {
        return await this.import("load");
    }

    async unloadFile() {
        return await this.import("unload");
    }

    async import(movement) {
        const self = this;
        const file = self.file.files[0] || null;
        if (!file) {
            return "Nessun file selezionato";
        }
        const inputCheck = `input[name="${self.btnForceStockServiceName}"]:checked`;
        const btnChecked = document.querySelector(inputCheck).value;
        if (!btnChecked) {
            return "Nessun pulsante selezionato";
        }

        const formData = new FormData();
        formData.append("ajax", 1);
        formData.append("action", "importStockService");
        formData.append("file", file);
        formData.append("movement", movement);
        formData.append("force_update", btnChecked);

        let data;

        try {
            const response = await fetch(self.adminControllerUrl, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                return "Errore durante l'upload del file";
            }

            data = await response.json();
        } catch (e) {
            return "Errore di rete durante l'importazione";
        }

        return data;
    }
}
