function mpStockServiceMoveGrowl(container = null, legacy = false) {
    let growl;
    if (legacy) {
        growl = document.querySelector("#growls");
    } else {
        growl = document.querySelector("#growls-default");
    }

    if (growl) {
        growl.remove();
    }

    growl = document.createElement("div");
    if (legacy) {
        growl.id = "growls";
    } else {
        growl.id = "growls-default";
    }

    if (container) {
        container.appendChild(growl);
    } else {
        document.body.appendChild(growl);
    }
}
