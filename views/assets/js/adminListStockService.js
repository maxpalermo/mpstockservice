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

function mpStockServiceBindDialogDelegation(dialogEl, { onChange, onClick, onFocusIn, onMouseOver, onMouseOut } = {}) {
    if (!(dialogEl instanceof HTMLDialogElement)) {
        return;
    }

    // evita bind multipli
    if (dialogEl.dataset.delegationBound === "1") {
        return;
    }
    dialogEl.dataset.delegationBound = "1";

    const handleChange = (e) => {
        const t = e.target instanceof Element ? e.target : null;
        if (!t) {
            return;
        }
        onClick?.(e, t);
    };

    const handleClick = async (e) => {
        const t = e.target instanceof Element ? e.target : null;
        if (!t) {
            return;
        }
        await onClick?.(e, t);
    };

    const handleFocusIn = (e) => {
        const t = e.target instanceof Element ? e.target : null;
        if (!t) {
            return;
        }
        onFocusIn?.(e, t);
    };

    const handleMouseOver = (e) => {
        const t = e.target instanceof Element ? e.target : null;
        if (!t) {
            return;
        }
        onMouseOver?.(e, t);
    };

    const handleMouseOut = (e) => {
        const t = e.target instanceof Element ? e.target : null;
        if (!t) {
            return;
        }
        onMouseOut?.(e, t);
    };

    dialogEl.addEventListener("change", handleChange);
    dialogEl.addEventListener("click", handleClick);
    dialogEl.addEventListener("focusin", handleFocusIn);
    dialogEl.addEventListener("mouseover", handleMouseOver);
    dialogEl.addEventListener("mouseout", handleMouseOut);

    // opzionale: funzione di cleanup
    return () => {
        dialogEl.removeEventListener("change", handleChange);
        dialogEl.removeEventListener("click", handleClick);
        dialogEl.removeEventListener("focusin", handleFocusIn);
        dialogEl.removeEventListener("mouseover", handleMouseOver);
        dialogEl.removeEventListener("mouseout", handleMouseOut);
        delete dialogEl.dataset.delegationBound;
    };
}
