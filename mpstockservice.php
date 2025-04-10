<?php

use Doctrine\ORM\QueryBuilder;
use MpSoft\MpStockService\Helpers\ProductUtils;
use MpSoft\MpStockService\Install\InstallMenu;
use MpSoft\MpStockService\Install\TableGenerator;

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
if (!defined('_PS_VERSION_')) {
    exit;
}

require_once _PS_MODULE_DIR_ . 'mpstockservice/vendor/autoload.php';
require_once _PS_MODULE_DIR_ . 'mpstockservice/models/autoload.php';

use PrestaShop\PrestaShop\Core\Grid\Column\Type\Common\ToggleColumn;
use PrestaShop\PrestaShop\Core\Grid\Definition\GridDefinitionInterface;
use PrestaShop\PrestaShop\Core\Grid\Filter\Filter;
use PrestaShop\PrestaShop\Core\Search\Filters;
use PrestaShopBundle\Form\Admin\Type\YesAndNoChoiceType;

class MpStockService extends Module
{
    protected $adminClassName;
    protected $id_lang;
    protected $id_shop;
    protected $id_employee;
    protected $db;

    public function __construct()
    {
        $this->name = 'mpstockservice';
        $this->tab = 'administration';
        $this->version = '1.2.0';
        $this->author = 'Massimiliano Palermo';
        $this->need_instance = 0;
        $this->ps_versions_compliancy = ['min' => '8.0', 'max' => _PS_VERSION_];
        $this->bootstrap = true;

        parent::__construct();

        $this->adminClassName = 'AdminMpStockService';
        $this->displayName = $this->l('MP Stock Service');
        $this->description = $this->l('Manage products in stock service');
        $this->confirmUninstall = $this->l('Are you sure you want to uninstall?');
        $this->context = Context::getContext();
        $this->smarty = $this->context->smarty;
        $this->id_lang = (int) $this->context->language->id;
        $this->id_shop = (int) $this->context->shop->id;
        if (isset($this->context->employee)) {
            $this->id_employee = (int) $this->context->employee->id;
        } else {
            $this->id_employee = 0;
        }
        $this->db = Db::getInstance();
    }

    public function install()
    {
        $menuInstaller = new InstallMenu($this);
        $tableInstaller = new TableGenerator($this);

        if (Shop::isFeatureActive()) {
            Shop::setContext(ShopCore::CONTEXT_ALL);
        }

        return parent::install()
            && $this->registerHook([
                'actionAdminControllerSetMedia',
                'actionProductGridDefinitionModifier',
                'actionProductGridQueryBuilderModifier',
                'displayAdminProductsExtra',
                'displayProductExtraContent',
            ])
            && $tableInstaller->createTable(ModelMpStockService::$definition)
            && $tableInstaller->createTable(ModelMpStockServiceCheck::$definition)
            && $menuInstaller->installMenu(
                $this->adminClassName,
                $this->l('Admin Stock Service'),
                'AdminCatalog',
                $this->name,
            );
    }

    public function uninstall()
    {
        $menuInstaller = new InstallMenu($this);

        return parent::uninstall()
            && $menuInstaller->uninstallMenu($this->adminClassName);
    }

    /**
     * Define the routes used by the module
     *
     * @return array
     */
    public function getRoutes()
    {
        return [
            'mpstockservice_toggle_is_checked' => [
                'path' => 'mpstockservice/{id_product}/toggle-is-checked',
                'methods' => ['POST'],
                'defaults' => [
                    '_controller' => 'MpSoft\\MpStockService\\Controllers\\Admin\\ProductStockServiceController::toggleIsCheckedAction',
                ],
                'requirements' => [
                    'id_product' => '\\d+',
                ],
            ],
        ];
    }

    public function hookActionAdminControllerSetMedia($params)
    {
        $controller = Tools::getValue('controller');
        if (preg_match('/^AdminProduct/i', $controller)) {
            $jsPath = $this->getLocalPath() . 'views/js';
            $cssPath = $this->getLocalPath() . 'views/css';
            $this->context->controller->addCSS([
                $cssPath . '/icons.css',
                $cssPath . '/vertical-menu.css',
                $jsPath . '/tippy/scale.css',
                $cssPath . '/file.css',
                $cssPath . '/select2.min.css',
                $cssPath . '/StockServiceTable.css',
            ], 'all', 9999);
            $this->context->controller->addJS([
                $jsPath . '/swal2/sweetalert2.all.min.js',
                $jsPath . '/tippy/popper-core2.js',
                $jsPath . '/tippy/tippy.js',
                $jsPath . '/select2.min.js',
            ]);
        }
    }

    public function hookDisplayAdminProductsExtra($params)
    {
        $productUtils = new ProductUtils($this);
        $controller = new MpSoft\MpStockService\Hooks\MpStockServiceHookController($this);
        $id_product = (int) $params['id_product'];
        $product = new Product($id_product, false, $this->id_lang);
        if (Validate::isLoadedObject($product)) {
            $combinations = $productUtils->getCombinations($product);
            $controller->setCombinations($combinations);
            $controller->toggleStockService($combinations[0]['is_stock_service'] ?? 0);
        }

        return $controller->display(false);
    }

    public function hookDisplayProductExtraContent($params)
    {
        /** @var ProductUtils */
        $productUtils = new ProductUtils($this);
        /** @var Product */
        $product = $params['product'];
        $db = $this->db;
        $sql = sprintf(
            "SELECT a.is_stock_service, CONCAT(c.firstname, ' ', c.lastname) as employee, a.date_upd FROM %s a LEFT JOIN %s c ON a.id_employee = c.id_employee WHERE a.id_product = %d",
            _DB_PREFIX_ . ModelMpStockServiceCheck::$definition['table'],
            _DB_PREFIX_ . 'employee',
            (int) $product->id
        );
        $row = $db->getRow($sql);
        if (!$row) {
            $row = [
                'is_stock_service' => 0,
                'employee_name' => '--',
                'date_upd' => '',
            ];
        }

        $tpl = $this->context->smarty->createTemplate($this->getLocalPath() . 'views/templates/hook/displayPanelQuantityCheck.tpl');

        $tpl->assign(
            [
                'link' => $this->context->link,
                'actionSetStockServiceUrl' => $this->getActionUrl($this->adminClassName, 'setStockService'),
                'product' => $product,
                'combinations' => $productUtils->getCombinations($product),
                'checkProduct' => $row,
            ]
        );

        return $tpl->fetch();
    }

    public function hookActionProductGridDefinitionModifier(array $params)
    {
        /** @var GridDefinitionInterface $definition */
        $definition = $params['definition'];

        // Aggiungi la colonna is_stock_service come ToggleColumn
        $definition
            ->getColumns()
            ->addAfter(
                'quantity',
                (new ToggleColumn('is_stock_service'))
                    ->setName($this->trans('Stock Service', [], 'Modules.Mpstockservice.Admin'))
                    ->setOptions([
                        'field' => 'is_stock_service',
                        'primary_field' => 'id_product',
                        'route' => 'mpstockservice_toggle_is_stock_service',
                        'route_param_name' => 'id_product',
                    ])
            );

        // Nota: Per aggiungere un divider nelle bulk actions, si può utilizzare la sintassi corretta in un secondo momento

        // Aggiungi il filtro per is_stock_service
        $definition->getFilters()->add(
            (new Filter('is_stock_service', YesAndNoChoiceType::class))
                ->setAssociatedColumn('is_stock_service')
        );
    }

    public function hookActionProductGridQueryBuilderModifier(array $params)
    {
        /** @var QueryBuilder $queryBuilder */
        $queryBuilder = $params['search_query_builder'];
        /** @var Filters $searchCriteria */
        $searchCriteria = $params['search_criteria'];

        // Aggiungi la colonna is_stock_service alla query
        $StockServiceTable = _DB_PREFIX_ . ModelMpStockServiceCheck::$definition['table'];
        $queryBuilder->addSelect('COALESCE(ss.is_stock_service, 0) as is_stock_service');
        $queryBuilder->leftJoin('p', $StockServiceTable, 'ss', 'p.id_product = ss.id_product');

        // Gestisci il filtro per is_stock_service
        foreach ($searchCriteria->getFilters() as $filterName => $filterValue) {
            if ($filterName == 'is_stock_service' && $filterValue !== '') {
                $queryBuilder->andWhere('COALESCE(ss.is_stock_service, 0) = :is_stock_service');
                $queryBuilder->setParameter('is_stock_service', $filterValue);
            }
        }
    }
}
