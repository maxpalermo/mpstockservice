/**
 * Classe per la creazione di una tabella che mostra i risultati dell'upload del file stock service
 */
class StockServiceTable {
    /**
     * Costruttore della classe
     * @param {Array} rows - Array di righe da visualizzare nella tabella
     * @param {Object} options - Opzioni di configurazione della tabella
     */
    constructor(rows, options = {}) {
        this.rows = rows || [];
        this.options = {
            tableClass: "stock-service-table",
            headerClass: "stock-service-header",
            bodyClass: "stock-service-body",
            rowClass: "stock-service-row",
            cellClass: "stock-service-cell",
            updatedIconSuccess: '<i class="material-icons text-success">check_circle</i>',
            updatedIconError: '<i class="material-icons text-danger">cancel</i>',
            emptyMessage: "Nessun dato disponibile",
            ...options
        };
    }

    /**
     * Genera l'intestazione della tabella
     * @returns {string} HTML dell'intestazione della tabella
     */
    generateHeader() {
        return `
            <thead class="${this.options.headerClass}">
                <tr>
                    <th>Prodotto</th>
                    <th>Riferimento</th>
                    <th>Combinazione</th>
                    <th>EAN13</th>
                    <th>Aggiornato</th>
                    <th>Prima</th>
                    <th>Variazione</th>
                    <th>Dopo</th>
                </tr>
            </thead>
        `;
    }

    /**
     * Genera il corpo della tabella
     * @returns {string} HTML del corpo della tabella
     */
    generateBody() {
        if (!this.rows || this.rows.length === 0) {
            return `
                <tbody class="${this.options.bodyClass}">
                    <tr>
                        <td colspan="8" class="text-center">${this.options.emptyMessage}</td>
                    </tr>
                </tbody>
            `;
        }

        const rows = this.rows
            .map((row) => {
                const updatedIcon = row.updated ? this.options.updatedIconSuccess : this.options.updatedIconError;

                return `
                <tr class="${this.options.rowClass}" data-id-product="${row.id_product}" data-id-product-attribute="${row.id_product_attribute}">
                    <td class="text-left" title="${row.name}">${this.truncateText(row.name, 30)}</td>
                    <td class="text-left" title="${row.reference}">${row.reference || ""}</td>
                    <td class="text-left" title="${row.combination}">${this.truncateText(row.combination, 30)}</td>
                    <td class="text-left" title="${row.ean13}">${row.ean13 || ""}</td>
                    <td class="text-center">${updatedIcon}</td>
                    <td class="text-right">${row.before !== undefined ? row.before : ""}</td>
                    <td class="text-right ${this.getVariationClass(row.variation)}">${row.variation !== undefined ? row.variation : ""}</td>
                    <td class="text-right">${row.after !== undefined ? row.after : ""}</td>
                </tr>
            `;
            })
            .join("");

        return `<tbody class="${this.options.bodyClass}">${rows}</tbody>`;
    }

    /**
     * Determina la classe CSS in base al valore della variazione
     * @param {number} variation - Valore della variazione
     * @returns {string} Classe CSS
     */
    getVariationClass(variation) {
        if (variation === undefined || variation === null) return "";
        if (variation > 0) return "text-success";
        if (variation < 0) return "text-danger";
        return "";
    }

    /**
     * Tronca il testo se supera la lunghezza massima
     * @param {string} text - Testo da troncare
     * @param {number} maxLength - Lunghezza massima
     * @returns {string} Testo troncato
     */
    truncateText(text, maxLength) {
        if (!text) return "";
        return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
    }

    /**
     * Genera il footer della tabella
     * @returns {string} HTML del footer della tabella
     */
    generateFooter() {
        if (!this.rows || this.rows.length === 0) {
            return "";
        }

        const totalRows = this.rows.length;
        const updatedRows = this.rows.filter((row) => row.updated).length;

        return `
            <tfoot>
                <tr>
                    <td colspan="8" class="text-right">
                        <div class="d-flex justify-content-between align-items-center">
                            <span>Totale righe: <strong>${totalRows}</strong></span>
                            <span>Aggiornate: <strong>${updatedRows}</strong></span>
                        </div>
                    </td>
                </tr>
            </tfoot>
        `;
    }

    /**
     * Genera lo stile CSS per la tabella
     * @returns {string} Tag style con CSS
     */
    generateStyles() {
        return `
            <style>
                .${this.options.tableClass} {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 1rem;
                    color: #212529;
                    border: 1px solid #dee2e6;
                    border-radius: 0.25rem;
                    overflow: hidden;
                    font-size: 0.875rem;
                }
                
                .${this.options.tableClass} th,
                .${this.options.tableClass} td {
                    padding: 0.25rem;
                    vertical-align: middle;
                    border-top: 1px solid #dee2e6;
                }
                
                .${this.options.tableClass} thead th {
                    vertical-align: bottom;
                    border-bottom: 2px solid #25b9d7;
                    background-color: #f8f9fa;
                    color: #363a41;
                    font-weight: 600;
                    text-align: left;
                }
                
                .${this.options.tableClass} tbody tr:hover {
                    background-color: rgba(37, 185, 215, 0.05);
                }
                
                .${this.options.tableClass} tfoot {
                    background-color: #f8f9fa;
                    font-weight: 500;
                }
                
                .text-center {
                    text-align: center !important;
                }
                
                .text-right {
                    text-align: right !important;
                }
                
                .text-success {
                    color: #78d07d !important;
                }
                
                .text-danger {
                    color: #f54c3e !important;
                }
                
                .d-flex {
                    display: flex !important;
                }
                
                .justify-content-between {
                    justify-content: space-between !important;
                }
                
                .align-items-center {
                    align-items: center !important;
                }
            </style>
        `;
    }

    /**
     * Genera l'HTML completo della tabella
     * @returns {string} HTML completo della tabella
     */
    render() {
        const table = `
            <div class="table-responsive">
                <table class="${this.options.tableClass}">
                    ${this.generateHeader()}
                    ${this.generateBody()}
                    ${this.generateFooter()}
                </table>
            </div>
        `;

        return `${this.generateStyles()}${table}`;
    }
}

// Esporta la classe per l'utilizzo come modulo ES6
export default StockServiceTable;
