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
 */
if (!defined('_PS_VERSION_')) {
    exit;
}

use MpSoft\MpStockService\Helpers\GetTwigEnvironment;
use MpSoft\MpStockService\Helpers\XmlParser;
use MpSoft\MpStockService\Hooks\MpStockServiceHookController;
use MpSoft\MpStockService\Models\ModelMpStockService;
use MpSoft\MpStockService\Models\ModelMpStockServiceCheck;

class AdminMpStockServiceController extends ModuleAdminController
{
    public $id_shop;
    public $id_lang;
    public $id_employee;
    private $ajax_controller;

    public function __construct()
    {
        $this->bootstrap = true;
        $this->className = '';
        parent::__construct();
        $this->id_lang = (int) $this->context->language->id;
        $this->id_shop = (int) $this->context->shop->id;
        $this->id_employee = (int) $this->context->employee->id;
        $this->ajax_controller = Context::getContext()->link->getAdminLink('AdminMpStockService');

        if (Tools::isSubmit('ajax') && Tools::isSubmit('action')) {
            $action = 'ajaxProcess' . ucfirst(Tools::getValue('action'));
            if (method_exists($this, $action)) {
                $this->response($this->$action());
            }
        }
    }

    protected function response($params, $code = 200)
    {
        header('Content-Type: application/json; charset=utf-8');
        http_response_code($code);
        exit(json_encode($params));
    }

    public function init()
    {
        parent::init();
    }

    public function ajaxProcessGetStockServiceList()
    {
        $offset = Tools::getValue('offset', 0);
        $limit = Tools::getValue('limit', 20);
        $search = Tools::getValue('search', '');
        $sort = Tools::getValue('sort', 'a.id_product');
        $order = Tools::getValue('order', 'DESC');

        $db = Db::getInstance();
        $query = new DbQuery();

        $query
            ->select('i.id_image')
            ->select('p.id_product')
            ->select('p.reference')
            ->select('pl.name as product_name')
            ->select('sum(ss.quantity) as `quantity`')
            ->select('a.id_employee')
            ->select('a.is_stock_service')
            ->select('a.date_add')
            ->select('a.date_upd')
            ->from(ModelMpStockServiceCheck::$definition['table'], 'a')
            ->innerJoin(ModelMpStockService::$definition['table'], 'ss', 'ss.id_product = a.id_product')
            ->innerJoin('product', 'p', 'p.id_product = a.id_product')
            ->innerJoin('product_lang', 'pl', 'pl.id_product = p.id_product AND pl.id_lang = ' . (int) $this->context->language->id)
            ->leftJoin('image', 'i', 'i.id_product = p.id_product and i.cover = 1')
            ->groupBy('p.id_product')
            ->orderBy("{$sort} {$order}")
            ->limit($limit, $offset);

        $queryCount = new DbQuery();
        $queryCount
            ->select('count(a.id_product) as total')
            ->from(ModelMpStockServiceCheck::$definition['table'], 'a');

        if ($search) {
            $search = pSQL($search);

            $query->where(
                "
                    p.reference LIKE '%{$search}%' OR
                    pl.name LIKE '%{$search}%'
                "
            );

            $queryCount->leftJoin('product', 'p', 'p.id_product = a.id_product and a.id_product is not null');
            $queryCount->leftJoin('product_lang', 'pl', 'p.id_product = pl.id_product and pl.id_lang=' . (int) $this->context->language->id);
            $queryCount->where(
                "
                    p.reference LIKE '%{$search}%' OR
                    pl.name LIKE '%{$search}%'
                "
            );
        }

        $total = $db->getValue($queryCount);

        $result = $db->executeS($query);
        if (!$result) {
            $result = [];
        }

        foreach ($result as &$row) {
            $row['image'] = $row['id_image'] ? Context::getContext()->link->getImageLink('product', $row['id_image'], 'small_default') : Context::getContext()->link->getImageLink('product', $row['id_image'], 'small_default');
        }

        return [
            'rows' => $result,
            'total' => $total,
            'totalNotFiltered' => $total,
            'offset' => $offset,
            'limit' => $limit,
        ];
    }

    public function initPageHeaderToolbar()
    {
        parent::initPageHeaderToolbar();
        $this->toolbar_title = $this->module->l('Stock Services Products', $this->controller_name);

        $this->page_header_toolbar_btn['orphans'] = [
            'href' => $this->context->link->getAdminLink($this->controller_name) . '&action=remove_orphans',
            'desc' => $this->module->l('Remove Orphans', $this->controller_name),
            'imgclass' => 'delete',
        ];

        $this->page_header_toolbar_btn['import'] = [
            'href' => 'javascript:showImportPanel();',
            'desc' => $this->module->l('Importa', $this->controller_name),
            'imgclass' => 'import',
        ];
    }

    public function renderTplForm()
    {
        $id_product = (int) Tools::getValue('id_product');

        $controller = new MpStockServiceHookController($this->module);
        $controller->setIdProduct($id_product);

        return $controller->display(true);
    }

    public function ajaxProcessGetStockServiceByProductId()
    {
        $id_product = (int) Tools::getValue('id_product');
        $rows = ModelMpStockService::getStockServiceByProduct($id_product);

        if (!$rows) {
            $rows = [];
        }

        return $rows;
    }

    public function ajaxProcessGetTableStockServiceByProductId()
    {
        $id_product = (int) Tools::getValue('id_product');
        $rows = ModelMpStockService::getStockServiceByProduct($id_product);

        if (!$rows) {
            $rows = [];
        }

        $twig = new GetTwigEnvironment($this->module->name);
        $twig->load('@ModuleTwig/admin/detailsStockServiceRow.html.twig');
        $table = $twig->render([
            'rows' => $rows,
        ]);

        return [
            'table' => $table,
        ];
    }

    public function ajaxProcessSaveStockService()
    {
        $rows = json_decode(Tools::getValue('rows'), true);
        $id_product = (int) Tools::getValue('id_product');
        $is_stock_service = (int) Tools::getValue('is_stock_service');
        $errors = [];

        foreach ($rows as $row) {
            $model = new ModelMpStockService($row['id_product_attribute']);

            $model->id_product = $row['id_product'];
            $model->id_product_attribute = $row['id_product_attribute'];
            $model->quantity = (int) $row['quantity_after'];
            $model->id_employee = $this->context->employee->id;
            $model->id_supplier = (int) $row['id_supplier'];
            $model->number = $row['number'];
            $model->date = $row['date'];
            $model->save();
        }

        return [
            'success' => true,
            'message' => $this->module->l('Stock service salvato', $this->controller_name),
        ];
    }

    public function ajaxProcessImportStockService()
    {
        $file = Tools::fileAttachment('file', 0);
        $movement = Tools::getValue('movement');
        $force_update = (int) Tools::getValue('force_update');

        $xmlParser = new XmlParser($file['name'], $file['tmp_name'], 1);
        $data = $xmlParser->parse($movement, $force_update);

        foreach ($data['rows'] as &$row) {
            $res = false;
            if ($row['skipped'] || !$row['is_stock_service']) {
                continue;
            }
            $model = new ModelMpStockService($row['id_product_attribute']);
            if ($model) {
                $model->id_product = (int) $row['id_product'];
                $row['quantity_before'] = (int) $model->quantity;
                $model->quantity = $row['quantity_before'] + $row['movement'];
                $row['quantity_after'] = $model->quantity;
                $model->number = $data['movement_number'];
                $model->date = $data['movement_date'];
                $model->id_employee = $this->context->employee->id;

                $res = $model->save();
            } else {
                $res = false;
            }

            $row['imported'] = $res;
        }

        return $this->formatTableResultData($data);
    }

    private function formatTableResultData($data)
    {
        $rows = $data['rows'];

        foreach ($rows as &$row) {
            $productInfo = $this->getProductInfo($row['id_product'], $row['id_product_attribute']);
            $row = array_merge($row, $productInfo);
        }

        $data['rows'] = $rows;

        return $data;
    }

    private function getProductInfo($id_product, $id_product_attribute)
    {
        $id_lang = (int) Context::getContext()->language->id;
        $product = new Product($id_product, false, $id_lang);
        $productAttribute = new Combination($id_product_attribute, $id_lang);

        $combination = $productAttribute->getAttributesName($id_lang);

        $combination_string = implode(', ', array_map(function ($value) {
            return $value['name'];
        }, $combination));

        $cover = Image::getCover($id_product);
        $image = new Image($cover['id_image'], $id_lang);
        $baseUrl = $this->context->link->getBaseLink();
        $imagePath = $baseUrl . 'img/p/' . $image->getExistingImgPath() . '-small_default.' . $image->image_format;

        return [
            'image_path' => $imagePath,
            'product_name' => $product->name,
            'combination' => $combination_string,
            'ean13' => $productAttribute->ean13,
            'reference' => $productAttribute->reference,
        ];
    }

    public function ajaxProcessSwitchStockService()
    {
        $id_product = (int) Tools::getValue('id_product');
        $is_stock_service = (int) Tools::getValue('switch_stock_service');
        $id_employee = (int) $this->context->employee->id;

        $model = new ModelMpStockServiceCheck($id_product);
        $model->is_stock_service = $is_stock_service;
        $model->id_employee = $id_employee;
        $result = $model->save();

        if ($result && $is_stock_service) {
            $message = $this->module->l('Stock service abilitato', $this->controller_name);
            $success = true;
        } elseif ($result && !$is_stock_service) {
            $message = $this->module->l('Stock service disabilitato', $this->controller_name);
            $success = true;
        } else {
            $message = $this->module->l('Error', $this->controller_name);
            $success = false;
        }

        return [
            'success' => $success,
            'totStockRows' => Db::getInstance()->Affected_Rows(),
            'message' => $message,
        ];
    }

    public function ajaxProcessSubmitStockService()
    {
        $rows = Tools::getValue('rows');
        $id_product = (int) Tools::getValue('id_product');
        $is_stock_service = (int) Tools::getValue('is_stock_service');
        $errors = [];

        if (!$is_stock_service) {
            $error = '';

            try {
                $res = Db::getInstance()->delete(
                    ModelMpStockService::$definition['table'],
                    "id_product = $id_product"
                );
                if (!$res) {
                    $error = Db::getInstance()->getMsgError();
                }
            } catch (\Throwable $th) {
                $res = false;
                $error = $th->getMessage();
            }

            $this->response([
                'success' => $res,
                'tableOut' => $error,
                'totStockRows' => Db::getInstance()->numRows(),
                'errors' => '',
            ]);
        } else {
            foreach ($rows as $key => &$row) {
                $row['method'] = $this->module->l('update', $this->controller_name);
                $quantity = (int) $row['quantity'];
                if (!$quantity) {
                    unset($rows[$key]);

                    continue;
                }
                $id_product_attribute = (int) $row['id_product_attribute'];
                $product = $this->getProductByIdProductAttribute($id_product_attribute);

                if (!Validate::isLoadedObject($product)) {
                    $row['id_product'] = '--';
                    $row['id_product_attribute'] = (int) $id_product_attribute;
                    $row['result'] = false;
                    $row['before'] = '--';
                    $row['after'] = '--';
                    $row['reference'] = '--';
                    $row['name'] = $row['name'] = $this->module->l('## NON TROVATO ##');
                    $row['combination'] = '--';

                    continue;
                }

                $matches = [];
                $date_match = preg_match('/(.*)T/i', $row['date'], $matches);
                if ($date_match) {
                    $date = $matches[1];
                    if (preg_match('/1970-01-01/i', $date)) {
                        $date = date('Y-m-d');
                    }
                } else {
                    $date = date('Y-m-d');
                }
                $number = pSQL($row['number']);

                $stockService = new ModelMpStockService($id_product_attribute);

                if (!$number) {
                    $stockService->number = date('YmdHis');
                } else {
                    $stockService->number = $number;
                }
                if (!\Validate::isDate($date)) {
                    $stockService->date = date('Y-m-d H:i:s');
                } else {
                    $stockService->date = $date;
                }

                try {
                    if (\Validate::isLoadedObject($stockService)) {
                        $row['before'] = $stockService->quantity;
                        $stockService->quantity += $quantity;
                        $row['after'] = $stockService->quantity;
                        $res = $stockService->update();
                    } else {
                        $stockService->force_id = true;
                        $stockService->id = $id_product_attribute;
                        $stockService->id_product = $product->id;
                        $row['before'] = 0;
                        $stockService->quantity += $quantity;
                        $row['after'] = $stockService->quantity;
                        $res = $stockService->add();
                    }
                } catch (\Throwable $th) {
                    $res = false;
                }

                $row['result'] = (int) $res;
                $row['reference'] = $product->reference;
                $row['name'] = $product->name;
                $row['combination'] = implode('<br>', $product->combination);
            }

            $this->response([
                'result' => true,
                'tableOut' => $this->tableOut($rows, 'callbackUpdateQty'),
                'totStockRows' => count($rows),
                'errors' => $errors,
            ]);
        }
    }

    public function ajaxProcessSetStockService()
    {
        $id_product = (int) Tools::getValue('id_product');
        $value = (int) Tools::getValue('value');

        if (!$value) {
            $error = '';

            try {
                $res = Db::getInstance()->delete(
                    ModelMpStockService::$definition['table'],
                    "id_product = $id_product"
                );
                if (!$res) {
                    $error = Db::getInstance()->getMsgError();
                }
            } catch (\Throwable $th) {
                $res = false;
                $error = $th->getMessage();
            }

            $this->response([
                'result' => $res,
                'error' => $error,
            ]);
        } else {
            $product = new Product($id_product, false, $this->id_lang);
            if (!Validate::isLoadedObject($product)) {
                $this->response([
                    'result' => false,
                    'error' => $this->module->l('Product not found', $this->controller_name),
                ]);
            }

            $combinations = $product->getAttributeCombinations($this->id_lang);
            foreach ($combinations as $combination) {
                $id_product_attribute = (int) $combination['id_product_attribute'];
                $stockService = new ModelMpStockService($id_product_attribute);
                $stockService->id_product = $id_product;
                $stockService->id_product_attribute = $id_product_attribute;
                $stockService->quantity = 0;
                $stockService->date = date('Y-m-d H:i:s');
                $stockService->number = date('YmdHis');

                try {
                    if ($stockService->id) {
                        $res = $stockService->update();
                    } else {
                        $stockService->force_id = true;
                        $stockService->id = $id_product_attribute;
                        $res = $stockService->add();
                    }
                    if (!$res) {
                        $error = sprintf(
                            $this->module->l('Error trying to add stock service for product id %s', $this->controller_name),
                            (int) $id_product
                        );
                    }
                } catch (\Throwable $th) {
                    $error = $th->getMessage();
                }
            }

            $this->response([
                'result' => $res,
                'error' => $error,
            ]);
        }
    }

    public function initContent()
    {
        $twig = new GetTwigEnvironment($this->module->name);
        $twig->load('@ModuleTwig/admin/AdminListStockService.html.twig');

        $this->content = $twig->render([
            'adminControllerUrl' => $this->context->link->getAdminLink('AdminMpStockService'),
        ]);

        parent::initContent();
    }

    public function ajaxProcessEnableStockService()
    {
        $id_product = (int) Tools::getValue('id_product');
        return $this->toggleStockService($id_product, 1);
    }

    public function ajaxProcessDisableStockService()
    {
        $id_product = (int) Tools::getValue('id_product');
        return $this->toggleStockService($id_product, 0);
    }

    public function toggleStockService($id_product, $value)
    {
        $db = Db::getInstance();
        $result = $db->update(
            ModelMpStockServiceCheck::$definition['table'],
            ['is_stock_service' => (int) $value],
            'id_product=' . (int) $id_product
        );

        if ($result && $db->Affected_Rows()) {
            return [
                'result' => true,
                'id_product' => $id_product,
            ];
        }

        return [
            'result' => false,
            'id_product' => $id_product,
        ];
    }

    public function ajaxProcessGetCheckProductQuantity()
    {
        $id_product = (int) Tools::getValue('id_product');
        $db = Db::getInstance();
        $sql = new DbQuery();
        $sql
            ->select('e.firstname')
            ->select('e.lastname')
            ->select('a.date_upd')
            ->select('a.is_stock_service')
            ->from('mpstockservice_check', 'a')
            ->leftJoin('employee', 'e', 'a.id_employee=e.id_employee')
            ->where('a.id_product=' . (int) $id_product);
        $row = $db->getRow($sql);
        if ($row) {
            die(
                json_encode(
                    [
                        'employee' => Tools::ucwords($row['firstname'] . ' ' . $row['lastname']),
                        'date' => Tools::displayDate($row['date_upd'], null, true),
                        'is_stock_service' => (int) $row['is_stock_service'],
                        'stock_service' => 0,
                    ]
                )
            );
        }
    }

    function ajaxProcessSetCheckProductQuantity()
    {
        $id_product = (int) Tools::getValue('id_product');
        $db = Db::getInstance();
        $id_employee = (int) Context::getContext()->employee->id;
        $is_stock_service = (int) Tools::getValue('is_stock_service');
        $date = date('Y-m-d H:i:s');
        $employee = new Employee($id_employee);
        $employee_name = Tools::ucWords($employee->firstname . ' ' . $employee->lastname);
        $sql = sprintf(
            'INSERT INTO %s (id_product, id_employee, is_stock_service, date_add, date_upd) '
                . "VALUES (%d, %d, %d, '%s', '%s') "
                . "ON DUPLICATE KEY UPDATE is_stock_service=%d, date_upd='%s', id_employee=%d",
            _DB_PREFIX_ . ModelMpStockServiceCheck::$definition['table'],
            $id_product,
            $id_employee,
            $is_stock_service,
            $date,
            $date,
            $is_stock_service,
            $date,
            $id_employee
        );

        try {
            $res = $db->execute($sql);
            $error = '';
        } catch (\Throwable $th) {
            $res = false;
            $error = $th->getMessage();
        }
        die(json_encode(
            [
                'ok' => (int) $res,
                'error' => $error,
                'is_stock_service' => $is_stock_service,
                'employee_name' => $employee_name,
                'date_checked' => Tools::displayDate($date, null, true),
            ]
        ));
    }

    public function ajaxProcessLoadStockService()
    {
        $file = Tools::fileAttachment('fileUpload');

        if ($file['error']) {
            $this->response([
                'result' => false,
                'file' => $file['content'],
                'error' => $file['error'],
            ]);
        }

        $helper = new MpStockServiceHookController($this->module);
        $errors = [];
        $parsed = $helper->parse($file['content']);
        $force_load = (int) Tools::getValue('force_load');

        if ($parsed) {
            foreach ($parsed as &$row) {
                $row['method'] = $this->module->l('load', $this->controller_name);
                $id_product = (int) $row['id_product'];
                $id_product_attribute = (int) $row['id_product_attribute'];
                $quantity = (int) abs($row['quantity']);

                $product = $this->getProductByIdProductAttribute($id_product_attribute);

                if (!Validate::isLoadedObject($product)) {
                    $row['id_product'] = '--';
                    $row['id_product_attribute'] = (int) $id_product_attribute;
                    $row['result'] = false;
                    $row['before'] = '--';
                    $row['after'] = '--';
                    $row['name'] = $this->module->l('## NON TROVATO ##');
                    $row['combination'] = '--';

                    continue;
                }

                $stockService = new ModelMpStockService($id_product_attribute);

                if (\Validate::isLoadedObject($stockService)) {
                    $row['before'] = $stockService->quantity;
                    $stockService->quantity += abs($quantity);
                    $row['after'] = $stockService->quantity;
                    $stockService->date = date('Y-m-d H:i:s');
                    $stockService->number = date('YmdHis');
                    $res = $stockService->update();
                } else {
                    if ($force_load) {
                        $stockService->force_id = true;
                        $stockService->id = $id_product_attribute;
                        $stockService->id_product = $id_product;
                        $row['before'] = $stockService->quantity;
                        $stockService->quantity = abs($quantity);
                        $row['after'] = $stockService->quantity;
                        $stockService->date = date('Y-m-d H:i:s');
                        $stockService->number = date('YmdHis');
                        $res = $stockService->add();
                    } else {
                        $res = false;
                    }
                }

                $row['result'] = (int) $res;
                $row['reference'] = $product->reference;
                $row['name'] = $product->name;
                $row['combination'] = implode('<br>', $product->combination);
            }
        }

        $this->response([
            'result' => true,
            'tableOut' => $this->tableOut($parsed, 'callbackLoadQty'),
            'totStockRows' => count($parsed),
            'errors' => $errors,
        ]);
    }

    public function getProductByIdProductAttribute($id_product_attribute)
    {
        $db = Db::getInstance();
        $sql = new DbQuery();
        $sql
            ->select('id_product')
            ->from('product_attribute')
            ->where('id_product_attribute=' . (int) $id_product_attribute);
        $id_product = (int) $db->getValue($sql);
        $product = new Product($id_product, false, $this->id_lang);
        $this->getProductCombination($product, $id_product_attribute);

        return $product;
    }

    public function getProductCombination(&$product, $id_product_attribute)
    {
        if (Validate::isLoadedObject($product)) {
            $combination = $product->getAttributeCombinationsById($id_product_attribute, $this->id_lang);
            $comb = [];
            if ($combination) {
                foreach ($combination as $attribute) {
                    $comb[] = $attribute['attribute_name'];
                }
            }

            $product->combination = $comb;
        }

        return false;
    }

    public function getProductDetail($id_product, $id_product_attribute)
    {
        $product = new Product($id_product, false, $this->id_lang);
        $combination = $product->getAttributeCombinationsById($id_product_attribute, $this->id_lang);
        $comb = [];
        if ($combination) {
            foreach ($combination as $attribute) {
                $comb[] = $attribute['attribute_name'];
            }
        }

        return [
            'reference' => $product->reference,
            'name' => $product->name,
            'combination' => implode('<br>', $comb),
        ];
    }

    public function tableOut($rows, $callback)
    {
        if (!$rows) {
            return $this->module->displayWarning($this->module->l('No Products to parse', $this->controller_name));
        }
        $currentIndex = $this->context->link->getAdminLink($this->controller_name);
        $helper = new HelperList();
        $helper->currentIndex = $currentIndex;
        $helper->_pagination = [20, 50, 100, 300, 500, 1000, 2000, 5000];
        $helper->_default_pagination = 50;
        $helper->table = 'product';
        $helper->identifier = 'id_product';
        $helper->list_id = $helper->table;
        $helper->_defaultOrderBy = $helper->identifier;
        $helper->_defaultOrderWay = 'ASC';
        $helper->className = 'Product';
        $helper->shopLinkType = '';  // 'shop' | 'group_shop'
        $helper->shopLink = '';
        $helper->no_link = true;
        $helper->simple_header = true;
        $helper->show_toolbar = false;
        $helper->show_toolbar_options = false;
        $helper->lang = false;  // join lang table if true
        $helper->lite_display = true;
        $helper->show_page_header_toolbar = false;
        $helper->page_header_toolbar_title = $this->module->l('Banner Products', $this->controller_name);

        $fields_display = [
            'id_product' => [
                'title' => $this->module->l('id', $this->controller_name),
                'type' => 'text',
                'size' => 'auto',
                'class' => 'fixed-width-sm',
                'align' => 'text-right',
            ],
            'reference' => [
                'title' => $this->module->l('Reference', $this->controller_name),
                'type' => 'text',
                'size' => 'auto',
                'class' => '',
                'align' => 'text-left',
            ],
            'ean13' => [
                'title' => $this->module->l('EAN13', $this->controller_name),
                'type' => 'text',
                'size' => 'auto',
                'class' => 'fixed-width-md',
                'align' => 'text-center',
            ],
            'name' => [
                'title' => $this->module->l('Name', $this->controller_name),
                'type' => 'text',
                'size' => 'auto',
                'class' => '',
                'align' => 'text-left',
            ],
            'combination' => [
                'title' => $this->module->l('Combination', $this->controller_name),
                'type' => 'text',
                'size' => 'auto',
                'class' => 'fixed-width-sm',
                'align' => 'text-left',
                'float' => true,
            ],
            'before' => [
                'title' => $this->module->l('Before', $this->controller_name),
                'type' => 'text',
                'size' => 'auto',
                'class' => 'fixed-width-sm',
                'align' => 'text-right',
                'callback' => 'callbackBadgeQty',
                'float' => true,
            ],
            'quantity' => [
                'title' => $this->module->l('Quantity', $this->controller_name),
                'type' => 'text',
                'size' => 'auto',
                'class' => 'fixed-width-sm',
                'align' => 'text-right',
                'callback' => $callback,
                'float' => true,
            ],
            'after' => [
                'title' => $this->module->l('Updated', $this->controller_name),
                'type' => 'text',
                'size' => 'auto',
                'class' => 'fixed-width-sm',
                'align' => 'text-right',
                'callback' => 'callbackBadgeQty',
                'float' => true,
            ],
            'result' => [
                'title' => $this->module->l('OK', $this->controller_name),
                'type' => 'text',
                'size' => 'auto',
                'class' => 'fixed-width-xs',
                'align' => 'text-center',
                'callback' => 'callbackShowIcon',
                'float' => true,
            ],
        ];

        return $helper->generateList($rows, $fields_display);
    }

    public function callbackShowIcon($value)
    {
        if ((int) $value) {
            $icon = 'icon icon-check text-success';
        } else {
            $icon = 'icon icon-times text-danger';
        }

        return "<span class=\"$icon\"></span>";
    }

    public function callbackNoQty($value)
    {
        return "<span class=\"badge badge-default\">$value</span>";
    }

    public function callbackLoadQty($value)
    {
        return "<span class=\"badge badge-info\">$value</span>";
    }

    public function callbackUnloadQty($value)
    {
        $value = abs($value);

        return "<span class=\"badge badge-warning\">-{$value}</span>";
    }

    public function callbackUpdateQty($value)
    {
        if ((int) $value < 0) {
            return $this->callbackUnloadQty($value);
        }
        if ((int) $value == 0) {
            return $this->callbackNoQty($value);
        }
        if ((int) $value > 0) {
            return $this->callbackLoadQty($value);
        }
    }

    public function callbackBadgeQty($value)
    {
        if ((int) $value < 0) {
            return "<span class=\"badge badge-danger\">$value</span>";
        }
        if ((int) $value == 0) {
            return "<span class=\"badge badge-default\">$value</span>";
        }
        if ((int) $value > 0) {
            return "<span class=\"badge badge-success\">$value</span>";
        }
    }

    public function ajaxProcessUnloadStockService()
    {
        $file = Tools::fileAttachment('fileUpload');

        if ($file['error']) {
            $this->response([
                'result' => false,
                'file' => $file['content'],
                'error' => $file['error'],
            ]);
        }

        $helper = new MpStockServiceHookController($this->module);
        $errors = [];
        $parsed = $helper->parse($file['content']);

        if ($parsed) {
            foreach ($parsed as &$row) {
                $row['method'] = $this->module->l('unload', $this->controller_name);
                $id_product = (int) $row['id_product'];
                $id_product_attribute = (int) $row['id_product_attribute'];
                $quantity = (int) abs($row['quantity']);

                $product = $this->getProductByIdProductAttribute($id_product_attribute);

                if (!Validate::isLoadedObject($product)) {
                    $row['id_product'] = '--';
                    $row['id_product_attribute'] = (int) $id_product_attribute;
                    $row['result'] = false;
                    $row['before'] = '--';
                    $row['after'] = '--';
                    $row['reference'] = $parsed['reference'];
                    $row['name'] = $row['name'] = $this->module->l('## NON TROVATO ##');
                    $row['combination'] = '--';

                    continue;
                }

                $stockService = new ModelMpStockService($id_product_attribute);
                $res = false;

                try {
                    if (\Validate::isLoadedObject($stockService)) {
                        $row['before'] = $stockService->quantity;
                        $stockService->quantity -= abs($quantity);
                        $row['after'] = $stockService->quantity;
                        $stockService->date = date('Y-m-d H:i:s');
                        $stockService->number = date('YmdHis');
                        $res = $stockService->update();
                    }
                } catch (\Throwable $th) {
                    $res = false;
                }

                $row['result'] = (int) $res;
                $row['reference'] = $product->reference;
                $row['name'] = $product->name;
                $row['combination'] = implode('<br>', $product->combination);
            }
        }

        $this->response([
            'result' => true,
            'tableOut' => $this->tableOut($parsed, 'callbackUnloadQty'),
            'totStockRows' => count($parsed),
            'errors' => $errors,
        ]);
    }

    public function ajaxProcessResetStockService()
    {
        $id_product = (int) Tools::getValue('id_product');
        $res = ModelMpStockService::resetQuantities($id_product);
        $this->response(['result' => $res]);
    }

    public function processBulkReset()
    {
        if (!$this->boxes) {
            $this->warnings[] = $this->module->l('Please select at least one product', $this->controller_name);

            return false;
        }
        foreach ($this->boxes as $box) {
            $id_product = ModelMpStockService::getIdProduct((int) $box);
            $res = ModelMpStockService::resetQuantities($id_product);
            if (!$res) {
                $this->warnings[] = sprintf(
                    $this->module->l('Product id %s error trying to reset quantities.', $this->controller_name),
                    (int) $id_product
                );
            }
        }
        $this->confirmations[] = $this->module->l('Operation done.', $this->controller_name);
    }

    public function processRemoveOrphans()
    {
        $subSql = new DbQuery();
        $subSql
            ->select('id_product_attribute')
            ->from('product_attribute')
            ->orderBy('id_product_attribute');

        $res = Db::getInstance()->delete(
            ModelMpStockService::$definition['table'],
            'id_product_attribute not in (' . $subSql->build() . ')'
        );

        if ($res) {
            $this->confirmations[] = $this->module->l('Orphans removed.', $this->controller_name);
        } else {
            $this->errors[] = sprintf(
                $this->module->l('Error %s'),
                Db::getInstance()->getMsgError()
            );
        }
    }

    public function ajaxProcessUpdateEan13()
    {
        $db = Db::getInstance();
        $barcodes = \Tools::getValue('ean13');
        $res = true;
        $errors = [];
        foreach ($barcodes as $barcode) {
            $id_pa = $barcode['id_product_attribute'];
            $ean13 = $barcode['ean13'];

            $sql = 'update ' . _DB_PREFIX_ . "product_attribute set ean13 = '" . $ean13 . "' where id_product_attribute = " . (int) $id_pa;
            if (!$db->execute($sql)) {
                $res = false;
                $errors[] = $db->getMsgError();
            }
        }

        header('Content-Type: application/json');
        exit(
            json_encode(
                [
                    'result' => $res,
                    'message' => $res ? $this->module->l('Ean13 aggiornati.', 'ModuleStockServiceHookController') : implode('<br>', $errors),
                ]
            )
        );
    }
}
