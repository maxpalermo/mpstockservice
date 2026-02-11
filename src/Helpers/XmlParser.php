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

use MpSoft\MpStockService\Controller\AdminSSController;
use MpSoft\MpStockService\Models\ModelMpStockService;
use MpSoft\MpStockService\Models\ModelMpStockServiceRow;

/**
 * Classe per il parsing di file XML
 */
class XmlParser
{
    /**
     * @var string Il contenuto del file XML
     */
    private $xmlContent;

    /**
     * @var \SimpleXMLElement L'oggetto SimpleXMLElement per il parsing
     */
    private $xml;

    /**
     * @var string Il nome del file XML
     */
    private $filename;

    /**
     * @var string Il numero del documento
     */
    private $number;

    /**
     * @var string La data del documento
     */
    private $date;

    /**
     * Costruttore
     *
     * @param string $filename Il nome del file XML
     * @param string $xmlContent Il contenuto del file XML o il percorso al file
     * @param bool $isFile Indica se $xmlContent è un percorso file o una stringa XML
     */
    public function __construct($filename, $xmlContent, $isFile = false)
    {
        if ($isFile) {
            if (!file_exists($xmlContent)) {
                throw new \Exception("Il file XML non esiste: $xmlContent");
            }
            $this->filename = $filename;
            $this->xmlContent = file_get_contents($xmlContent);
        } else {
            $this->xmlContent = $xmlContent;
        }

        $this->loadXml();
    }

    private function getNumberDocument()
    {
        // Il formato del file è [C|S](<numero>-<data>)<ora>.XML
        // serve Numero documento
        $pattern = '/[C|S]\((\d+)-(\d+)\)(\d+)\.XML/';
        preg_match($pattern, $this->filename, $matches);
        if (empty($matches)) {
            return 0;
        }

        return $matches[1];
    }

    /**
     * Carica il contenuto XML in un oggetto SimpleXMLElement
     *
     * @throws \Exception Se il parsing XML fallisce
     */
    private function loadXml()
    {
        libxml_use_internal_errors(true);
        $this->number = $this->getNumberDocument();
        $this->date = date('Y-m-d H:i:s');
        $this->xml = simplexml_load_string($this->xmlContent);

        if ($this->xml === false) {
            $errors = libxml_get_errors();
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = "Errore XML: {$error->message} alla riga {$error->line}";
            }
            libxml_clear_errors();

            throw new \Exception(implode("\n", $errorMessages));
        }
    }

    /**
     * Estrae i dati richiesti dalle righe XML
     *
     * @return array Array di dati estratti con ean13, reference e qty
     */
    public function extractRowData($movement = 'load', $force_update = false)
    {
        $result = [];
        $multiplier = 1;
        if ($movement == 'unload') {
            $multiplier = -1;
        }

        if (!isset($this->xml->rows->row)) {
            return $result;
        }

        foreach ($this->xml->rows->row as $row) {
            $ean13Node = $row->xpath('./ean13');
            $referenceNode = $row->xpath('./reference');
            $qtyNode = $row->xpath('./qty');

            $ean13 = isset($ean13Node[0]) ? (string) $ean13Node[0] : '';
            $reference = isset($referenceNode[0]) ? (string) $referenceNode[0] : '';
            $qty = isset($qtyNode[0]) ? (int) ((string) $qtyNode[0]) : 0;

            $id_product = 0;
            $product_attribute = AdminSSController::getIdProductAttributeByEan13($ean13, $id_product);
            if ($product_attribute) {
                $id_product = (int) $product_attribute['id_product'];
                $id_product_attribute = (int) $product_attribute['id_product_attribute'];
            }

            if (!$id_product_attribute) {
                continue;
            }

            $combination = AdminSSController::getCombinationsByProduct($id_product, $id_product_attribute);
            $stock = ModelMpStockServiceRow::getCurrentStock($id_product, $id_product_attribute);
            $movement = abs($qty) * $multiplier;

            $item = [
                'id_product' => $id_product,
                'id_product_attribute' => $id_product_attribute,
                'reference' => $reference,
                'name' => \Product::getProductName($id_product),
                'ean13' => $ean13,
                'product_link' => AdminSSController::getRouterProductLink($id_product),
                'combination' => $combination,
                'stock' => $stock,
                'movement' => $movement,
                'quantity' => $stock + $movement,
                'status' => 'pending',
                'force_update' => $force_update,
            ];

            if (!$item['id_product_attribute']) {
                $item['status'] = 'unknown';
            }

            $isStockService = ModelMpStockService::isStockService($id_product);
            $item['is_stock_service'] = $isStockService;

            $imageUrl = AdminSSController::getImageUrl($item['id_product'], $item['id_product_attribute']);
            $item['image_url'] = $imageUrl;

            if ($force_update && !$isStockService) {
                $result[] = $item;
            } elseif ($isStockService) {
                $result[] = $item;
            } elseif (!$isStockService) {
                $item['skipped'] = true;
                $result[] = $item;
            }
        }

        return $result;
    }

    private function getCombination($id_product, $id_product_attribute) {}

    /**
     * Ottiene il tipo di movimento
     *
     * @return string Il tipo di movimento
     */
    public function getMovementType()
    {
        return isset($this->xml->movement_type) ? (string) $this->xml->movement_type : '';
    }

    /**
     * Ottiene la data del movimento
     *
     * @return string La data del movimento
     */
    public function getMovementDate()
    {
        return isset($this->xml->movement_date) ? (string) $this->xml->movement_date : '';
    }

    /**
     * Ottiene tutte le informazioni dal file XML
     *
     * @return array Array con tutti i dati estratti
     */
    public function parse($movement = 'load', $force_update = false)
    {
        return [
            'movement_type' => $this->getMovementType(),
            'movement_number' => $this->getNumberDocument(),
            'movement_date' => $this->getMovementDate(),
            'id_supplier' => 0,
            'rows' => $this->extractRowData($movement, $force_update),
        ];
    }

    public function update(&$parsed)
    {
        $id_employee = (int) \Context::getContext()->employee->id;
        $employee_name = AdminSSController::getEmployeeName(($id_employee));

        foreach ($parsed['rows'] as &$row) {
            if ($row['status'] == 'unknown') {
                continue;
            }

            $id_supplier = AdminSSController::getSupplierId($row['id_product'], $row['id_product_attribute']);
            $supplier_name = AdminSSController::getSupplierName($id_supplier);

            $row['id_employee'] = $id_employee;
            $row['employee_name'] = $employee_name;
            $row['id_supplier'] = $id_supplier;
            $row['supplier_name'] = $supplier_name;

            if (!$row['id_product']) {
                continue;
            }

            if (!$row['is_stock_service'] && !$row['force_update']) {
                continue;
            }

            $id = ModelMpStockServiceRow::makeId($row['id_product'], $row['id_product_attribute']);
            $model = new ModelMpStockServiceRow($row['id_product_attribute'], $row['id_product']);

            $model->id_product_attribute = $row['id_product_attribute'];
            $model->id_product = $row['id_product'];
            $model->id_employee = $row['id_employee'];
            $model->id_supplier = $row['id_supplier'];
            $model->document_number = $parsed['movement_number'] ?? null;
            $model->document_date = $parsed['movement_date'] ?? null;
            $model->quantity = $row['quantity'];

            if (!\Validate::isLoadedObject($model)) {
                $model->force_id = true;
                $model->id = $id;
                $model->date_add = date('Y-m-d H:i:s');
                $res = $model->add(false, true);
            } else {
                $model->date_upd = date('Y-m-d H:i:s');
                $res = $model->update(true);
            }

            if ($res) {
                $row['status'] = 'updated';
            }

            if ($row['force_update']) {
                $model = new ModelMpStockService($row['id_product']);
                if (\Validate::isLoadedObject($model)) {
                    $model->is_stock_service = true;
                    $model->id_employee = $id_employee;
                    $model->update();
                }
            }
        }
    }
}
