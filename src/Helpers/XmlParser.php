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
     * Costruttore
     *
     * @param string $xmlContent Il contenuto del file XML o il percorso al file
     * @param bool $isFile Indica se $xmlContent è un percorso file o una stringa XML
     */
    public function __construct($xmlContent, $isFile = false)
    {
        if ($isFile) {
            if (!file_exists($xmlContent)) {
                throw new \Exception("Il file XML non esiste: $xmlContent");
            }
            $this->xmlContent = file_get_contents($xmlContent);
        } else {
            $this->xmlContent = $xmlContent;
        }

        $this->loadXml();
    }

    /**
     * Carica il contenuto XML in un oggetto SimpleXMLElement
     *
     * @throws \Exception Se il parsing XML fallisce
     */
    private function loadXml()
    {
        libxml_use_internal_errors(true);
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
    public function extractRowData()
    {
        $result = [];

        if (!isset($this->xml->rows->row)) {
            return $result;
        }

        foreach ($this->xml->rows->row as $row) {
            $ean13 = (string) $row->ean13;
            $reference = (string) $row->reference;
            $qty = (int) $row->qty;

            $result[] = [
                'ean13' => $ean13,
                'reference' => $reference,
                'quantity' => $qty,
            ];
        }

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
    public function getAllData()
    {
        return [
            'movement_type' => $this->getMovementType(),
            'movement_date' => $this->getMovementDate(),
            'rows' => $this->extractRowData(),
        ];
    }
}
