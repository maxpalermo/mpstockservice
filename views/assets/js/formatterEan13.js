function formatterEan13(value, row, index) {
    const tplEan13 = `
        <div class="input-group">
            <input type="text" class="form-control" style="width: 15rem;" name="productEan13"  value="${row.ean13}">
            <span class="input-group-text" name="btnSaveEan13" data-id="${row.id_product_attribute}">
                <span class="material-icons">save</span>
            </span>
        </div>
    `;

    const tpl = document.createElement("template");
    tpl.innerHTML = tplEan13;

    const inputEl = tpl.content.cloneNode(true).querySelector("div.input-group");

    return inputEl;
}
