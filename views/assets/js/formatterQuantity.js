function formatterQuantity(value, row, index, ZeroOnNegative = false) {
    const colors = {
        success: "#72c279",
        danger: "#ff4444",
        warning: "#ffbb33",
    };

    let borderColor = colors.success;

    if (value < 0) {
        borderColor = colors.danger;
        if (ZeroOnNegative) {
            value = 0;
        }
    } else if (value == 0) {
        borderColor = colors.warning;
    }

    return `
            <div style="
                font-size: 1.0rem;
                border: none;
                padding: 4px;
                border: none;
                border-bottom: 4px solid ${borderColor};
            " class="quantity" data-value="${value}">${value}</div>
        `;
}

window.formatterQuantity = formatterQuantity;
