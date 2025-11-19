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
            $id_product_attribute = $this->getIdProductAttributeByEan13($ean13, $id_product);

            if (!$id_product_attribute) {
                continue;
            }

            $item = [
                'id_product' => $id_product,
                'id_product_attribute' => $id_product_attribute,
                'ean13' => $ean13,
                'reference' => $reference,
                'movement' => abs($qty) * $multiplier,
                'skipped' => false,
                'imported' => false,
                'force_update' => $force_update,
            ];

            if (!$item['id_product_attribute']) {
                $item['skipped'] = true;
            }

            $isStockService = $this->isStockService($id_product);
            $item['is_stock_service'] = $isStockService;

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

    private function getIdProductAttributeByEan13($ean13, &$id_product)
    {
        $id_product = 0;
        $db = \Db::getInstance();
        $query = new \DbQuery();
        $query
            ->select('id_product, id_product_attribute')
            ->from('product_attribute')
            ->where('ean13 = "' . $ean13 . '"');
        $result = $db->getRow($query);
        if ($result) {
            $id_product = $result['id_product'];
            return $result['id_product_attribute'];
        }

        return false;
    }

    private function isStockService($id_product)
    {
        $db = \Db::getInstance();
        $query = new \DbQuery();
        $query
            ->select('is_stock_service')
            ->from('product_stock_service_check')
            ->where('id_product = ' . (int) $id_product);
        $result = (int) $db->getValue($query);

        return $result;
    }

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
}
