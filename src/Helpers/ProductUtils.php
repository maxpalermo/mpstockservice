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

namespace MpSoft\MpStockService\Helpers;

class ProductUtils
{
    private $module;
    private $context;
    private $db;
    private $id_lang;
    private $id_shop;

    public function __construct($module)
    {
        $this->module = $module;
        $this->context = \Context::getContext();
        $this->db = \Db::getInstance();
        $this->id_lang = (int) $this->context->language->id;
        $this->id_shop = (int) $this->context->shop->id;
    }

    public function getCombinations(\Product $product)
    {
        $combinations = $product->getAttributeCombinations($this->id_lang);
        $out = [];
        if ($combinations) {
            foreach ($combinations as $combination) {
                $out[$combination['id_product_attribute']][] = $combination;
            }
        }

        if ($out) {
            $list = [];
            foreach ($out as $key => $combination) {
                $stockServiceRow = $this->getStockServiceRow($key, $product->id);
                $list[] = [
                    'id_product_attribute' => $key,
                    'combination' => implode(',', array_map(function ($item) {
                        return $item['attribute_name'];
                    }, $combination)),
                    'id_supplier' => $stockServiceRow['id_supplier'] ?? 0,
                    'id_employee' => $stockServiceRow['id_employee'] ?? 0,
                    'is_stock_service' => $stockServiceRow['is_stock_service'] ?? 0,
                    'number' => $stockServiceRow['number'] ?? '',
                    'date' => $stockServiceRow['date'] ?? '',
                    'quantity' => $stockServiceRow['quantity'] ?? 0,
                ];
            }

            return $list;
        }

        return [];
    }

    public function getStockServiceRow($id_product_attribute, $id_product = 0)
    {
        $db = $this->db;
        $sql = new \DbQuery();
        $sql->select('a.*')
            ->select('b.is_stock_service')
            ->from('product_stock_service', 'a')
            ->leftJoin('product_stock_service_check', 'b', 'a.id_product = b.id_product')
            ->where('a.id_product_attribute = ' . (int) $id_product_attribute);
        if ($id_product) {
            $sql->where('b.id_product = ' . (int) $id_product);
        }
        $query = $sql->build();
        $res = $db->getRow($query);
        if (!$res) {
            return [];
        }

        $res['date'] = substr($res['date'], 0, 10);

        return $res;
    }

    /**
     * Get the stock service quantity for a specific product attribute
     *
     * @param int $id_product_attribute
     *
     * @return int
     */
    public function getStockServiceQuantity($id_product_attribute)
    {
        $db = $this->db;
        $sql = new \DbQuery();
        $sql->select('quantity')
            ->from('product_stock_service')
            ->where('id_product_attribute = ' . (int) $id_product_attribute);
        $res = $db->getRow($sql);
        if (!$res) {
            return 0;
        }

        return $res['quantity'];
    }

    /**
     * Check if a product is enabled for stock service
     *
     * @param int $id_product
     *
     * @return int
     */
    public function isStockService($id_product)
    {
        $db = $this->db;
        $sql = new \DbQuery();
        $sql->select('count(*)')
            ->from('product_stock_service_check')
            ->where('id_product = ' . (int) $id_product);
        $res = $db->getValue($sql);

        return (int) $res;
    }
}
