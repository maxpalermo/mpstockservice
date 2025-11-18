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

use MpSoft\MpStockService\Models\ModelMpStockService;

class StockServiceList
{
    protected $rows;
    protected $module;
    protected $id_lang;
    protected $number_document;

    public function __construct($number_document, $list, $force = false)
    {
        $this->number_document = $number_document;
        $this->rows = $list;
        $this->module = \Module::getInstanceByName('mpstockservice');
        $this->force = $force;
        $this->id_lang = (int) \Context::getContext()->language->id;
    }

    public function populate()
    {
        foreach ($this->rows as $key => &$row) {
            $ean13 = $row['ean13'] ?? '';
            $reference = $row['reference'] ?? '';

            if (!$ean13 && !$reference) {
                unset($this->rows[$key]);

                continue;
            }

            $productAttributeEan13 = $this->findByEan13($ean13, true);
            $productAttributeReference = $this->findByReference($reference, true);
            $productEan13 = $this->findByEan13($ean13, false);
            $productReference = $this->findByReference($reference, false);

            if ($productAttributeEan13) {
                $row['id_product_attribute'] = $productAttributeEan13['id_product_attribute'];
                $row['id_product'] = $productAttributeEan13['id_product'] ?? 0;
            } elseif ($productAttributeReference) {
                $row['id_product_attribute'] = $productAttributeReference['id_product_attribute'];
                $row['id_product'] = $productAttributeReference['id_product'] ?? 0;
            } elseif ($productEan13) {
                $row['id_product_attribute'] = $productEan13['id_product_attribute'];
                $row['id_product'] = $productEan13['id_product'] ?? 0;
            } elseif ($productReference) {
                $row['id_product_attribute'] = $productReference['id_product_attribute'];
                $row['id_product'] = $productReference['id_product'] ?? 0;
            } else {
                unset($this->rows[$key]);
            }

            $row['id_supplier'] = 0;
            $row['number_document'] = $this->number_document;
            $row['date'] = date('Y-m-d H:i:s');
            $row['name'] = $this->getProductName($row['id_product']);
            $row['combination'] = $this->getCombinationName($row['id_product'], $row['id_product_attribute']);
        }

        return $this->rows;
    }

    protected function getProductName($id_product)
    {
        $product = new \Product($id_product, false, $this->id_lang);
        if (!\Validate::isLoadedObject($product)) {
            return '';
        }

        return $product->name;
    }

    protected function getCombinationName($id_product, $id_product_attribute)
    {
        $product = new \Product($id_product, false, $this->id_lang);
        if (!\Validate::isLoadedObject($product)) {
            return '';
        }

        $combination = $product->getAttributeCombinationsById($id_product_attribute, $this->id_lang);
        if (!$combination) {
            return '';
        }

        $name = [];
        foreach ($combination as $attribute) {
            $name[] = $attribute['attribute_name'];
        }

        return implode(',', $name);
    }

    protected function findByEan13($ean13, $isProductAttribute = true)
    {
        $db = \Db::getInstance();
        $table = _DB_PREFIX_ . ($isProductAttribute ? 'product_attribute' : 'product');
        $sql = "SELECT * FROM {$table} WHERE ean13 = ':ean13'";
        $params = [
            ':ean13' => $ean13,
        ];
        $query = self::buildQuery($sql, $params);

        return $db->getRow($query);
    }

    protected function findByReference($reference, $isProductAttribute = true)
    {
        $db = \Db::getInstance();
        $table = _DB_PREFIX_ . ($isProductAttribute ? 'product_attribute' : 'product');
        $sql = "SELECT * FROM {$table} WHERE reference = ':reference'";
        $params = [
            ':reference' => $reference,
        ];
        $query = self::buildQuery($sql, $params);

        return $db->getRow($query);
    }

    public static function buildQuery($query, $params = [])
    {
        foreach ($params as $key => $value) {
            $query = str_replace($key, $value, $query);
        }

        return $query;
    }

    public function load($force = false)
    {
        return $this->doUpdate($force, 1);
    }

    public function unload($force = false)
    {
        return $this->doUpdate($force, -1);
    }

    protected function doUpdate($force, $sign = 1)
    {
        foreach ($this->rows as &$row) {
            $model = new ModelMpStockService($row['id_product_attribute']);
            if ($force && !\Validate::isLoadedObject($model)) {
                $row['variation'] = $row['quantity'];
                $row['before'] = $model->quantity;
                $model->force_id = true;
                $model->id = $row['id_product_attribute'];
                $model->id_product = $row['id_product'];
                $model->id_supplier = 0;
                $model->number = $row['number_document'];
                $model->date = date('Y-m-d H:i:s');
                $model->quantity = (int) $row['quantity'] < 0 ? 0 : (int) $row['quantity'];
                $model->add();
                $row['after'] = $model->quantity;
                $row['updated'] = true;
            } else {
                if (\Validate::isLoadedObject($model)) {
                    $row['variation'] = $row['quantity'];
                    $row['before'] = $model->quantity;

                    $model->force_id = true;
                    $model->id = $row['id_product_attribute'];
                    $model->id_product = $row['id_product'];
                    $model->id_supplier = 0;
                    $model->number = $row['number_document'];
                    $model->date = date('Y-m-d H:i:s');
                    $model->quantity += (int) $row['quantity'] * $sign;
                    if ($model->quantity < 0) {
                        $model->quantity = 0;
                    }
                    $model->update();
                    $row['after'] = $model->quantity;
                    $row['updated'] = true;
                } else {
                    $row['updated'] = false;
                    $row['variation'] = $row['quantity'];
                    $row['before'] = 0;
                    $row['after'] = 0;
                }
            }
        }

        return $this->rows;
    }
}
