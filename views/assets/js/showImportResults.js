async function showImportResults(data) {
    const dialogExists = document.getElementById("import-stock-service-results");
    if (dialogExists) {
        const tableExists = dialogExists.querySelector("table");
        if (tableExists) {
            const rows = Array.isArray(data?.rows) ? data.rows : [];
            $(tableExists).bootstrapTable("load", rows);
        }
        dialogExists.showModal();
        return;
    }

    const template = document.getElementById("template-import-stock-service-results");
    console.log(template);

    const fragment = template.content.cloneNode(true);
    console.log("cloneNode", fragment);

    const dialog = fragment.querySelector("dialog");
    console.log("dialog", dialog);

    const table = fragment.querySelector("table");
    console.log("table", table);

    document.body.appendChild(dialog);

    // Close on ESC (cancel event)
    dialog.addEventListener("cancel", (e) => {
        // Allow default close but ensure consistency
        // If you want to prevent default and handle manually, uncomment next line
        // e.preventDefault(); dialog.close();
    });

    // Close on backdrop click
    dialog.addEventListener("click", (e) => {
        const rect = dialog.getBoundingClientRect();
        const inDialog = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
        if (!inDialog) {
            dialog.close();
        }
    });

    // Remove node on close to avoid duplicates/memory leaks
    dialog.addEventListener("close", () => {
        dialog.remove();
    });

    // Initialize table after dialog is in DOM
    if (typeof clearImportMessages === "function") clearImportMessages();
    if (typeof initTableResults === "function") {
        initTableResults(data.rows);
    }
    if (typeof addImportMessage === "function") addImportMessage("success", "Import completato");

    dialog.showModal();

    // Ensure the table scrolls within the modal-body and footer stays visible
    const modalBody = dialog.querySelector(".modal-body");
    if (modalBody) {
        const bodyHeight = modalBody.clientHeight;
        $("#table-import-stock-service-results").bootstrapTable("resetView", { height: bodyHeight - 16 });
    }
}
