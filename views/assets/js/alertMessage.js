class alertMessageStockService {
    alertMessageElement = null;

    constructor(parentElement) {
        this.alertMessageElement = this.createElement();
        parentElement.appendChild(this.alertMessageElement);
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        if (!this.alertMessageElement) {
            console.error("alertMessageElement non trovato");
            return;
        }
    }

    createElement() {
        const alertMessage = document.createElement("div");
        alertMessage.classList.add("alert");
        alertMessage.classList.add("alert-success");
        alertMessage.style.display = "none";
        alertMessage.setAttribute("role", "alert");
        alertMessage.setAttribute("aria-live", "assertive");
        alertMessage.setAttribute("aria-atomic", "true");
        alertMessage.innerHTML = `
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
            <span class="alert-message"></span>
        `;
        return alertMessage;
    }

    show(message, type = "alert-info") {
        const alertMessage = this.alertMessageElement;
        if (!alertMessage) return;

        alertMessage.classList.remove("alert-success");
        alertMessage.classList.remove("alert-danger");
        alertMessage.classList.remove("alert-info");
        alertMessage.classList.remove("alert-warning");

        alertMessage.querySelector(".alert-message").innerHTML = message;
        alertMessage.classList.add(type);

        $(alertMessage).fadeIn();

        alertMessage._hideTimeout = setTimeout(() => {
            // Start fade-out
            $(alertMessage).fadeOut();
        }, 5000);
    }
}
