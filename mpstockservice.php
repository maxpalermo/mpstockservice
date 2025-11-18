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
if (!defined('_PS_VERSION_')) {
    exit;
}

require_once _PS_MODULE_DIR_ . 'mpstockservice/vendor/autoload.php';

use Doctrine\DBAL\Query\QueryBuilder;
use MpSoft\MpStockService\Helpers\GetTwigEnvironment;
use MpSoft\MpStockService\Helpers\ProductUtils;
use MpSoft\MpStockService\Install\InstallMenu;
use MpSoft\MpStockService\Models\ModelMpStockService;
use MpSoft\MpStockService\Models\ModelMpStockServiceCheck;
use PrestaShop\PrestaShop\Core\Grid\Column\Type\Common\ToggleColumn;
use PrestaShop\PrestaShop\Core\Grid\Definition\GridDefinitionInterface;
use PrestaShop\PrestaShop\Core\Grid\Filter\Filter;
use PrestaShop\PrestaShop\Core\Module\WidgetInterface;
use PrestaShop\PrestaShop\Core\Search\Filters;
use PrestaShopBundle\Form\Admin\Type\YesAndNoChoiceType;

class MpStockService extends Module implements WidgetInterface
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
        $this->version = '1.3.1';
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

        if (Shop::isFeatureActive()) {
            Shop::setContext(ShopCore::CONTEXT_ALL);
        }

        return parent::install() &&
            $this->registerHook([
                'actionAdminControllerSetMedia',
                'actionProductGridDefinitionModifier',
                'actionProductGridQueryBuilderModifier',
                'displayAdminProductsExtra',
                'displayProductExtraContent',
            ]) &&
            ModelMpStockService::install() &&
            ModelMpStockServiceCheck::install() &&
            $menuInstaller->installMenu(
                $this->adminClassName,
                $this->l('Admin Stock Service'),
                'AdminCatalog',
                $this->name,
            );
    }

    public function uninstall()
    {
        $menuInstaller = new InstallMenu($this);

        return parent::uninstall() &&
            $menuInstaller->uninstallMenu($this->adminClassName);
    }

    public function getWidgetVariables($hookName, array $configuration)
    {
        return [];
    }

    public function renderWidget($hookName, array $configuration)
    {
        switch ($hookName) {
            case 'actionAdminControllerSetMedia':
                break;
            case 'displayAdminProductsExtra':
                $controller = Tools::getValue('controller');
                $twig = new GetTwigEnvironment($this->name);
                $template = $twig->load('@ModuleTwig/hooks/displayProductExtra.html.twig');
                $id_product = (int) $configuration['id_product'];
                $variables = [
                    'id_product' => $id_product,
                    'suppliers' => json_encode(Supplier::getSuppliers()),
                    'controller' => $controller,
                    'adminControllerUrl' => $this->context->link->getAdminLink('AdminMpStockService'),
                    'isStockService' => (int) ModelMpStockServiceCheck::isStockService($id_product),
                    'combinations' => json_encode(ModelMpStockService::getStockServiceByProduct($id_product)),
                ];
                return $template->render($variables);

            default:
                return '';
        }
    }

    public function hookActionAdminControllerSetMedia($params)
    {
        $controller = Tools::getValue('controller');
        if (preg_match('/^AdminProduct/i', $controller)) {
            $cssPath = $this->getLocalPath() . 'views/css';
            $this->context->controller->addCSS([
                $cssPath . '/icons.css',
            ], 'all', 9999);
        }
    }

    public function hook_DisplayAdminProductsExtra($params)
    {
        $id_product = (int) $params['id_product'];
        $productUtils = new ProductUtils($this);
        $controller = new MpSoft\MpStockService\Hooks\MpStockServiceHookController($this);
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
        // Nothing
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

                // Modifica anche la query di conteggio
                $countQueryBuilder = $params['count_query_builder'] ?? null;
                // Applica lo stesso filtro alla query di conteggio
                if ($countQueryBuilder !== null) {
                    $countQueryBuilder->andWhere('COALESCE(ss.is_stock_service, 0) = :is_stock_service');
                    $countQueryBuilder->setParameter('is_stock_service', $filterValue);
                }
            }
        }
    }
}
