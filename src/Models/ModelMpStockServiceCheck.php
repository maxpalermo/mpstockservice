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

use \Db;
use \ObjectModel;

class ModelMpStockServiceCheck extends ObjectModel
{
    public $id_product;
    public $id_employee;
    public $is_stock_service;
    public $date_add;
    public $date_upd;

    public static $definition = [
        'table' => 'product_stock_service_check',
        'primary' => 'id_product',
        'multilang' => false,
        'multishop' => false,
        'fields' => [
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
            'is_stock_service' => [
                'type' => self::TYPE_BOOL,
                'validate' => 'isBool',
                'required' => false,
            ],
            'date_add' => [
                'type' => self::TYPE_DATE,
                'validate' => 'isDateFormat',
                'datetime' => true,
                'required' => false,
            ],
            'date_upd' => [
                'type' => self::TYPE_DATE,
                'validate' => 'isDateFormat',
                'datetime' => true,
                'required' => false,
            ],
        ],
    ];

    public static function install()
    {
        $QUERY = '
            CREATE TABLE IF NOT EXISTS `{pfx}product_stock_service_check` (
                `id_product` int(11) NOT NULL,
                `id_employee` int(11) NOT NULL,
                `is_stock_service` tinyint(1) NOT NULL,
                `date_add` datetime NOT NULL,
                `date_upd` datetime NOT NULL DEFAULT current_timestamp(),
                PRIMARY KEY (`id_product`),
                KEY `idx_stockservice_check_employe_id` (`id_employee`)
            ) ENGINE=InnoDB
        ';

        return Db::getInstance()->execute(str_replace('{pfx}', _DB_PREFIX_, $QUERY));
    }

    public static function isStockService($id_product)
    {
        $db = Db::getInstance();
        $sql = sprintf(
            'SELECT is_stock_service FROM %s WHERE id_product = %d',
            _DB_PREFIX_ . self::$definition['table'],
            (int) $id_product
        );

        return (int) $db->getValue($sql);
    }
}
