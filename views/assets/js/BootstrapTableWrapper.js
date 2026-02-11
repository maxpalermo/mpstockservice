class BootstrapTableWrapper {
    tableId = "";
    orderId = 0;
    customerId = 0;
    adminControllerUrl = "";
    type = "";
    uniqueId = "";
    toolbarId = null;
    table = null;

    constructor(adminControllerUrl, tableId, orderId, customerId, type, uniqueId, toolbarId = null) {
        this.tableId = tableId;
        this.adminControllerUrl = adminControllerUrl;
        this.orderId = orderId;
        this.customerId = customerId;
        this.type = type;
        this.uniqueId = uniqueId;
        this.toolbarId = toolbarId;
        this.table = $("#" + tableId);

        this.initTable();

        console.log("MODULE MPNOTES - BootstrapTableWrapper constructor");
        console.log(`MODULE MPNOTES - BootstrapTableWrapper adminControllerURL: ${this.adminControllerUrl}`);
        console.log(`MODULE MPNOTES - BootstrapTableWrapper TYPE: ${this.type}`);
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
                    action: "fetchAllNotes",
                    type: self.type,
                    limit: params.limit,
                    offset: params.offset,
                    search: params.search,
                    sort: params.sort == undefined ? "a.date_add" : params.sort,
                    order: params.order == undefined ? "desc" : params.order,
                    filter: params.filter == undefined ? "" : params.filter,
                    orderId: self.orderId,
                    customerId: self.customerId,
                };

                console.log("MODULE MPNOTES - BootstrapTableWrapper queryParams", searchParams);

                return searchParams;
            },
            search: true,
            filterControl: false,
            filterControlVisible: false,
            filterControlSearchClear: false,
            showFilterControlSwitch: false,
            searchOnEnterKey: true,
            sortSelectOptions: true,
            serverSort: true,
            sidePagination: "server",
            pagination: true,
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
            },
            onPostBody: function () {
                console.log(`MODULE MPNOTES - Bootstrap ${self.tableId} Table pronta.`);
                self.fixDropDownPagination();
                self.bindActionButtons();
                self.setBootstrapTableIcons();
                self.bindImgPreviewAttachments();
            },
            columns: [
                {
                    field: "id_mpnote",
                    title: "ID",
                    align: "left",
                    sortable: true,
                    uniqueId: true,
                    filterControl: "input",
                    formatter: function (value, row, index) {
                        return `<span style="font-family:'monospace';">${value}</span>`;
                    },
                },
                {
                    field: "id_order",
                    title: "Id Ordine",
                    align: "left",
                    sortable: true,
                    filterControl: "input",
                    formatter: function (value, row, index) {
                        console.log("ORDER ID: ", self.orderId, row.editOrderUrl);
                        const orderID = self.orderId;
                        if (row.id_order > 0) {
                            if (row.id_order == orderID) {
                                return `<span style="font-family:'monospace';" class="text-danger">${value}</span>`;
                            } else {
                                return `<a href="${row.editOrderUrl}" target="_blank"><span style="font-family:'monospace';">${value}</span></a>`;
                            }
                        }
                        return `<span style="font-family:'monospace';">--</span>`;
                    },
                },
                {
                    field: "gravity",
                    title: "tipo",
                    align: "center",
                    width: 38,
                    sortable: true,
                    filterControl: "input",
                    formatter: function (value, row, index) {
                        switch (value) {
                            case "info":
                                return `<span class="btn-toggle-gravity material-icons text-info d-center-center" title="Info" data-id-note="${row.id_mpnote}">info</span>`;
                            case "warning":
                                return `<span class="btn-toggle-gravity material-icons text-warning d-center-center" title="Avviso" data-id-note="${row.id_mpnote}">warning</span>`;
                            case "error":
                                return `<span class="btn-toggle-gravity material-icons text-danger d-center-center" title="Errore" data-id-note="${row.id_mpnote}">error</span>`;
                            case "success":
                                return `<span class="btn-toggle-gravity material-icons text-success d-center-center" title="Successo" data-id-note="${row.id_mpnote}">check_circle</span>`;
                            default:
                                return `<span class="btn-toggle-gravity material-icons text-info d-center-center" title="Info" data-id-note="${row.id_mpnote}">info</span>`;
                        }
                    },
                },
                {
                    field: "content",
                    title: "Contenuto",
                    align: "left",
                    sortable: true,
                    formatter: function (value, row, index) {
                        return `${row.content}`;
                    },
                },
                {
                    field: "employee_firstname",
                    title: "Operatore",
                    align: "left",
                    sortable: true,
                    formatter: function (value, row, index) {
                        return `${row.employee_firstname} ${row.employee_lastname}`;
                    },
                },
                {
                    field: "printable",
                    title: "Stampabile",
                    align: "center",
                    width: 38,
                    sortable: true,
                    formatter: function (value, row, index) {
                        if (value == 1) {
                            return `<span class="btn-toggle-printable material-icons text-success d-center-center" title="Stampabile" data-id-note="${row.id_mpnote}">printer</span>`;
                        } else {
                            return `<span class="btn-toggle-printable material-icons text-danger d-center-center" title="Non stampabile" data-id-note="${row.id_mpnote}">printer</span>`;
                        }
                    },
                },
                {
                    field: "chat",
                    title: "Chat",
                    align: "center",
                    width: 38,
                    sortable: true,
                    formatter: function (value, row, index) {
                        if (value == 1) {
                            return `<span class="btn-toggle-chat material-icons text-success d-center-center" title="Chat" data-id-note="${row.id_mpnote}">chat</span>`;
                        } else {
                            return `<span class="btn-toggle-chat material-icons text-danger d-center-center" title="Non chat" data-id-note="${row.id_mpnote}">chat</span>`;
                        }
                    },
                },
                {
                    field: "attachments",
                    title: "Allegati",
                    align: "center",
                    sortable: true,
                    formatter: function (value, row, index) {
                        return value;
                    },
                },
                {
                    field: "date_add",
                    title: "Data Inserimento",
                    align: "center",
                    sortable: true,
                    formatter: function (value, row, index) {
                        return row.date_add;
                    },
                },
                {
                    field: "date_upd",
                    title: "Data Aggiornamento",
                    align: "center",
                    sortable: true,
                    formatter: function (value, row, index) {
                        return row.date_upd;
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
                                <button type="button" class="btn btn-primary btn-sm" name="btn-edit-note" title="Modifica" data-type="${row.type}" data-id-note="${row.id_mpnote}">
                                    <span class="material-icons">edit</span>
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
            throw new Error("MPNOTES: fetch: Network response was not ok");
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
        const btnToggleChat = table.querySelectorAll(".btn-toggle-chat");
        const btnTogglePrintable = table.querySelectorAll(".btn-toggle-printable");
        const btnToggleGravity = table.querySelectorAll(".btn-toggle-gravity");
        const btnEditNote = table.querySelectorAll("[name=btn-edit-note]");
        const btnNewNotes = document.querySelectorAll(".btn-new-note");
        const btnAddAttachment = document.querySelectorAll(".btn-add-attachment");

        btnToggleChat.forEach(async (item) => {
            item.addEventListener("click", async (e) => {
                e.preventDefault();
                e.stopPropagation();

                if (confirm("Cambiare lo stato del valore chat?") == false) {
                    return;
                }

                const data = await self.fetch("toggleChat", {
                    id: item.dataset.idNote,
                });

                self.refreshTable();
            });
        });

        btnTogglePrintable.forEach(async (item) => {
            item.addEventListener("click", async (e) => {
                e.preventDefault();
                e.stopPropagation();

                if (confirm("Cambiare lo stato del valore stampabile?") == false) {
                    return;
                }

                const data = await self.fetch("togglePrintable", {
                    id: item.dataset.idNote,
                });

                self.refreshTable();
            });
        });

        btnEditNote.forEach(async (item) => {
            item.addEventListener("click", async (e) => {
                e.preventDefault();
                e.stopPropagation();

                const response = await self.fetch("getNoteDetails", {
                    id: item.dataset.idNote,
                });

                if (response.success == false) {
                    alert(response.data.message);
                    return false;
                }

                self.showEditNoteModal(response.data);
            });
        });

        btnNewNotes.forEach((btn) => {
            btn.removeEventListener("click", () => {
                //Nothing
            });

            btn.addEventListener("click", () => {
                const typeNote = btn.dataset.type;
                const data = {
                    type: typeNote,
                };
                this.showEditNoteModal(data);
            });
        });

        btnAddAttachment.forEach((item) => {
            item.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                const target = item.dataset.target;
                console.log("Target:", target);
                // Get data
                const idNote = item.dataset.id;
                const idCustomer = item.dataset.customer;
                const idOrder = item.dataset.order;
                const idType = item.dataset.type;
                // Open the attachments preview modal

                $(target).modal("show");

                const btnSubmit = document.getElementById("btnSubmitAttachment");
                btnSubmit.setAttribute("data-id-note", idNote);
                btnSubmit.setAttribute("data-id-customer", idCustomer);
                btnSubmit.setAttribute("data-id-order", idOrder);
                btnSubmit.setAttribute("data-id-type", idType);
                console.log("Setting data on btnSubmit:", btnSubmit.attributes);
            });
        });
    }

    showEditNoteModal(data) {
        const self = this;
        const template = document.getElementById("DialogMpNote-template-form-note");
        const element = template.content.cloneNode(true);

        if (document.getElementById("DialogMpNote-dialog-form-note")) {
            document.getElementById("DialogMpNote-dialog-form-note").remove();
        }

        const dialog = document.createElement("dialog");
        dialog.id = "DialogMpNote-dialog-form-note";
        dialog.appendChild(element);
        document.body.appendChild(dialog);

        document.getElementById("DialogMpNote-Type").value = data.type;
        if (data.id != 0) {
            document.getElementById("DialogMpNote-Id").value = data.id == "undefined" ? "--" : data.id;
        } else {
            document.getElementById("DialogMpNote-Id").value = "--";
        }
        if (data.id_order != 0) {
            document.getElementById("DialogMpNote-OrderId").value = data.id_order;
        } else {
            document.getElementById("DialogMpNote-OrderId").value = "--";
        }
        if (data.id_customer != 0) {
            document.getElementById("DialogMpNote-CustomerId").value = data.id_customer;
            document.getElementById("DialogMpNote-CustomerName").value = `${data.customer_firstname} ${data.customer_lastname}`;
        } else {
            document.getElementById("DialogMpNote-CustomerId").value = "--";
            document.getElementById("DialogMpNote-CustomerName").value = "--";
        }
        if (data.id_employee) {
            document.getElementById("DialogMpNote-EmployeeId").value = data.id_employee;
            document.getElementById("DialogMpNote-EmployeeName").value = `${data.employee_firstname} ${data.employee_lastname}`;
        } else {
            document.getElementById("DialogMpNote-EmployeeId").value = "--";
            document.getElementById("DialogMpNote-EmployeeName").value = "--";
        }
        document.getElementById("DialogMpNote-Content").value = data.content;
        if (data.printable == 1) {
            document.getElementById("DialogMpNote-Printable-1").checked = true;
        } else {
            document.getElementById("DialogMpNote-Printable-0").checked = true;
        }

        const submitBtn = document.getElementById("DialogMpNote-SubmitForm");
        submitBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            e.stopPropagation;
            const form = document.getElementById("DialogMpNote-formEditNote");
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            const response = await self.fetch("updateNote", data);

            if (response.success) {
                dialog.close();
                self.refreshTable();
            }
        });

        dialog.showModal();
    }

    bindImgPreviewAttachments() {
        let lighBoxElement = document.getElementById("lightboxId-preview-attachments");
        if (!lighBoxElement) {
            const lighBoxHtml = `
                    <div id="lightboxId-preview-attachments" class="mpnotes-lightbox">
                        <div class="mpnotes-lightbox-close">&times;</div>
                        <div class="mpnotes-lightbox-content">
                            <img src="" alt="">
                            <div class="mpnotes-lightbox-title"></div>
                        </div>
                    </div>
                `;
            document.body.insertAdjacentHTML("beforeend", lighBoxHtml);
            lighBoxElement = document.getElementById("lightboxId-preview-attachments");
        }

        const lightboxImg = lighBoxElement.querySelector(".mpnotes-lightbox-content img");
        const lightboxTitle = lighBoxElement.querySelector(".mpnotes-lightbox-title");
        const lightboxClose = lighBoxElement.querySelector(".mpnotes-lightbox-close");
        const attachmentImages = document.querySelectorAll(".img-preview-carousel");

        // Apri lightbox al click sull'immagine
        attachmentImages.forEach((img) => {
            img.addEventListener("click", function (e) {
                e.preventDefault();
                e.stopPropagation();
                lightboxImg.src = this.src;
                lightboxImg.alt = this.alt;
                lightboxTitle.textContent = this.dataset.title || this.alt;
                lighBoxElement.classList.add("active");
                document.body.style.overflow = "hidden";
            });
        });

        // Chiudi lightbox
        function closeLightbox() {
            lighBoxElement.classList.remove("active");
            document.body.style.overflow = "";
        }

        lightboxClose.addEventListener("click", function (e) {
            e.stopPropagation();
            closeLightbox();
        });

        lighBoxElement.addEventListener("click", function (e) {
            if (e.target === lighBoxElement) {
                closeLightbox();
            }
        });

        // Chiudi con ESC
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && lighBoxElement.classList.contains("active")) {
                closeLightbox();
            }
        });
    }

    static closeModal() {
        document.getElementById("DialogMpNote-dialog-form-note").closest("dialog").close();
    }

    static showAddAttachment(idNote, idCustomer, idOrder, typeNote) {
        const existsElement = document.getElementById("mpnote-add-attachment");
        if (existsElement) {
            existsElement.remove();
        }

        const attachmentNode = this.createNodeElement(this.getTemplateAddAttachmentElement());
        const attachmentSubmit = attachmentNode.querySelector("#btnSubmitAttachment");

        const submitAttachment = async function (form) {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            const result = await this.fetch("submitAttachment", data);

            if (result.success) {
                this.showAlert("Successo", result.message, "success");
            } else {
                this.showAlert("Errore", result.message, "error");
            }
        };

        const bindSubmitAddAttachmentButtons = async function () {
            const btnSubmit = document.getElementById("MpNoteSubmitNote");
            if (btnSubmit) {
                btnSubmit.removeEventListener("click", function () {
                    console.log("Evento rimosso");
                });
                btnSubmit.addEventListener("click", async (event) => {
                    event.preventDefault();
                    event.stopPropagation();

                    const form = document.getElementById("mpnote-form-add-attachment");
                    if (form) {
                        await submitAttachment(form);
                    }
                    return false;
                });
            }

            return false;
        };

        const bindBtnSubmitAttachment = function () {
            const btnSubmitAttachment = document.getElementById("btnSubmitAttachment");

            if (!btnSubmitAttachment) {
                return;
            }

            btnSubmitAttachment.removeEventListener("click", () => {
                console.log("Rimuovo bind su %s", btnSubmitAttachment.dataset.id);
            });

            btnSubmitAttachment.addEventListener("click", async (e) => {
                e.preventDefault();
                const btn = e.currentTarget;

                console.log("Aggiungo bind su %s", btn.dataset.id_note);

                const idNote = btn.dataset.id_note;
                const idOrder = btn.dataset.id_order;
                const idCustomer = btn.dataset.id_customer;
                const idType = btn.dataset.id_type;
                const form = document.getElementById("mpnote-form-add-attachment");
                const formData = new FormData(form);
                formData.append("ajax", 1);
                formData.append("action", "addAttachment");
                formData.append("idNote", idNote);
                formData.append("idOrder", idOrder);
                formData.append("idCustomer", idCustomer);
                formData.append("idType", idType);

                const response = await fetch(this.ajaxController, {
                    method: "POST",
                    body: formData,
                });

                const data = await response.json();

                if (data.success) {
                    this.showAlert("Allegato aggiunto con successo", "", "success");
                } else {
                    this.showAlert("Errore", data.message, "error");
                }

                return false;
            });
        };

        const imagePreview = function () {
            document.getElementById("MpNoteAttachment").addEventListener("change", function () {
                const file = this.files[0];
                const reader = new FileReader();
                reader.onload = function (e) {
                    const img = document.querySelector("#imgMpNoteAttachment");
                    img.src = e.target.result;
                };
                reader.readAsDataURL(file);
            });
        };

        attachmentSubmit.dataset.id_note = idNote;
        attachmentSubmit.dataset.id_order = idOrder;
        attachmentSubmit.dataset.id_customer = idCustomer;
        attachmentSubmit.dataset.id_type = typeNote;

        this.showAlert("Aggiungi allegato", attachmentNode, "info");

        bindSubmitAddAttachmentButtons();
        bindBtnSubmitAttachment();
        imagePreview();
    }
}
