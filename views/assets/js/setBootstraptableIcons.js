function setBootstrapTableIcons() {
    document.querySelectorAll("button[name=refresh] i").forEach((i) => {
        i.setAttribute("class", "material-icons");
        i.innerHTML = "refresh";
    });
}
