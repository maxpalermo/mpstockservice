function mpStockServiceBindChangeFileInput(e, el) {}

async function mpStockServiceBindFileInput(el, endpoint) {}

async function mpStockServiceBindMouseEvent(el) {
    el.addEventListener("mouseover", (e) => {
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

    el.addEventListener("mouseout", (e) => {
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

    el.addEventListener("focusin", (e) => {
        const el = e.target;
        if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
            el.select();
        }
    });
}
