/**
 * File Upload management for Stock Service module
 */

import StockServiceTable from "./StockServiceTable.js";

export default class FileUpload {
    constructor(options = {}) {
        this.options = {
            fileUploadZoneId: "file-upload-zone",
            fileInputId: "fileUploadXml",
            selectedFileInfoClass: ".selected-file-info",
            fileNameClass: ".file-name",
            inputBtnId: "input-btn",
            removeFileClass: ".remove-file",
            dzMessageClass: ".dz-message",
            url: options.url ?? null,
            isChecked: options.isChecked ?? false,
            translations: {
                attention: "Attenzione",
                selectFile: "Seleziona un file prima di caricare.",
                invalidFormat: "Formato non valido",
                selectXmlFile: "Per favore seleziona un file XML.",
                error: "Error",
                ajaxError: "AJAX ERROR",
                success: "Successo",
                uploadResults: "Risultati dell'upload"
            },
            ...options
        };

        this.fileUploadZone = document.getElementById(this.options.fileUploadZoneId);
        this.fileInput = document.getElementById(this.options.fileInputId);
        this.selectedFileInfo = document.querySelector(this.options.selectedFileInfoClass);
        this.fileNameElement = document.querySelector(this.options.fileNameClass);
        this.buttonIcon = "";

        this.init();

        console.log("INIT FILEUPLOAD", this.options);
        console.log("OPTION SENT:", options);
    }

    init() {
        // Gestione click sul pulsante Browse
        document.getElementById(this.options.inputBtnId)?.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.fileInput.click();
        });

        // Gestione click sull'area di drop
        this.fileUploadZone?.addEventListener("click", (e) => {
            if (e.target === this.fileUploadZone || e.target.closest(this.options.dzMessageClass)) {
                this.fileInput.click();
            }
        });

        // Gestione eventi drag and drop
        this.fileUploadZone?.addEventListener("dragenter", this.handleDragEnter.bind(this));
        this.fileUploadZone?.addEventListener("dragover", this.handleDragOver.bind(this));
        this.fileUploadZone?.addEventListener("dragleave", this.handleDragLeave.bind(this));
        this.fileUploadZone?.addEventListener("drop", this.handleDrop.bind(this));

        // Gestione selezione file tramite input
        this.fileInput?.addEventListener("change", () => {
            if (this.fileInput.files.length) {
                this.handleFiles(this.fileInput.files);
            }
        });

        // Gestione rimozione file
        document.querySelector(this.options.removeFileClass)?.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.fileInput.value = "";
            this.selectedFileInfo.style.display = "none";
            document.querySelector(this.options.dzMessageClass).style.display = "block";
        });
    }

    handleDragEnter(e) {
        e.preventDefault();
        e.stopPropagation();
        this.fileUploadZone.classList.add("dragover");
    }

    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        this.fileUploadZone.classList.add("dragover");
    }

    handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        this.fileUploadZone.classList.remove("dragover");
    }

    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        this.fileUploadZone.classList.remove("dragover");

        if (e.dataTransfer.files.length) {
            this.fileInput.files = e.dataTransfer.files;
            this.handleFiles(e.dataTransfer.files);
        }
    }

    handleFiles(files) {
        if (files[0]) {
            const file = files[0];
            if (file.name.toLowerCase().endsWith(".xml")) {
                this.fileNameElement.textContent = file.name;
                this.selectedFileInfo.style.display = "block";
                document.querySelector(this.options.dzMessageClass).style.display = "none";
            } else {
                Swal.fire({
                    title: this.options.translations.invalidFormat,
                    text: this.options.translations.selectXmlFile,
                    icon: "error",
                    confirmButtonText: "OK"
                });
                this.fileInput.value = "";
            }
        }
    }

    setButtonIconLoading(button, loading = true) {
        if (loading) {
            this.buttonIcon = $(button).find("i").attr("class");
            $(button).find("i").removeClass().addClass("process-icon-loading");
        } else {
            $(button).find("i").removeClass().addClass(this.buttonIcon);
        }
    }

    uploadFile(type, e, force = false) {
        console.log("UPLOAD FILE", type, this.options.url);

        const data = new FormData();
        // Obtain the file from an <input type="file"> element
        const file = this.fileInput.files[0];

        if (file == undefined) {
            Swal.fire({
                title: this.options.translations.attention,
                text: this.options.translations.selectFile,
                icon: "warning",
                confirmButtonText: "OK"
            });
            return false;
        }

        // Append the file directly to a FormData object
        data.append("fileUpload", file, file.name);
        data.append("ajax", true);
        data.append("action", type);
        data.append("force_load", force);

        $.ajax({
            url: this.options.url,
            type: "POST",
            dataType: "JSON",
            data: data,
            contentType: false,
            cache: false,
            processData: false,
            beforeSend: () => {
                this.setButtonIconLoading(e, true);
            },
            success: (response) => {
                if (response.result) {
                    // Utilizziamo la nuova classe StockServiceTable per visualizzare i risultati
                    if (response.list && response.list.length > 0) {
                        const stockServiceTable = new StockServiceTable(response.list);
                        const tableHtml = stockServiceTable.render();

                        Swal.fire({
                            title: this.options.translations.uploadResults,
                            html: tableHtml,
                            icon: "success",
                            width: "80%",
                            confirmButtonText: "OK",
                            didOpen: (modalElement) => {
                                console.log("SweetAlert2 aperto, modifico z-index (con workaround)...");

                                // Ottieni il container principale del modal (questo dovrebbe funzionare)
                                const container = Swal.getContainer();

                                // --- Workaround per getBackdrop ---
                                // Seleziona manualmente il backdrop usando il suo selettore CSS
                                const backdrop = document.querySelector(".swal2-backdrop");
                                // --- Fine Workaround ---

                                if (container) {
                                    container.style.zIndex = 15000;
                                    console.log(`z-index del container impostato a ${container.style.zIndex}`);
                                } else {
                                    console.warn("Swal.getContainer() non ha restituito un elemento.");
                                }

                                // Controlla se il backdrop è stato trovato manualmente
                                if (backdrop) {
                                    backdrop.style.zIndex = 14999; // Imposta z-index leggermente inferiore
                                    console.log(`z-index del backdrop (trovato manualmente) impostato a ${backdrop.style.zIndex}`);
                                } else {
                                    // Potrebbe non esserci un backdrop se showBackdrop: false è impostato
                                    console.warn("Elemento backdrop (.swal2-backdrop) non trovato nel DOM.");
                                }
                            }
                        });
                    } else {
                        Swal.fire({
                            title: this.options.translations.success,
                            text: response.message || "Operazione completata con successo.",
                            icon: "success",
                            confirmButtonText: "OK"
                        });
                    }
                } else {
                    Swal.fire({
                        title: this.options.translations.error,
                        text: response.message || this.options.translations.ajaxError,
                        icon: "error",
                        confirmButtonText: "OK"
                    });
                }
            },
            error: (response) => {
                Swal.fire({
                    title: this.options.translations.error,
                    text: this.options.translations.ajaxError,
                    icon: "error",
                    confirmButtonText: "OK"
                });
                console.log(response.responseText);
            },
            complete: () => {
                this.setButtonIconLoading(e, false);
            }
        });
    }
}
