class switchStockService {
    btnStockService = null;
    adminControllerUrl = null;
    idProduct = null;

    constructor(btnStockService, idProduct, adminControllerUrl) {
        this.btnStockService = btnStockService;
        this.idProduct = idProduct;
        this.adminControllerUrl = adminControllerUrl;
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        if (!this.btnStockService) {
            console.error("btnStockService non trovato");
            return;
        }

        this.btnStockService.addEventListener("click", async () => {
            const value = this.btnStockService.value;
            this.switchStockServiceAction(value);
        });
    }

    async switchStockServiceAction(value) {
        const self = this;
        const response = await fetch(self.adminControllerUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                ajax: 1,
                action: "switchStockService",
                id_product: self.idProduct,
                switch_stock_service: value,
            }),
        });
        const data = await response.json();

        if (data.success) {
            showAlertMessageStockService(data.message, "alert-success");
        } else {
            showAlertMessageStockService(data.message, "alert-danger");
        }
    }
}
