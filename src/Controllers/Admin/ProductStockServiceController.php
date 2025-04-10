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

namespace MpSoft\MpStockService\Controllers\Admin;

require_once _PS_MODULE_DIR_ . 'mpstockservice/models/autoload.php';

use MpSoft\MpStockService\Helpers\ProductUtils;
use PrestaShop\PrestaShop\Adapter\LegacyContext;
use PrestaShopBundle\Controller\Admin\FrameworkBundleAdminController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class ProductStockServiceController extends FrameworkBundleAdminController
{
    /**
     * @var LegacyContext
     */
    private $legacyContext;

    /**
     * @var \Module
     */
    private $module;

    /**
     * @var int
     */
    private $id_lang;

    /**
     * Constructor
     *
     * @param LegacyContext $legacyContext
     */
    public function __construct(LegacyContext $legacyContext)
    {
        $this->legacyContext = $legacyContext;
        $this->module = \Module::getInstanceByName('mpstockservice');
        $this->id_lang = (int) $this->legacyContext->getContext()->language->id;
    }

    /**
     * Toggle is_stock_service status for a product
     * 
     * @Route("/mpstockservice/{id_product}/toggle-is-checked", name="mpstockservice_toggle_is_checked", methods={"POST"})
     * 
     * @param int $id_product Product ID
     * 
     * @return Response
     */
    public function toggleIsCheckedAction($id_product)
    {
        $result = false;
        // Recupera il record attuale o ne crea uno nuovo
        $record = new \ModelMpStockServiceCheck($id_product);
        $exists = \Validate::isLoadedObject($record);

        // Imposta i valori necessari
        $record->id_product = (int) $id_product;
        $record->id_employee = (int) $this->legacyContext->getContext()->employee->id;
        $record->date_upd = date('Y-m-d H:i:s');

        // Inverti il valore di is_stock_service
        if ($exists) {
            $record->is_stock_service = !$record->is_stock_service;
            $result = $record->update();
        } else {
            $record->force_id = true;
            $record->id = $id_product;
            $record->is_stock_service = 1; // Se è un nuovo record, imposta a 1 (checked)
            $result = $record->add();
        }

        if ($result) {
            $this->setStockServiceCombinations($id_product);
        }

        // Restituisci una risposta JSON per la ToggleColumn
        return $this->json([
            'status' => true,
            'message' => 'Stock service status updated successfully',
        ]);
    }

    /**
     * Set stock service option for a product
     * 
     * @Route("/mpstockservice/{id_product}set-stock-service", name="mpstockservice_set_stock_service", methods={"POST"})
     * 
     * @param int $id_product Product ID
     * 
     * @return Response
     */
    public function toggleStockServiceAction($id_product)
    {
        $productUtils = new ProductUtils($this->module);

        if (!$id_product) {
            return $this->json([
                'result' => false,
                'message' => 'ID prodotto non valido',
            ]);
        }

        $product = new \Product($id_product, false, $this->id_lang);
        if (!\Validate::isLoadedObject($product)) {
            return $this->json([
                'result' => false,
                'message' => 'ID prodotto non valido',
            ]);
        }
        // Recupera il record attuale o ne crea uno nuovo
        $record = new \ModelMpStockServiceCheck($id_product);
        $exists = \Validate::isLoadedObject($record);

        // Imposta i valori necessari
        $record->id_product = $id_product;
        $record->id_employee = (int) $this->legacyContext->getContext()->employee->id;
        $record->date_upd = date('Y-m-d H:i:s');

        if ($exists) {
            $record->is_stock_service = !$record->is_stock_service;
            $record->id_employee = (int) $this->legacyContext->getContext()->employee->id;
            $result = $record->update();
        } else {
            $record->force_id = true;
            $record->id = $id_product;
            $record->is_stock_service = 1; // Se è un nuovo record, imposta a 1 (checked)
            $record->id_employee = (int) $this->legacyContext->getContext()->employee->id;
            $result = $record->add();
        }

        if ($result) {
            // Aggiungo tutte le combinazioni del prodotto se non esistono già
            $combinations = $productUtils->getCombinations($product);
            foreach ($combinations as $combination) {
                $model = new \ModelMpStockService();
                $model->id = $combination['id_product_attribute'];
                $model->id_product = $product->id;
                $model->hydrate($combination);

                if (\Validate::isLoadedObject($model)) {
                    $model->force_id = true;
                    $model->add();
                } else {
                    $model->update();
                }
            }
        }

        return $this->json([
            'result' => (bool) $result,
            'message' => $result ? 'Opzione Stock Service aggiornata con successo' : 'Errore durante l\'aggiornamento',
        ]);
    }

    public function setStockServiceCombinations($id_product)
    {
        $productUtils = new ProductUtils($this->module);
        $product = new \Product($id_product, false, $this->id_lang);
        if (!\Validate::isLoadedObject($product)) {
            return;
        }
        $combinations = $productUtils->getCombinations($product);
        foreach ($combinations as $combination) {
            $model = new \ModelMpStockService();
            if (\Validate::isLoadedObject($model)) {
                $model->force_id = true;
                $model->id = $combination['id_product_attribute'];
                $model->id_product = $product->id;
                $model->hydrate($combination);
                $model->add();
            } else {
                $model->hydrate($combination);
                $model->update();
            }
        }
    }

    public function updateStockServiceAction($id_product)
    {
        $rows = \Tools::getValue('rows');
        if ($rows) {
            $rows = json_decode($rows, true);
        }

        if ($rows) {
            foreach ($rows as $row) {
                $id = (int) $row['id_product_attribute'];
                if (!$id) {
                    continue;
                }
                $model = new \ModelMpStockService($id);
                $model->id_product = $id_product;
                $total = (int) $model->quantity;
                $variation = (int) $row['quantity'];
                $model->hydrate($row);
                $model->quantity = $total + $variation;
                if (!\Validate::isLoadedObject($model)) {
                    $model->force_id = true;
                    $model->id = $id;
                    $model->add();
                } else {
                    $model->update();
                }
            }
        }

        return $this->json([
            'result' => true,
            'message' => 'Opzione Stock Service aggiornata con successo',
            'rows' => $rows,
            'id_product' => $id_product,
        ]);
    }
}
