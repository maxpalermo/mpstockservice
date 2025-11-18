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

use Combination;
use \Context;
use \Db;
use \DbQuery;
use \Module;
use \ObjectModel;

class ModelMpStockService extends ObjectModel
{
    public $id;
    public $id_product;
    public $id_supplier;
    public $number;
    public $date;
    public $quantity;
    protected $module;

    public static $definition = [
        'table' => 'product_stock_service',
        'primary' => 'id_product_attribute',
        'multilang' => false,
        'multishop' => false,
        'fields' => [
            'id_product' => [
                'type' => self::TYPE_INT,
                'validate' => 'isUnsignedId',
                'required' => true,
            ],
            'id_supplier' => [
                'type' => self::TYPE_INT,
                'validate' => 'isUnsignedId',
                'required' => false,
            ],
            'number' => [
                'type' => self::TYPE_STRING,
                'validate' => 'isString',
                'size' => 20,
                'required' => false,
            ],
            'date' => [
                'type' => self::TYPE_DATE,
                'validate' => 'isDateOrNull',
                'datetime' => true,
                'required' => false,
            ],
            'quantity' => [
                'type' => self::TYPE_INT,
                'validate' => 'isUnsignedInt',
                'required' => false,
            ],
        ],
    ];

    public function __construct($id = null, $id_lang = null, $id_shop = null)
    {
        if (!$id_shop) {
            $this->id_shop = (int) Context::getContext()->shop->id;
        } else {
            $this->id_shop = (int) $id_shop;
        }
        if (!$id_lang) {
            $this->id_lang = Context::getContext()->language->id;
        } else {
            $this->id_lang = (int) $id_lang;
        }
        parent::__construct($id, $this->id_lang, $this->id_shop);
        $this->context = Context::getContext();
        $this->smarty = Context::getContext()->smarty;
        $this->module = Module::getInstanceByName('mpstockservice');
    }

    public static function truncate()
    {
        return Db::getInstance()->execute('TRUNCATE TABLE ' . _DB_PREFIX_ . self::$definition['table']);
    }

    public static function install()
    {
        $QUERY = '
            CREATE TABLE IF NOT EXISTS `{pfx}product_stock_service` (
                `id_product_attribute` int(11) NOT NULL AUTO_INCREMENT,
                `id_product` int(11) NOT NULL,
                `id_supplier` int(11) DEFAULT NULL,
                `number` varchar(20) DEFAULT NULL,
                `date` datetime DEFAULT NULL,
                `quantity` int(11) DEFAULT NULL,
                PRIMARY KEY (`id_product_attribute`),
                KEY `idx_stockservice_product` (`id_product`),
                KEY `idx_stockservice_supplier` (`id_supplier`)
            ) ENGINE=InnoDB
        ';

        return Db::getInstance()->execute(str_replace('{pfx}', _DB_PREFIX_, $QUERY));
    }

    public function add($auto_date = true, $null_values = false)
    {
        $this->date = date('Y-m-d', strtotime($this->date));
        $this->quantity = (int) ($this->quantity < 0 ? 0 : $this->quantity);
        return parent::add($auto_date, $null_values);
    }

    public function update($null_values = false)
    {
        $this->date = date('Y-m-d', strtotime($this->date));
        $this->quantity = (int) ($this->quantity < 0 ? 0 : $this->quantity);
        return parent::update($null_values);
    }

    public function getSupplierName()
    {
        $id_lang = (int) Context::getContext()->language->id;
        $supplier = new \Supplier($this->id_supplier, $id_lang);

        return $supplier->name ?: '';
    }

    public static function getByEan13($ean13)
    {
        $ean13 = (int) $ean13;
        $table = _DB_PREFIX_ . 'product_attribute';
        $sql = "SELECT `id_product_attribute` FROM {$table} WHERE `ean13`={$ean13}";

        $id_product_attribute = (int) Db::getInstance()->getValue($sql);
        $model = new self($id_product_attribute);

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

    public function addQuantity($id_product_attribute, $id_supplier, $number, $date, $quantity)
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

        $row = new ModelMpStockService($id_product_attribute);
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

    public static function getStockServiceByProduct($id_product)
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

        foreach ($combinations as $combination) {
            $combinationGroups[$combination['id_product_attribute']][] = $combination;
        }
        unset($combination);

        foreach ($combinationGroups as $combinationGroup) {
            $comb = array_map(fn($attribute) => $attribute['attribute_name'], $combinationGroup);

            $combination = $combinationGroup[0];
            $item['id_product'] = $id_product;
            $item['id_product_attribute'] = $combination['id_product_attribute'];
            $item['ean13'] = $combination['ean13'];
            $item['combination'] = implode(', ', $comb);
            $stockService = new self($combination['id_product_attribute']);
            $item['quantity'] = (int) $stockService->quantity;
            $item['variation'] = 0;
            $item['supplier'] = $stockService->getSupplierName();
            $item['document_number'] = $stockService->number ?: '';
            $item['document_date'] = date('Y-m-d', strtotime($stockService->date));
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
}
