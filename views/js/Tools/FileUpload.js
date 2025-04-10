/**
 * File Upload management for Stock Service module
 */

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
            ajaxController: null,
            isChecked: false,
            translations: {
                attention: "Attenzione",
                selectFile: "Seleziona un file prima di caricare.",
                invalidFormat: "Formato non valido",
                selectXmlFile: "Per favore seleziona un file XML.",
                error: "Error",
                ajaxError: "AJAX ERROR"
            },
            ...options
        };

        this.fileUploadZone = document.getElementById(this.options.fileUploadZoneId);
        this.fileInput = document.getElementById(this.options.fileInputId);
        this.selectedFileInfo = document.querySelector(this.options.selectedFileInfoClass);
        this.fileNameElement = document.querySelector(this.options.fileNameClass);
        this.buttonIcon = "";

        this.init();
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

    uploadFile(type, button) {
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
        data.append("action", type + "StockService");
        data.append("force_load", this.options.isChecked);
        data.append("is_stock_service", $("input[name=opt_ss]:checked").val());

        $.ajax({
            url: this.options.ajaxController,
            type: "POST",
            dataType: "JSON",
            data: data,
            contentType: false,
            cache: false,
            processData: false,
            beforeSend: () => {
                this.setButtonIconLoading(button, true);
            },
            success: (response) => {
                $("#tableOut .tableOut").html(response.tableOut);
                $("#tableOut .totStockRows").html(response.totStockRows);
                $("#tableOut").modal("show");
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
                this.setButtonIconLoading(button, false);
            }
        });
    }
}
