{*
 * Copyright since 2007 PrestaShop SA and Contributors
 * PrestaShop is an International Registered Trademark & Property of PrestaShop SA
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Academic Free License version 3.0
 * that is bundled with this package in the file LICENSE.md.
 * It is also available through the world-wide-web at this URL:
 * https://opensource.org/licenses/AFL-3.0
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@prestashop.com so we can send you a copy immediately.
 *
 * @author    Massimiliano Palermo <maxx.palermo@gmail.com>
 * @copyright Since 2016 Massimiliano Palermo
 * @license   https://opensource.org/licenses/AFL-3.0 Academic Free License version 3.0
 *}

<!-- Contenitore principale -->
<section class="bootstrap">
    <div class="panel">
        <div class="panel-heading">
            <i class="material-icons">list</i>&nbsp;{l s='Servizio stock' mod='mpstockservice'}
        </div>
        <div class="panel-body">
            {if isset($product)}
                <div class="product-header mb-4">
                    <h5 class="text-muted">({$product->id}) {$product->reference} - {$product->name}</h5>
                </div>
            {/if}
            <div class="row mb-4">
                <div class="col-md-6">
                    <div class="form-group">
                        <label class="form-control-label">{l s='È un prodotto del servizio stock?' mod='mpstockservice'}</label>
                        <div class="ps-switch ps-switch-lg">
                            <input type="radio" name="input-is_stock_service" id="input-false-is_stock_service" value="0" {if !$is_stock_service}checked{/if} class="switch_ss">
                            <label for="input-false-is_stock_service"><i class="material-icons text-danger">close</i></label>
                            <input type="radio" name="input-is_stock_service" id="input-true-is_stock_service" value="1" {if $is_stock_service}checked{/if} class="switch_ss">
                            <label for="input-true-is_stock_service"><i class="material-icons text-success">check</i></label>
                            <span class="slide-button"></span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row mb-4" id="tableContentStockService">
                <!-- Tabella dinamica tramite template -->
            </div>
        </div>
        <div class="panel-footer">
            <div class="row">
                <div class="col-md-3">
                    <div class="form-group">
                        <label class="form-control-label">{l s='Applica servizio stock all\'intero file?' mod='mpstockservice'}</label>
                        <div class="ps-switch ps-switch-lg">
                            <input type="radio" name="input-force_upload" id="input-false-force_upload" value="0" checked class="switch_import">
                            <label for="input-false-force_upload"><i class="material-icons text-danger">close</i></label>
                            <input type="radio" name="input-force_upload" id="input-true-force_upload" value="1" class="switch_import">
                            <label for="input-true-force_upload"><i class="material-icons text-success">check</i></label>
                            <span class="slide-button"></span>
                        </div>
                    </div>
                </div>
                <div class="col-md-9">
                    <div class="file-upload-wrapper mb-3">
                        <input name="fileUploadXml" id="fileUploadXml" type="file" accept=".xml" style="display: none;">
                        <div class="file-upload-zone" id="file-upload-zone">
                            <div class="dz-default dz-message">
                                <i class="material-icons d-block mb-2" style="font-size: 2rem;">cloud_upload</i>
                                <span>{l s='Trascina qui il tuo file XML oppure' mod='mpstockservice'}</span>
                                <button id="input-btn" type="button" name="submitAddAttachments" class="btn btn-outline-primary btn-sm mt-2">
                                    <i class="material-icons">insert_drive_file</i>&nbsp;{l s='Sfoglia' mod='mpstockservice'}
                                </button>
                            </div>
                            <div class="selected-file-info mt-2" style="display: none;">
                                <div class="d-flex align-items-center">
                                    <i class="material-icons me-2 text-primary">description</i>
                                    <span class="file-name"></span>
                                    <button type="button" class="btn btn-sm btn-link text-danger remove-file ms-auto">
                                        <i class="material-icons">close</i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="d-flex justify-content-between align-items-center w-100">
                        <div class="btn-group">
                            <button type="button" id="loadqty" name="submitLoadQty" class="btn btn-outline-primary" value="1" data-bs-toggle="tooltip" data-bs-placement="top" title="{l s='Carica quantità dal file' mod='mpstockservice'}">
                                <i class="material-icons">file_upload</i>&nbsp;{l s='Carica' mod='mpstockservice'}
                            </button>
                            <button type="button" id="unloadqty" name="submitUnloadQty" class="btn btn-outline-secondary" value="1" data-bs-toggle="tooltip" data-bs-placement="top" title="{l s='Scarica quantità nel file' mod='mpstockservice'}">
                                <i class="material-icons">file_download</i>&nbsp;{l s='Scarica' mod='mpstockservice'}
                            </button>
                            <button type="button" id="resetqty" name="submitResetQty" class="btn btn-outline-danger" value="1" data-bs-toggle="tooltip" data-bs-placement="top" title="{l s='Azzera tutte le quantità' mod='mpstockservice'}">
                                <i class="material-icons">refresh</i>&nbsp;{l s='Azzera' mod='mpstockservice'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<template id="tableStockServiceRowTemplate">
    <tr id_product_attribute="--id_product_attribute--">
        <td>
            <strong>--combination--</strong>
        </td>
        <td class="fixed-width-sm">
            <input type="text" name="ss_quantity[--id_product_attribute--]" value="0" class="form-control text-right" readonly>
        </td>
        <td class="fixed-width-sm">
            <input type="text" name="ss_variation[--id_product_attribute--]" value="0" class="form-control text-right">
        </td>
        <td style="width: 216px;">
            <select class="form-control ss_id_supplier" name="ss_id_supplier[--id_product_attribute--]">
                <option value="0">{l s='Seleziona un fornitore' mod='mpstockservice'}</option>
                {foreach $suppliers as $supplier}
                    <option value=" {$supplier.id_supplier}">{$supplier.name}</option>
                {/foreach}
            </select>
        </td>
        <td class="fixed-width-md">
            <input type="text" name="ss_number[--id_product_attribute--]" value="0" class="form-control text-right ss_number">
        </td>
        <td class="fixed-width-md">
            <input type="date" name="ss_date[--id_product_attribute--]" value="" class="form-control text-center ss_date">
        </td>
        <td>
            <button type="button" name="btnApplyAll" class="btn btn-default">
                <i class="icon icon-refresh"></i>&nbsp;{l s='Applica a tutti' mod='mpstockservice'}
            </button>
        </td>
    </tr>
</template>

<template id="tableStockServiceTemplate">
    <div class="col-12">
        <div class="table-responsive">
            <table class="table table-striped table-hover" id="tableStockService" style="width: auto;">
                <thead class="thead-light">
                    <tr>
                        <th>{l s='Combinazione' mod='mpstockservice'}</th>
                        <th>{l s='Quantità' mod='mpstockservice'}</th>
                        <th>{l s='Variazione' mod='mpstockservice'}</th>
                        {*<th>{l s='Fornitore' mod='mpstockservice'}</th>-->*}
                        <th>{l s='Numero' mod='mpstockservice'}</th>
                        <th>{l s='Data' mod='mpstockservice'}</th>
                        <th>{l s='Azioni' mod='mpstockservice'}</th>
                    </tr>
                </thead>
                <tbody>
                    {foreach $rows as $row}
                        <tr id_product_attribute="{$row.id_product_attribute}">
                            <td style="width: auto;">
                                <strong>{$row.combination}</strong>
                            </td>
                            <td style="width: 120px;">
                                <input type="text" name="ss_quantity[{$row.id_product_attribute}]" value="{$row.quantity}" class="form-control text-right" readonly>
                            </td>
                            <td style="width: 120px;">
                                <input type="text" name="ss_variation[{$row.id_product_attribute}]" value="0" class="form-control text-right">
                            </td>
                            {*
                            <td style="width: auto;">
                                <select class="form-control ss_id_supplier" name="ss_id_supplier[{$row.id_product_attribute}]">
                                    <option value="0">{l s='--' mod='mpstockservice'}</option>
                                    {foreach $suppliers as $supplier}
                                        <option value="{$supplier.id_supplier}" {if $row.id_supplier==$supplier.id_supplier}selected{/if}>{$supplier.name}</option>
                                    {/foreach}
                                </select>
                            </td>
                            *}
                            <td style="width: 120px;">
                                <input type="text" name="ss_number[{$row.id_product_attribute}]" value="{$row.number}" class="form-control text-right ss_number">
                            </td>
                            <td style="width: 120px;">
                                <input type="date" name="ss_date[{$row.id_product_attribute}]" value="{$row.date}" class="form-control text-center ss_date">
                            </td>
                            <td style="width: auto; display: flex; justify-content: center; align-items: center;">
                                <button type="button" name="btnApplyAll" class="btn btn-default">
                                    <i class="icon icon-refresh"></i>&nbsp;{l s='Applica a tutti' mod='mpstockservice'}
                                </button>
                            </td>
                        {/foreach}
                </tbody>
            </table>
            <div class="form-group">
                <button type="button" name="submitStockProduct" id="submitStockProduct" class="btn btn-primary">
                    <i class="material-icons">save</i>&nbsp;{l s='Salva Modifiche' mod='mpstockservice'}
                </button>
            </div>
        </div>
    </div>
</template>

<template id="UploadStockServiceResponse">

</template>

<!-- Carica gli script prima del modulo ES6 -->
<script src="{$baseUrl}modules/mpstockservice/views/js/swal2/request/SwalConfirm.js"></script>
<script src="{$baseUrl}modules/mpstockservice/views/js/swal2/request/SwalError.js"></script>
<script src="{$baseUrl}modules/mpstockservice/views/js/swal2/request/SwalInput.js"></script>
<script src="{$baseUrl}modules/mpstockservice/views/js/swal2/request/SwalLoading.js"></script>
<script src="{$baseUrl}modules/mpstockservice/views/js/swal2/request/SwalNote.js"></script>
<script src="{$baseUrl}modules/mpstockservice/views/js/swal2/request/SwalSuccess.js"></script>
<script src="{$baseUrl}modules/mpstockservice/views/js/swal2/request/SwalWarning.js"></script>

<script type="module">
    // Importiamo la classe FileUpload e la rendiamo disponibile globalmente
    import FileUpload from '{$baseUrl}modules/mpstockservice/views/js/Tools/FileUpload.js';
    window.FileUpload = FileUpload;

    // Importiamo le funzioni dai moduli
    import * as DisplayProductExtra from '{$baseUrl}modules/mpstockservice/views/js/Hooks/DisplayProductExtra.js';
    import { initStockService } from '{$baseUrl}modules/mpstockservice/views/js/Hooks/ProductExtraInit.js';

    //Importa navigatore elementi
    import ArrowNavigator from '{$baseUrl}modules/mpstockservice/views/js/Navigator/ArrowNavigator.js';

    const actionToggleStockService = "{$actionToggleStockService}";
    const actionUpdateStockService = "{$actionUpdateStockService}";
    const actionResetStockService = "{$actionResetStockService}";
    const actionUploadFile = "{$actionUploadFile}";
    const is_stock_service = "{$is_stock_service}";
    const combinations = {$rows|json_encode nofilter};
    const id_product = "{$id_product}";
    const tableStockServiceRow = document.getElementById('tableStockServiceRowTemplate');
    const z_index_swal = 15000; // Definisci il tuo z-index desiderato
    var buttonIcon = "";

    // Utilizziamo le funzioni importate dal modulo
    document.addEventListener('DOMContentLoaded', function() {
        // Inizializziamo il modulo Stock Service passando tutti i parametri necessari
        initStockService({
            is_stock_service,
            id_product,
            DisplayProductExtra,
            actions: {
                actionToggleStockService,
                actionUpdateStockService,
                actionResetStockService,
                actionUploadFile
            }
        });

        // Inizializza il navigatore degli elementi
        new ArrowNavigator(
            'input[name^="ss_variation"]', {
                scrollBehavior: 'smooth' // Opzionale: 'auto' o 'smooth'
                // scrollBlock: 'center' // Opzionale: 'start', 'center', 'end', 'nearest'
            }
        );
        new ArrowNavigator(
            'input[name^="ss_number"]', {
                scrollBehavior: 'smooth' // Opzionale: 'auto' o 'smooth'
                // scrollBlock: 'center' // Opzionale: 'start', 'center', 'end', 'nearest'
            }
        );
    });
</script>

<!-- I file JavaScript vengono inclusi tramite il metodo hookActionAdminControllerSetMedia nel file mpstockservice.php -->