<?php

/**
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
 *
 * @update    2024-01-15
 */

namespace MpSoft\MpStockService\Hooks;

use MpSoft\MpStockService\Helpers\ProductUtils;
use MpSoft\MpStockService\Helpers\SmartyHelper;
use MpSoft\MpStockService\Models\ModelMpStockService;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

if (!defined('_PS_VERSION_')) {
    exit;
}

class MpStockServiceHookController
{
    private $module;
    private $context;
    private $db;
    private $id_product;
    private $id_lang;
    private $id_shop;
    private $table;
    private $smartyHelper;
    private $ajax_controller;
    private $is_stock_service;
    private $combinations;

    public function __construct($module)
    {
        $this->module = $module;
        $this->context = \Context::getContext();
        $this->db = \Db::getInstance();
        $this->id_product = (int) \Tools::getValue('id_product');
        $this->id_lang = (int) $this->context->language->id;
        $this->id_shop = (int) $this->context->shop->id;
        $this->table = ModelMpStockService::$definition['table'];
        $this->ajax_controller = \Context::getContext()->link->getAdminLink('AdminMpStockService');
        $this->smartyHelper = new SmartyHelper();
        $this->is_stock_service = false;
        $this->combinations = [];
    }

    public function setIdProduct($id_product)
    {
        $this->id_product = (int) $id_product;
    }

    public function parse($xml)
    {
        $xmlData = simplexml_load_string($xml);
        $rows = $xmlData->rows;
        $output = [];
        foreach ($rows->children() as $row) {
            $product = $this->getProductAttribute((string) $row->ean13, $row->reference);
            $output[] = [
                'id_product' => $product['id_product'],
                'id_product_attribute' => $product['id_product_attribute'],
                'reference' => (string) $row->reference,
                'ean13' => (string) $row->ean13,
                'quantity' => abs((int) $row->qty),
                'updated' => 0,
                'method' => '',
                'result' => false,
            ];
        }

        return $output;
    }

    public function getProductAttribute($ean13, $reference)
    {
        if (!$ean13) {
            return [
                'id_product' => 0,
                'id_product_attribute' => 0,
                'reference' => $reference,
            ];
        }

        $db = \Db::getInstance();
        $sql = 'select id_product, id_product_attribute from '
            . _DB_PREFIX_ . "product_attribute where ean13 = '" . $ean13 . "'";
        $res = $db->getRow($sql);
        if (!$res) {
            return [
                'id_product' => 0,
                'id_product_attribute' => 0,
                'reference' => $reference,
            ];
        }
        $res['reference'] = $reference;

        return $res;
    }

    public function uploadQty($content, $type)
    {
        $whole = (int) \Tools::getValue('force_upload');
        if ($whole) {
            return [$this->uploadQtyStock($content, $type)];
        }
        $stockQty = [];
        $productQty = [];
        foreach ($content as $row) {
            $isStock = (int) $this->isStockService($row['id_product']);
            if ($isStock) {
                $stockQty[] = $row;
            } else {
                $productQty[] = $row;
            }
        }

        return array_merge(
            $this->uploadQtyProduct($productQty, $type),
            $this->uploadQtyStock($stockQty, $type)
        );
    }

    public function uploadQtyProduct($content, $type)
    {
        return [];
        // \Tools::dieObject($content);
        if ($type == 'unload') {
            foreach ($content as &$row) {
                $row['quantity'] = $row['quantity'] * -1;
            }
        }
        unset($row);
        $i = 0;
        foreach ($content as $row) {
            $res = StockAvailable::updateQuantity(
                (int) $row['id_product'],
                (int) $row['id_product_attribute'],
                (int) $row['quantity']
            );
            if ($res) {
                $i++;
            }
        }
        $message =
            sprintf(
                $this->module->l('Updated %d combinations on %d total.', 'ModuleStockServiceHookController'),
                $i,
                count($content)
            );

        return [
            'error' => 0,
            'message' => $message,
        ];
    }

    public function uploadQtyStock($content, $type)
    {
        // \Tools::dieObject('STOCK', 0);
        // \Tools::dieObject($content);
        if ($type == 'unload') {
            foreach ($content as &$row) {
                $row['quantity'] = $row['quantity'] * -1;
            }
        }
        unset($row);
        $i = 0;

        foreach ($content as $key => $row) {
            if ($row['id_product']) {
                $this->prepareStockProduct($row['id_product']);
                $obj = new ModelMpStockService($row['id_product_attribute']);
                $obj->force_id = true;
                $obj->id = $row['id_product_attribute'];
                $obj->id_product = $row['id_product'];
                $qty = (int) $obj->quantity;
                $var = (int) $row['quantity'];
                $tot = $qty + $var;
                if ($tot < 0) {
                    $obj->quantity = 0;
                } else {
                    $obj->quantity = $tot;
                }
                $obj->id_supplier = 0;
                $obj->number = 0;
                $obj->date = date('Y-m-d H:i:s');
                $existsStock = (int) $this->existsStock($row['id_product_attribute']);
                if ($existsStock) {
                    $res = $obj->update();
                } else {
                    $res = $obj->add();
                }
                if ($res) {
                    if ($existsStock) {
                        $exists = '';
                    } else {
                        $exists = 'NON';
                    }
                    if ($res) {
                        $str_res = 'POSITIVO';
                    } else {
                        $str_res = 'NEGATIVO';
                    }
                    $ean13 = $row['ean13'];
                    $productName = \Product::getProductName((int) $row['id_product'], (int) $row['id_product_attribute']);

                    /*
                     * PrestaShopLogger::addLog(
                     *     sprintf(
                     *         "Stock service per %s %s. Il prodotto %s era presente in archivio."
                     *         ." Il processo ha avuto esito %s. Qta iniziale: %d, variazione: %d, risultato: %d, valore attuale: %d",
                     *         $ean13,
                     *         $productName,
                     *         $exists,
                     *         $str_res,
                     *         $qty,
                     *         $var,
                     *         $tot,
                     *         (int)$obj->quantity
                     *     ),
                     *     2,
                     *     0,
                     *     'StockService'
                     * );
                     */
                    $i++;
                }
            }
        }

        $message =
            sprintf(
                $this->module->l('Updated %d stock on %d total.', 'ModuleStockServiceHookController'),
                $i,
                count($content)
            );

        return [
            'error' => 0,
            'message' => $message,
        ];
    }

    protected function prepareStockProduct($id_product)
    {
        $db = \Db::getInstance();
        $sql = new \DbQuery();
        $sql
            ->select('count(*)')
            ->from('mpstockservice')
            ->where('id_product=' . (int) $id_product);
        $stock_comb = (int) $db->getValue($sql);
        $sql = new \DbQuery();
        $sql
            ->select('count(*)')
            ->from('product_attribute')
            ->where('id_product=' . (int) $id_product);
        $prod_comb = (int) $db->getValue($sql);
        if ($prod_comb != $stock_comb) {
            $sql = new \DbQuery();
            $sql
                ->select('id_product_attribute')
                ->from('product_attribute')
                ->where('id_product=' . (int) $id_product);
            $id_product_attributes = $db->executeS($sql);
            foreach ($id_product_attributes as $id) {
                $sql = new \DbQuery();
                $sql
                    ->select('count(*)')
                    ->from('mpstockservice')
                    ->where('id_product_attribute=' . (int) $id['id_product_attribute']);
                $res = (int) $db->getValue($sql);
                if (!$res) {
                    $obj = new ModelMpStockService($id['id_product_attribute']);
                    $obj->force_id = true;
                    $obj->id = $id['id_product_attribute'];
                    $obj->id_product = $id_product;
                    $obj->quantity = 0;
                    $obj->id_supplier = 0;
                    $obj->number = 0;
                    $obj->date = date('Y-m-d H:i:s');
                    $add = $obj->add();
                }
            }
        }
    }

    public function setCombinations($combinations)
    {
        $this->combinations = $combinations;
    }

    public function toggleStockService($is_stock_service)
    {
        $this->is_stock_service = $is_stock_service;
    }

    public function display($controller = false)
    {
        $productUtils = new ProductUtils($this->module);
        $id_product = (int) $this->id_product;
        $isStockService = ModelMpStockService::isStockServiceProduct($id_product);
        $data = [
            'id_product' => $id_product,
            'is_stock_service' => $isStockService,
            'rows' => $productUtils->getCombinations(new \Product($id_product)),
            'suppliers' => \Supplier::getSuppliers($this->id_lang),
            'baseUrl' => $this->context->link->getBaseLink(),
            'actionToggleStockService' => $this->getActionUrl('toggle_stock_service', ['id_product' => $id_product], true),
            'actionUpdateStockService' => $this->getActionUrl('update_stock_service', ['id_product' => $id_product], true),
            'actionResetStockService' => $this->getActionUrl('reset_stock_service', ['id_product' => $id_product], true),
            'actionUploadFile' => $this->getActionUrl('upload_file', [], true),
        ];

        if ($controller) {
            $product = new \Product($id_product, false, $this->id_lang);
            $data['controller'] = true;
            $data['product'] = $product;
        }

        return $this->smartyHelper->renderTplHook('displayProductExtra', $data);
    }

    protected function resetTable()
    {
        $res = \Db::getInstance()->execute(
            'truncate table ' . _DB_PREFIX_ . $this->table
        );
        if ($res) {
            return [
                'error' => 0,
                'message' => $this->module->l('Stock service table cleaned.', 'ModuleStockServiceHookController'),
            ];
        } else {
            return [
                'error' => 1,
                'message' => $this->module->l('Error resetting table.', 'ModuleStockServiceHookController'),
            ];
        }
    }

    protected function resetQty()
    {
        $db = \Db::getInstance();
        $id_product = (int) \Tools::getValue('id_product');
        $res = $db->delete(
            $this->table,
            'id_product = ' . (int) $id_product
        );
        if ($res) {
            return [
                'error' => 0,
                'message' => $this->module->l('Stock quantities deleted.', 'ModuleStockServiceHookController'),
            ];
        } else {
            return [
                'error' => 1,
                'message' => $this->module->l('Error deleting stock quantities.', 'ModuleStockServiceHookController'),
            ];
        }
    }

    protected function updateStock()
    {
        $isStockService = ((bool) \Tools::getValue('input-is_stock_service', 0));
        $rows = [];
        $quantity = \Tools::getValue('ss_quantity');
        $variation = \Tools::getValue('ss_variation');
        $id_supplier = \Tools::getValue('ss_id_supplier');
        $number = \Tools::getValue('ss_number');
        $date = \Tools::getValue('ss_date');

        foreach ($quantity as $key => $value) {
            $rows[] = [
                'is_stock_service' => $isStockService,
                'id_product_attribute' => $key,
                'id_product' => $this->id_product,
                'quantity' => $quantity[$key],
                'variation' => $variation[$key],
                'total' => $quantity[$key] + $variation[$key],
                'id_supplier' => $id_supplier[$key],
                'number' => $number[$key],
                'date' => $date[$key],
            ];
        }

        // \Tools::dieObject($rows, 0);

        if ($isStockService) {
            foreach ($rows as $row) {
                $error = '';
                $stock = new ModelMpStockService();
                $stock->force_id = true;
                $stock->id = $row['id_product_attribute'];
                $stock->id_product = $row['id_product'];
                $stock->quantity = $row['total'] < 0 ? 0 : $row['total'];
                $stock->id_supplier = $row['id_supplier'];
                $stock->number = $row['number'];
                $stock->date = $row['date'];

                try {
                    if ($this->existsStock($row['id_product_attribute'])) {
                        $res = $stock->update();
                    } else {
                        $res = $stock->add();
                    }
                    if (!$res) {
                        $error = $this->db->getMsgError();
                    }
                } catch (\Throwable $th) {
                    $error = $th->getMessage();
                    $res = false;
                }

                if (!$res) {
                    return [
                        'error' => true,
                        'message' => $error,
                    ];
                }
            }
        } else {
            $res = $this->deleteStock();
            if (!$res) {
                return [
                    'error' => true,
                    'message' => $this->db->getMsgError(),
                ];
            }
        }

        return [
            'error' => 0,
            'message' => $this->module->l('Stock service updated.', 'ModuleStockServiceHookController'),
        ];
    }

    protected function deleteStock()
    {
        $db = $this->db;

        return $db->delete(
            $this->table,
            'id_product = ' . (int) $this->id_product
        );
    }

    protected function existsStock($id_product_attribute)
    {
        $db = $this->db;
        $sql = new \DbQuery();
        $sql
            ->select('count(*)')
            ->from($this->table)
            ->where('id_product_attribute = ' . (int) $id_product_attribute);

        return (int) $db->getValue($sql);
    }

    protected function isStockService($id_product)
    {
        $sql = 'select count(*) from ' . _DB_PREFIX_ . 'mpstockservice where id_product=' . (int) $id_product;

        return (int) $this->db->getValue($sql);
    }

    public function getActionUrl($action, $params = [], $admin = true)
    {
        // Ottieni il container dei servizi
        $container = \PrestaShop\PrestaShop\Adapter\SymfonyContainer::getInstance();

        if ($container !== null) {
            // Genera l'URL completo
            if ($admin) {
                $action = 'admin_' . $action;
            }

            return $container->get('router')->generate('mpstockservice_' . $action, $params, UrlGeneratorInterface::ABSOLUTE_URL);
        }

        // Fallback se il container non è disponibile
        return $this->context->link->getAdminLink('AdminMpStockService', true, [], ['action' => $action]);
    }
}
