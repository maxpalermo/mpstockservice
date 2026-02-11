<?php

/**
 * 2007-2018 PrestaShop
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Academic Free License (AFL 3.0)
 * that is bundled with this package in the file LICENSE.txt.
 * It is also available through the world-wide-web at this URL:
 * http://opensource.org/licenses/afl-3.0.php
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@prestashop.com so we can send you a copy immediately.
 *
 * DISCLAIMER
 *
 * Do not edit or add to this file if you wish to upgrade PrestaShop to newer
 * versions in the future. If you wish to customize PrestaShop for your
 * needs please refer to http://www.prestashop.com for more information.
 *
 *  @author    Massimiliano Palermo <maxx.palermo@gmail.com>
 *  @copyright 2020 Digital Solutions®
 *  @license   http://opensource.org/licenses/afl-3.0.php  Academic Free License (AFL 3.0)
 *  International Registered Trademark & Property of PrestaShop SA
 */

namespace MpSoft\MpStockService\Models;

use MpSoft\MpStockService\Controller\AdminSSController;
use \Context;
use \Db;
use \DbQuery;
use \ObjectModel;

class ModelMpStockServiceRow extends ObjectModel
{
    public $id;
    public $id_product_attribute;
    public $id_product;
    public $id_supplier;
    public $id_employee;
    public $document_number;
    public $document_date;
    public $quantity;
    public $date_add;
    public $date_upd;
    protected $module;

    public static $definition = [
        'table' => 'product_stock_service_row',
        'primary' => 'id',
        'multilang' => false,
        'multishop' => false,
        'fields' => [
            'id_product_attribute' => [
                'type' => self::TYPE_INT,
                'validate' => 'isUnsignedId',
                'required' => true,
            ],
            'id_product' => [
                'type' => self::TYPE_INT,
                'validate' => 'isUnsignedId',
                'required' => true,
            ],
            'id_employee' => [
                'type' => self::TYPE_INT,
                'validate' => 'isUnsignedId',
                'required' => false,
            ],
            'id_supplier' => [
                'type' => self::TYPE_INT,
                'validate' => 'isUnsignedId',
                'required' => false,
            ],
            'document_number' => [
                'type' => self::TYPE_STRING,
                'validate' => 'isString',
                'size' => 64,
                'required' => false,
            ],
            'document_date' => [
                'type' => self::TYPE_DATE,
                'validate' => 'isDateOrNull',
                'required' => false,
            ],
            'quantity' => [
                'type' => self::TYPE_INT,
                'validate' => 'isUnsignedInt',
                'required' => false,
            ],
            'date_add' => [
                'type' => self::TYPE_DATE,
                'validate' => 'isDateFormat',
                'required' => true,
            ],
            'date_upd' => [
                'type' => self::TYPE_DATE,
                'validate' => 'isDateFormat',
                'required' => false,
            ],
        ],
    ];

    public function __construct($id_product_attribute, $id_product)
    {
        $id = self::makeId($id_product, $id_product_attribute);
        $id_lang = (int) Context::getContext()->language->id;
        parent::__construct($id, $id_lang);
    }

    public static function truncate()
    {
        return Db::getInstance()->execute('TRUNCATE TABLE ' . _DB_PREFIX_ . self::$definition['table']);
    }

    public static function install()
    {
        $QUERY = '
            CREATE TABLE IF NOT EXISTS `{pfx}product_stock_service_row` (
                `id` VARCHAR(128) NOT NULL,
                `id_product_attribute` INT(11) UNSIGNED NOT NULL DEFAULT 0,
                `id_product` INT(11) UNSIGNED NOT NULL,
                `id_employee` INT(11) UNSIGNED DEFAULT NULL,
                `id_supplier` INT(11) UNSIGNED DEFAULT NULL,
                `document_number` varchar(64) DEFAULT NULL,
                `document_date` date DEFAULT NULL,
                `quantity` INT(11) UNSIGNED DEFAULT 0,
                `date_add` datetime NOT NULL,
                `date_upd` datetime NULL,
                PRIMARY KEY (`id`),
                UNIQUE KEY `uk_stockservice_product_pa` (`id_product`, `id_product_attribute`),
                KEY `idx_stockservice_product` (`id_product`),
                KEY `idx_stockservice_pa` (`id_product_attribute`),
                KEY `idx_stockservice_employee` (`id_employee`),
                KEY `idx_stockservice_supplier` (`id_supplier`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        ';

        return Db::getInstance()->execute(str_replace('{pfx}', _DB_PREFIX_, $QUERY));
    }

    public function add($auto_date = true, $null_values = false)
    {
        if ($this->document_date) {
            $this->document_date = date('Y-m-d', strtotime($this->document_date));
        }
        $this->quantity = (int) ($this->quantity < 0 ? 0 : $this->quantity);

        return parent::add($auto_date, $null_values);
    }

    public function update($null_values = false)
    {
        if ($this->document_date) {
            $this->document_date = date('Y-m-d', strtotime($this->document_date));
        }
        $this->quantity = (int) ($this->quantity < 0 ? 0 : $this->quantity);

        return parent::update($null_values);
    }

    public static function getByEan13($ean13)
    {
        $ean13 = (int) $ean13;
        $table = _DB_PREFIX_ . 'product_attribute';
        $sql = "SELECT `id_product`, `id_product_attribute` FROM {$table} WHERE `ean13`={$ean13}";

        $row = Db::getInstance()->getRow($sql);
        if ($row) {
            $model = new self($row['id_product_attribute'], $row['id_product']);
        }

        if (\Validate::isLoadedObject($model)) {
            return $model;
        }

        return false;
    }

    public static function getIdProduct($id_product_attribute)
    {
        $id_product_attribute = (int) $id_product_attribute;
        $table = _DB_PREFIX_ . 'product_attribute';
        $sql = "SELECT `id_product` FROM {$table} WHERE `id_product_attribute`={$id_product_attribute}";

        return (int) Db::getInstance()->getValue($sql);
    }

    public function addQuantity($id_product, $id_product_attribute, $id_supplier, $number, $date, $quantity)
    {
        $db = Db::getInstance();
        if (!$id_product_attribute) {
            return [
                'error' => true,
                'message' => $this->module->l('Id product attribute not valid.'),
            ];
        }
        if (!$id_supplier) {
            return [
                'error' => true,
                'message' => $this->module->l('Id supplier not valid.'),
            ];
        }
        if (!$number) {
            return [
                'error' => true,
                'message' => $this->module->l('Document number not valid.'),
            ];
        }
        if (!$date) {
            return [
                'error' => true,
                'message' => $this->module->l('Document date not valid.'),
            ];
        }

        if (!$quantity) {
            return [
                'error' => true,
                'message' => $this->module->l('Quantity not valid.'),
            ];
        }

        $row = new self($id_product_attribute, $id_product);
        $row->quantity += $quantity;
        $row->id_supplier = $id_supplier;
        $row->number = $number;
        $row->date = $date;
        $res = (int) $row->update();
        if (!$res) {
            return [
                'error' => true,
                'message' => Db::getInstance()->getMsgError(),
            ];
        }

        return true;
    }

    public function addStockServiceProduct($id_product)
    {
        $db = Db::getInstance();
        $sql = new DbQuery();
        $sql
            ->select('id_product_attribute')
            ->from('product_attribute')
            ->where('id_product = ' . (int) $id_product)
            ->orderBy('id_product_attribute');
        $res = $db->executeS($sql);
        foreach ($res as $row) {
            $obj = new ModelMpStockService();
            $obj->force_id = true;
            $obj->id_product = $id_product;
            $obj->id_product_attribute = $row['id_product_attribute'];
            $add = $obj->add();
            if (!$add) {
                return [
                    'error' => true,
                    'message' => $db->getMsgError(),
                ];
            }
        }

        return true;
    }

    public function delStockServiceProduct($id_product)
    {
        $db = Db::getInstance();
        $res = $db->delete(
            self::$definition['table'],
            'id_product = ' . (int) $id_product
        );
        if ($res) {
            return $db->Affected_Rows();
        }

        return [
            'error' => true,
            'message' => $db->getMsgError(),
        ];
    }

    public static function getStockServiceProductList($id_product)
    {
        $id_lang = (int) Context::getContext()->language->id;
        $items = [];

        if (!$id_product) {
            return [
                'success' => false,
                'message' => 'Prodotto non valido',
            ];
        }

        $product = new \Product($id_product);
        $combinations = $product->getAttributeCombinations($id_lang);
        $combinationGroups = [];
        $isStockService = ModelMpStockService::isStockService($id_product);

        foreach ($combinations as $combination) {
            $combinationGroups[$combination['id_product_attribute']][] = $combination;
        }
        unset($combination);

        foreach ($combinationGroups as $combinationGroup) {
            $comb = array_map(fn($attribute) => $attribute['attribute_name'], $combinationGroup);

            $combination = $combinationGroup[0];
            $stockService = new self($combination['id_product_attribute'], $id_product);

            $item['is_stock_service'] = (int) $isStockService;
            $item['id_product'] = $id_product;
            $item['id_product_attribute'] = $combination['id_product_attribute'];
            $item['ean13'] = $combination['ean13'];
            $item['combination'] = implode(', ', $comb);
            $item['quantity'] = (int) $stockService->quantity;
            $item['variation'] = 0;
            $item['supplier'] = AdminSSController::getSupplierName($stockService->id_supplier);
            $item['employee'] = AdminSSController::getEmployeeName($stockService->id_employee);
            $item['document_number'] = $stockService->document_number ?: '';
            $item['document_date'] = date('Y-m-d', strtotime($stockService->document_date));
            $items[] = $item;
        }

        return $items;
    }

    public static function resetQuantities($id_product)
    {
        $id_product = (int) $id_product;
        $table = _DB_PREFIX_ . self::$definition['table'];
        $sql = "UPDATE {$table} SET `quantity` = 0 WHERE `id_product` = {$id_product}";

        return Db::getInstance()->execute($sql);
    }

    public static function insertProductCombinations($id_product)
    {
        $id_lang = (int) Context::getContext()->language->id;
        $product = new \Product($id_product);
        $attributes = $product->getAttributeCombinations($id_lang);
        $combinations = [];
        $errors = [];
        foreach ($attributes as $attribute) {
            $combinations[$attribute['id_product_attribute']][] = $attribute;
        }

        foreach ($combinations as $key => $combination) {
            $model = new self(0, 0);
            $model->force_id = true;
            $model->id = $key;
            $model->id_product = $id_product;
            $model->id_supplier = 0;
            $model->number = 0;
            $model->date = null;
            $model->quantity = 0;
            try {
                $model->add();
            } catch (\Throwable $th) {
                $errors[] = $th->getMessage();
            }
        }

        return [
            'combinations' => $combinations,
            'errors' => $errors,
        ];
    }

    public static function makeId($id_product, $id_product_attribute)
    {
        return "{$id_product_attribute}-{$id_product}";
    }

    public static function makeIdByEan13($ean13)
    {
        $id = \Combination::getIdByEan13($ean13);
        if ($id) {
            $comb = new \Combination($id);
            if (!\Validate::isLoadedObject($comb)) {
                return false;
            }

            return self::makeId($comb->id_product, $comb->id);
        }

        return false;
    }

    public static function getCurrentStock($id_product, $id_product_attribute)
    {
        $db = Db::getInstance();
        $sql = new DbQuery();
        $sql
            ->select('quantity')
            ->from(self::$definition['table'])
            ->where('id_product=' . (int) $id_product)
            ->where('id_product_attribute=' . (int) $id_product_attribute);

        return (int) $db->getValue($sql);
    }
}
