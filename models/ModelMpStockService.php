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
                'validate' => 'isDate',
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

    public static function existsColumn($table, $column)
    {
        $sql = 'SELECT count(*) '
            . 'FROM information_schema.COLUMNS '
            . 'WHERE '
            . "TABLE_SCHEMA = '" . _DB_NAME_ . "' "
            . "AND TABLE_NAME = '" . _DB_PREFIX_ . $table . "' "
            . "AND COLUMN_NAME = '" . $column . "';";

        return (int) Db::getInstance()->getValue($sql);
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
        $sql->select('id_product_attribute')
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

    public function getStockServiceProduct($id_product)
    {
        if (!$id_product) {
            return [
                'error' => true,
                'message' => $this->module->l('Id Product not valid.'),
            ];
        }
        $db = Db::getInstance();
        $sql = new DbQuery();
        $sql->select('*')
            ->from(self::$definition['table'])
            ->where('id_product = ' . (int) $id_product);

        return $db->executeS($sql);
    }

    public static function isStockServiceProduct($id_product)
    {
        $db = Db::getInstance();
        $sql = new DbQuery();
        $sql->select('count(*)')
            ->from(self::$definition['table'])
            ->where('id_product=' . (int) $id_product);

        return (bool) $db->getValue($sql);
    }

    public static function resetQuantities($id_product)
    {
        $id_product = (int) $id_product;
        $table = _DB_PREFIX_ . self::$definition['table'];
        $sql = "UPDATE {$table} SET `quantity` = 0 WHERE `id_product` = {$id_product}";

        return Db::getInstance()->execute($sql);
    }
}
