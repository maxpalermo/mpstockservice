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

namespace MpSoft\MpStockService\Controller;

use MpSoft\MpStockService\Helpers\GetTwigEnvironment;
use MpSoft\MpStockService\Models\ModelMpStockService;
use MpSoft\MpStockService\Models\ModelMpStockServiceRow;
use Db;
use DbQuery;
use \Context;

class AdminSSController
{
    private static $suppliers;
    private static $employees;

    /**
     * Get product attribute id by ean13
     * @param string $ean13
     * @param int $id_product
     * @return array [id_product_attribute, id_product]
     */
    public static function getIdProductAttributeByEan13($ean13, &$id_product): array|false
    {
        $id_product = 0;
        $db = Db::getInstance();
        $query = new DbQuery();
        $query
            ->select('id_product, id_product_attribute')
            ->from('product_attribute')
            ->where('ean13 = "' . $ean13 . '"');

        $result = $db->getRow($query);

        if ($result) {
            return [
                'id_product_attribute' => (int) $result['id_product_attribute'],
                'id_product' => (int) $result['id_product']
            ];
        }

        return false;
    }

    public static function getCombinationsByProduct($id_product, $id_product_attribute = null)
    {
        $id_lang = (int) Context::getContext()->language->id;
        $product = new \Product($id_product, false, $id_lang);
        $combinations = $product->getAttributeCombinations($id_lang);
        $out = [];
        if ($combinations) {
            foreach ($combinations as $combination) {
                $out[$combination['id_product_attribute']][] = $combination;
            }
        }

        if ($out) {
            $list = [];
            foreach ($out as $key => $combination) {
                $stockServiceRow = self::getStockServiceRow($key, $product->id);
                $list[] = [
                    'id_product' => $id_product,
                    'id_product_attribute' => $key,
                    'name' => implode(',', array_map(function ($item) {
                        return $item['attribute_name'];
                    }, $combination)),
                    'id_supplier' => $stockServiceRow['id_supplier'] ?? 0,
                    'id_employee' => $stockServiceRow['id_employee'] ?? 0,
                    'is_stock_service' => $stockServiceRow['is_stock_service'] ?? 0,
                    'document_number' => $stockServiceRow['number'] ?? '',
                    'document_date' => $stockServiceRow['date'] ?? '',
                    'quantity' => $stockServiceRow['quantity'] ?? 0,
                    'supplier_name' => self::getSupplierName($stockServiceRow['id_supplier'] ?? 0),
                    'employee_name' => self::getEmployeeName($stockServiceRow['id_employee'] ?? 0),
                ];
            }

            if ($id_product_attribute) {
                $list = array_map(fn($item) => $item['id_product_attribute'] == $id_product_attribute ? $item : null, $list);
                $list = array_filter($list);
                return reset($list);
            }

            return $list;
        }

        return [];
    }

    public static function getStockServiceRow($id_product_attribute, $id_product = 0)
    {
        $id = ModelMpStockServiceRow::makeId($id_product, $id_product_attribute);
        $db = Db::getInstance();
        $sql = new DbQuery();
        $sql
            ->select('a.*')
            ->select('b.is_stock_service')
            ->from('product_stock_service_row', 'a')
            ->leftJoin('product_stock_service', 'b', 'a.id_product = b.id_product')
            ->where('a.id_product_attribute = ' . (int) $id_product_attribute);
        if ($id_product) {
            $sql->where('b.id_product = ' . (int) $id_product);
        }
        $query = $sql->build();
        $res = $db->getRow($query);
        if (!$res) {
            return [];
        }

        $res['document_date'] = substr($res['document_date'], 0, 10);

        return $res;
    }

    public static function getSupplierName($id_supplier)
    {
        $id_lang = (int) Context::getContext()->language->id;
        $supplierExists = false;

        if (!$id_supplier) {
            return 'N/D';
        }

        if (!self::$suppliers) {
            $supplier = new \Supplier($id_supplier, $id_lang);
            if (!\Validate::isLoadedObject($supplier)) {
                return 'N/D';
            }
            $supplierExists = true;
            self::$suppliers[$id_supplier] = $supplier->getFields();
        } elseif (isset(self::$suppliers[$id_supplier])) {
            $supplierExists = true;
        }

        if ($supplierExists) {
            return \Tools::strtoupper(self::$suppliers[$id_supplier]['name']);
        }

        return 'N/D';
    }

    public static function getEmployeeName($id_employee)
    {
        $id_lang = (int) Context::getContext()->language->id;
        $employeeExists = false;

        if (!$id_employee) {
            return 'N/D';
        }

        if (!self::$employees) {
            $employee = new \Employee($id_employee, $id_lang);
            if (!\Validate::isLoadedObject($employee)) {
                return 'N/D';
            }
            $employeeExists = true;
            self::$employees[$id_employee] = $employee->getFields();
        } elseif (isset(self::$employees[$id_employee])) {
            $employeeExists = true;
        }

        if ($employeeExists) {
            return \Tools::strtoupper(self::$employees[$id_employee]['firstname'] . ' ' . self::$employees[$id_employee]['lastname']);
        }

        return $employee->firstname . ' ' . $employee->lastname;
    }

    public static function getSupplierId($id_product, $id_product_attribute)
    {
        $db = Db::getInstance();
        $sql = new DbQuery();
        $sql
            ->select('id_supplier')
            ->from('product_supplier')
            ->where('id_product = ' . (int) $id_product)
            ->where('id_product_attribute = ' . (int) $id_product_attribute);
        $result = $db->getValue($sql);

        return $result ? (int) $result : 0;
    }

    public static function getImageUrl($id_product, $id_product_attribute = null)
    {
        $cover = \Image::getCover($id_product);
        if (!$cover) {
            $cover = [
                'id_image' => 0,
            ];
        }

        return Context::getContext()->link->getImageLink('product', $cover['id_image'], 'small_default');
    }

    public static function renderTableResults($parsed)
    {
        $twig = new GetTwigEnvironment('mpstockservice');
        $twig->load('hooks/importResults');

        return $twig->render(['parsed' => $parsed]);
    }

    public static function getRouterProductLink($id_product)
    {
        /** @var  \MpStockService $module */
        $module = \Module::getInstanceByName('mpstockservice');

        return $module->getProductEditLink($id_product);
    }

    public static function removeStockServiceOff()
    {
        $pfx = _DB_PREFIX_;
        $queries = [
            "delete from {$pfx}product_stock_service where stock_service = 0",
            "delete from {$pfx}product_stock_service_row where id_product not in (select id_product from  {$pfx}product_stock_service)"
        ];
        $affected = [];
        $db = Db::getInstance();
        foreach ($queries as $query) {
            $db->execute($query);
            $affected[] = $db->Affected_Rows();
        }

        return $affected;
    }
}
