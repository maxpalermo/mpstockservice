<div class="col-md-6 col-xs-12">
    <div class="panel" id="panel-check-quantites">
        <div class="panel-body">
            <ul class="list-group">
                <li class="list-group-item">Quantità controllata: <span id="quantity_check_checked">{if $checkProduct.is_checked}<i class="icon icon-check icon-2x text-success"></i>{else}<i class="icon icon-times icon-2x text-danger"></i>{/if}</span></li>
                <li class="list-group-item">Ultimo controllo: <strong id="quantity_check_date">{$checkProduct.date_upd}</strong></li>
                <li class="list-group-item">Operatore: <strong id="quantity_check_employee">{$checkProduct.employee}</strong></li>
                <li class="list-group-item">
                    <span>Nuovo controllo:</span>
                    <span class="switch prestashop-switch fixed-width-lg">
                        {strip}
                            <input type="radio" name="switch_checked" id="switch_checked_on" value="1" {if !$checkProduct.is_checked}checked{/if} onclick="switchCheck(1);" />
                            <label for="switch_checked_on">
                                <i class="icon icon-check text-success"></i> {l s='SI'}
                            </label>
                            <input type="radio" name="switch_checked" id="switch_checked_off" value="0" {if !$checkProduct.is_checked}checked{/if} onclick="switchCheck(0);" />
                            <label for="switch_checked_off">
                                <i class="icon icon-times text-danger"></i> {l s='NO'}
                            </label>
                        {/strip}
                        <a class="slide-button btn"></a>
                    </span>
                </li>
            </ul>
        </div>
        <script type="text/javascript">
            function switchCheck(checked) {
                $.ajax({
                    url: '{$link->getAdminLink('AdminMpStockService')}',
                    type: 'post',
                    dataType: 'json',
                    data: {
                        ajax: true,
                        action: 'setCheckProductQuantity',
                        id_product: id_product,
                        is_checked: checked
                    },
                    success: function(response) {
                        if (response.ok) {
                            $.growl.notice({
                                title: 'Controllo quantit&agrave;',
                                message: 'Controllo quantit&agrave; aggiornato.'
                            });
                            $('#quantity_check_checked').html(response.is_checked ? '<i class="icon icon-check icon-2x text-success"></i>' : '<i class="icon icon-times icon-2x text-danger"></i>');
                            $('#quantity_check_employee').text(response.employee_name);
                            $('#quantity_check_date').text(response.date_checked);
                        } else {
                            $.growl.error({
                                title: 'Controllo quantit&agrave;',
                                message: 'Errore Controllo quantit&agrave;.'
                            });
                        }
                    },
                    error: function(response) {
                        console.log(response.responseText);
                    }
                });
            }
        </script>
    </div>
</div>