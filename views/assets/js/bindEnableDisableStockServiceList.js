class bindEnableDisableStockServiceList {
    adminControllerUrl = null;
    btnEnableStockService = null;
    btnDisableStockService = null;

    constructor(adminControllerUrl) {
        this.adminControllerUrl = adminControllerUrl;
        this.bindEvents();
    }

    bindEvents() {
        const self = this;
        self.btnEnableStockService = document.querySelectorAll("button[name=btn-enable-stock-service]");
        self.btnDisableStockService = document.querySelectorAll("button[name=btn-disable-stock-service]");

        if (!self.btnEnableStockService || !self.btnDisableStockService) {
            console.error("btnEnableStockService o btnDisableStockService non trovati");
            return;
        }

        self.btnEnableStockService.forEach((btn) => {
            btn.addEventListener("click", async () => {
                const idProduct = btn.getAttribute("data-id");
                await self.enableStockService(idProduct);
                self.refreshAdminStockServiceTable();
            });
        });

        self.btnDisableStockService.forEach((btn) => {
            btn.addEventListener("click", async () => {
                const idProduct = btn.getAttribute("data-id");
                await self.disableStockService(idProduct);
                self.refreshAdminStockServiceTable();
            });
        });
    }

    async enableStockService(idProduct) {
        const self = this;
        const response = await fetch(self.adminControllerUrl, {
            method: "POST",
            body: new URLSearchParams({
                action: "enableStockService",
                ajax: 1,
                id_product: idProduct,
            }),
        });
        const data = await response.json();
        return data;
    }

    async disableStockService(idProduct) {
        const self = this;
        const response = await fetch(self.adminControllerUrl, {
            method: "POST",
            body: new URLSearchParams({
                action: "disableStockService",
                ajax: 1,
                id_product: idProduct,
            }),
        });
        const data = await response.json();
        return data;
    }

    refreshAdminStockServiceTable() {
        $("#table-list-stock-service").bootstrapTable("refresh");
    }
}
