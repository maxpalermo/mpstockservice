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
 *
 * @update    2024-01-15
 */

namespace MpSoft\MpStockService\Helpers;
if (!defined('_PS_VERSION_')) {
    exit;
}

class InstallHelper
{
    const HIDDEN = -1;
    const ROOT = 0;
    const ADMINDASHBOARD = 'AdminDashboard';
    const SELL = 'SELL';
    const ADMINPARENTORDERS = 'AdminParentOrders';
    const ADMINORDERS = 'AdminOrders';
    const ADMININVOICES = 'AdminInvoices';
    const ADMINSLIP = 'AdminSlip';
    const ADMINDELIVERYSLIP = 'AdminDeliverySlip';
    const ADMINCARTS = 'AdminCarts';
    const ADMINCATALOG = 'AdminCatalog';
    const ADMINPRODUCTS = 'AdminProducts';
    const ADMINCATEGORIES = 'AdminCategories';
    const ADMINTRACKING = 'AdminTracking';
    const ADMINPARENTATTRIBUTESGROUPS = 'AdminParentAttributesGroups';
    const ADMINATTRIBUTESGROUPS = 'AdminAttributesGroups';
    const ADMINFEATURES = 'AdminFeatures';
    const ADMINPARENTMANUFACTURERS = 'AdminParentManufacturers';
    const ADMINMANUFACTURERS = 'AdminManufacturers';
    const ADMINSUPPLIERS = 'AdminSuppliers';
    const ADMINATTACHMENTS = 'AdminAttachments';
    const ADMINPARENTCARTRULES = 'AdminParentCartRules';
    const ADMINCARTRULES = 'AdminCartRules';
    const ADMINSPECIFICPRICERULE = 'AdminSpecificPriceRule';
    const ADMINSTOCKMANAGEMENT = 'AdminStockManagement';
    const ADMINPARENTCUSTOMER = 'AdminParentCustomer';
    const ADMINCUSTOMERS = 'AdminCustomers';
    const ADMINADDRESSES = 'AdminAddresses';
    const ADMINOUTSTANDING = 'AdminOutstanding';
    const ADMINPARENTCUSTOMERTHREADS = 'AdminParentCustomerThreads';
    const ADMINCUSTOMERTHREADS = 'AdminCustomerThreads';
    const ADMINORDERMESSAGE = 'AdminOrderMessage';
    const ADMINRETURN = 'AdminReturn';
    const ADMINSTATS = 'AdminStats';
    const ADMINSTOCK = 'AdminStock';
    const ADMINWAREHOUSES = 'AdminWarehouses';
    const ADMINPARENTSTOCKMANAGEMENT = 'AdminParentStockManagement';
    const ADMINSTOCKMVT = 'AdminStockMvt';
    const ADMINSTOCKINSTANTSTATE = 'AdminStockInstantState';
    const ADMINSTOCKCOVER = 'AdminStockCover';
    const ADMINSUPPLYORDERS = 'AdminSupplyOrders';
    const ADMINSTOCKCONFIGURATION = 'AdminStockConfiguration';
    const IMPROVE = 'IMPROVE';
    const ADMINPARENTMODULESSF = 'AdminParentModulesSf';
    const ADMINMODULESSF = 'AdminModulesSf';
    const ADMINMODULESMANAGE = 'AdminModulesManage';
    const ADMINMODULESNOTIFICATIONS = 'AdminModulesNotifications';
    const ADMINMODULESUPDATES = 'AdminModulesUpdates';
    const ADMINPARENTMODULESCATALOG = 'AdminParentModulesCatalog';
    const ADMINMODULESCATALOG = 'AdminModulesCatalog';
    const ADMINADDONSCATALOG = 'AdminAddonsCatalog';
    const ADMINMODULES = 'AdminModules';
    const ADMINPARENTTHEMES = 'AdminParentThemes';
    const ADMINTHEMES = 'AdminThemes';
    const ADMINTHEMESCATALOG = 'AdminThemesCatalog';
    const ADMINPARENTMAILTHEME = 'AdminParentMailTheme';
    const ADMINMAILTHEME = 'AdminMailTheme';
    const ADMINCMSCONTENT = 'AdminCmsContent';
    const ADMINMODULESPOSITIONS = 'AdminModulesPositions';
    const ADMINIMAGES = 'AdminImages';
    const ADMINPARENTSHIPPING = 'AdminParentShipping';
    const ADMINCARRIERS = 'AdminCarriers';
    const ADMINSHIPPING = 'AdminShipping';
    const ADMINPARENTPAYMENT = 'AdminParentPayment';
    const ADMINPAYMENT = 'AdminPayment';
    const ADMINPAYMENTPREFERENCES = 'AdminPaymentPreferences';
    const ADMININTERNATIONAL = 'AdminInternational';
    const ADMINPARENTLOCALIZATION = 'AdminParentLocalization';
    const ADMINLOCALIZATION = 'AdminLocalization';
    const ADMINLANGUAGES = 'AdminLanguages';
    const ADMINCURRENCIES = 'AdminCurrencies';
    const ADMINGEOLOCATION = 'AdminGeolocation';
    const ADMINPARENTCOUNTRIES = 'AdminParentCountries';
    const ADMINZONES = 'AdminZones';
    const ADMINCOUNTRIES = 'AdminCountries';
    const ADMINSTATES = 'AdminStates';
    const ADMINPARENTTAXES = 'AdminParentTaxes';
    const ADMINTAXES = 'AdminTaxes';
    const ADMINTAXRULESGROUP = 'AdminTaxRulesGroup';
    const ADMINTRANSLATIONS = 'AdminTranslations';
    const CONFIGURE = 'CONFIGURE';
    const SHOPPARAMETERS = 'ShopParameters';
    const ADMINPARENTPREFERENCES = 'AdminParentPreferences';
    const ADMINPREFERENCES = 'AdminPreferences';
    const ADMINMAINTENANCE = 'AdminMaintenance';
    const ADMINPARENTORDERPREFERENCES = 'AdminParentOrderPreferences';
    const ADMINORDERPREFERENCES = 'AdminOrderPreferences';
    const ADMINSTATUSES = 'AdminStatuses';
    const ADMINPPREFERENCES = 'AdminPPreferences';
    const ADMINPARENTCUSTOMERPREFERENCES = 'AdminParentCustomerPreferences';
    const ADMINCUSTOMERPREFERENCES = 'AdminCustomerPreferences';
    const ADMINGROUPS = 'AdminGroups';
    const ADMINGENDERS = 'AdminGenders';
    const ADMINPARENTSTORES = 'AdminParentStores';
    const ADMINCONTACTS = 'AdminContacts';
    const ADMINSTORES = 'AdminStores';
    const ADMINPARENTMETA = 'AdminParentMeta';
    const ADMINMETA = 'AdminMeta';
    const ADMINSEARCHENGINES = 'AdminSearchEngines';
    const ADMINREFERRERS = 'AdminReferrers';
    const ADMINPARENTSEARCHCONF = 'AdminParentSearchConf';
    const ADMINSEARCHCONF = 'AdminSearchConf';
    const ADMINTAGS = 'AdminTags';
    const ADMINADVANCEDPARAMETERS = 'AdminAdvancedParameters';
    const ADMININFORMATION = 'AdminInformation';
    const ADMINPERFORMANCE = 'AdminPerformance';
    const ADMINADMINPREFERENCES = 'AdminAdminPreferences';
    const ADMINEMAILS = 'AdminEmails';
    const ADMINIMPORT = 'AdminImport';
    const ADMINPARENTEMPLOYEES = 'AdminParentEmployees';
    const ADMINEMPLOYEES = 'AdminEmployees';
    const ADMINPROFILES = 'AdminProfiles';
    const ADMINACCESS = 'AdminAccess';
    const ADMINPARENTREQUESTSQL = 'AdminParentRequestSql';
    const ADMINREQUESTSQL = 'AdminRequestSql';
    const ADMINBACKUP = 'AdminBackup';
    const ADMINLOGS = 'AdminLogs';
    const ADMINWEBSERVICE = 'AdminWebservice';
    const ADMINSHOPGROUP = 'AdminShopGroup';
    const ADMINSHOPURL = 'AdminShopUrl';
    const ADMINFEATUREFLAG = 'AdminFeatureFlag';
    const ADMINQUICKACCESSES = 'AdminQuickAccesses';
    const DEFAULT = 'DEFAULT';
    const ADMINPATTERNS = 'AdminPatterns';
    const WISHLISTCONFIGURATIONADMINPARENTCONTROLLER = 'WishlistConfigurationAdminParentController';
    const WISHLISTCONFIGURATIONADMINCONTROLLER = 'WishlistConfigurationAdminController';
    const WISHLISTSTATISTICSADMINCONTROLLER = 'WishlistStatisticsAdminController';
    const ADMINDASHGOALS = 'AdminDashgoals';
    const ADMINCONFIGUREFAVICONBO = 'AdminConfigureFaviconBo';
    const ADMINLINKWIDGET = 'AdminLinkWidget';
    const ADMINTHEMESPARENT = 'AdminThemesParent';
    const ADMINPSTHEMECUSTOCONFIGURATION = 'AdminPsThemeCustoConfiguration';
    const ADMINPSTHEMECUSTOADVANCED = 'AdminPsThemeCustoAdvanced';
    const ADMINWELCOME = 'AdminWelcome';
    const ADMINGAMIFICATION = 'AdminGamification';
    const ADMINAJAXPSGDPR = 'AdminAjaxPsgdpr';
    const ADMINDOWNLOADINVOICESPSGDPR = 'AdminDownloadInvoicesPsgdpr';
    const ADMINPSMBOMODULE = 'AdminPsMboModule';
    const ADMINPSMBOADDONS = 'AdminPsMboAddons';
    const ADMINPSMBORECOMMENDED = 'AdminPsMboRecommended';
    const ADMINPSMBOTHEME = 'AdminPsMboTheme';
    const ADMINAJAXPS_BUYBUTTONLITE = 'AdminAjaxPs_buybuttonlite';
    const ADMINMETRICSLEGACYSTATSCONTROLLER = 'AdminMetricsLegacyStatsController';
    const ADMINMETRICSCONTROLLER = 'AdminMetricsController';
    const MARKETING = 'Marketing';
    const ADMINPSFACEBOOKMODULE = 'AdminPsfacebookModule';
    const ADMINAJAXPSFACEBOOK = 'AdminAjaxPsfacebook';
    const ADMINPSXMKTGWITHGOOGLEMODULE = 'AdminPsxMktgWithGoogleModule';
    const ADMINAJAXPSXMKTGWITHGOOGLE = 'AdminAjaxPsxMktgWithGoogle';
    const ADMINBLOCKLISTING = 'AdminBlockListing';
    const ADMINSELFUPGRADE = 'AdminSelfUpgrade';
    const ADMINETSEMMIGRATE = 'AdminETSEMMigrate';
    const ADMINETSEMDOWNLOAD = 'AdminETSEMDownload';

    /**
     * Install a new menu
     *
     * @param string $name Tab name
     * @param string $module_name Module name
     * @param string $parent Parent tab name
     * @param string $controller Controller class name
     * @param string $icon Material Icon name
     * @param string $wording Wording type
     * @param string $wording_domain Wording domain
     * @param bool $active If true, Tab menu will be shown
     * @param bool $enabled If true Tab menu is enabled
     *
     * @return bool True if successful, False otherwise
     */
    public function installMenu(
        string $name,
        string $module_name,
        string $parent,
        string $controller,
        bool $active = true
    ) {
        // Create new admin tab
        $tab = new \Tab();

        if ($parent != static::HIDDEN) {
            $id_parent = \Tab::getIdFromClassName($parent);
            $tab->id_parent = (int) $id_parent;
        } else {
            $tab->id_parent = -1;
        }
        $tab->name = [];

        if (!is_array($name)) {
            foreach (\Language::getLanguages(true) as $lang) {
                $tab->name[$lang['id_lang']] = $name;
            }
        } else {
            foreach ($name as $name_lang) {
                $tab->name[$name_lang['id_lang']] = $name_lang['name'];
            }
        }

        $tab->class_name = $controller;
        $tab->module = $module_name;
        $tab->active = $active;
        $result = $tab->add();

        return $result;
    }

    /**
     * Uninstall a menu
     *
     * @param string|array $className Class name of the controller
     *
     * @return bool True if successful, False otherwise
     */
    public function uninstallMenu($className)
    {
        $result = true;
        if (is_array($className)) {
            foreach ($className as $menu) {
                $result = $result && $this->uninstallTab($menu);
            }
        } else {
            $result = $this->uninstallTab($className);
        }

        return $result;
    }

    private function uninstallTab($className)
    {
        $id_tab = \Tab::getIdFromClassName($className);
        if ($id_tab) {
            $tab = new \Tab((int) $id_tab);

            return $tab->delete();
        }

        return true;
    }

    public static function insertValueAtPosition($arr, $insertedArray, $position)
    {
        $i = 0;
        $new_array = [];
        foreach ($arr as $key => $value) {
            if ($i == $position) {
                foreach ($insertedArray as $ikey => $ivalue) {
                    $new_array[$ikey] = $ivalue;
                }
            }
            $new_array[$key] = $value;
            ++$i;
        }

        return $new_array;
    }

    public function registerHooks(\Module $module, Array $hooks)
    {
        foreach ($hooks as $hook) {
            if (!$module->registerHook($hook)) {
                return false;
            };
        }

        return true;
    }

    public function createTable($definition)
    {
        $sql = $this->createSQL($definition);
        if (isset($definition['multilang']) && $definition['multilang']) {
            $sql .= $this->createSQL($definition, true);
        }

        try {
            return \Db::getInstance()->execute($sql);
        } catch (\Throwable $th) {
            throw new \Exception($th->getMessage(), $th->getCode());
        }
    }

    public function executeSql($sql)
    {
        try {
            return \Db::getInstance()->execute($sql);
        } catch (\Throwable $th) {
            throw new \Exception($th->getMessage(), $th->getCode());
        }
    }

    /**
     * Create Sql Table from Prestashop ObjectModel Definition
     * add 'datetime' to definition field to set as DATETIME,
     * add 'price' to definition field to set as DECIMAL(20,6),
     * add 'enum' to definition field to set as ENUM, the enum must contains all enum values,
     * add 'text' to definition field to set as TEXT, it can depend by 'size' property,
     * add 'fixed' to definition field to set as CHAR, it can depend by 'size' property,
     * add 'default_value' to definition field to set DEFAULT in NULL fields,
     * add 'comment' to definition field to set COMMENT, 'comment' must contains the field comment
     *
     * @return string Sql create table
     */
    public function createSQL($definition, $lang = false)
    {
        $tableName = _DB_PREFIX_ . $definition['table'];
        $primary = $definition['primary'];

        if ($lang) {
            $fields = [
                "`{$primary}` INT NOT NULL",
                '`id_lang` INT NOT NULL',
            ];
            $tableName .= '_lang';
        } else {
            $fields = [
                "`{$primary}` INT NOT NULL AUTO_INCREMENT",
            ];
        }

        foreach ($definition['fields'] as $key => $field) {
            $langField = isset($field['lang']) && $field['lang'];
            if ($lang && !$langField) {
                continue;
            }
            if (!$lang && $langField) {
                continue;
            }

            switch ($field['type']) {
                case \ObjectModel::TYPE_BOOL:
                    $fields[] = self::generateField($key, $field, 'TINYINT(1)');

                    break;
                case \ObjectModel::TYPE_DATE:
                    if (isset($field['day']) && $field['day']) {
                        $fields[] = self::generateField($key, $field, 'DATE');
                    } else {
                        $fields[] = self::generateField($key, $field, 'DATETIME');
                    }

                    break;
                case \ObjectModel::TYPE_FLOAT:
                    $fields[] = self::generateField($key, $field, 'FLOAT');

                    break;
                case \ObjectModel::TYPE_HTML:
                    $fields[] = self::generateField($key, $field, 'TEXT');

                    break;
                case \ObjectModel::TYPE_INT:
                    $fields[] = self::generateField($key, $field, 'INT(11)');

                    break;
                case \ObjectModel::TYPE_NOTHING:
                    break;
                case \ObjectModel::TYPE_SQL:
                    break;
                case \ObjectModel::TYPE_STRING:
                    $size = (isset($field['size']) && $field['size']) ? (int) $field['size'] : 255;
                    if ($size > 255) {
                        $type = 'TEXT';
                    } else {
                        $type = "VARCHAR({$size})";
                    }
                    $fields[] = self::generateField($key, $field, $type);

                    break;
                default:
            }
        }

        $fields[] = "PRIMARY KEY (`{$primary}`)";

        $sql = "CREATE TABLE IF NOT EXISTS `{$tableName}` (" . implode(',', $fields) . ') ENGINE=InnoDB;';

        return $sql;
    }

    protected static function generateField($key, $field, $type)
    {
        if ($key == 'date_add') {
            $value = '`date_add` DATETIME NOT NULL ';
        } elseif ($key == 'date_upd') {
            $value = '`date_upd` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ';
        } else {
            $value = "`{$key}` {$type} ";
            if (isset($field['required']) && $field['required']) {
                $value .= ' NOT NULL ';
            } else {
                $value .= ' NULL ';
            }
            if (isset($field['default']) && $field['default']) {
                $value .= " DEFAULT '{$field['default']}' ";
            }
        }

        return $value;
    }

    public static function createIndex($table, $fields, $name, $type = 'UNIQUE')
    {
        if (!preg_match('/^' . _DB_PREFIX_, $table)) {
            $table = _DB_PREFIX_ . $table;
        }
        if (is_array($fields)) {
            $fields = implode(',', $fields);
        }

        $sql = "CREATE {$type} INDEX {$name} ON {$table} ({$fields})";
        $res = false;

        try {
            $res = \Db::getInstance()->execute($sql);
        } catch (\Throwable $th) {
            return $th->getMessage();
        }

        return $res;
    }

    public static function dropIndex($table, $name = '`PRIMARY`')
    {
        if (!preg_match('/^' . _DB_PREFIX_, $table)) {
            $table = _DB_PREFIX_ . $table;
        }
        $sql = "DROP INDEX {$name} ON {$table};";
        $res = false;

        try {
            $res = \Db::getInstance()->execute($sql);
        } catch (\Throwable $th) {
            return $th->getMessage();
        }

        return $res;
    }

    public static function renameIndex($table, $oldName, $newName)
    {
    }

    public static function alterColumn($table, $field, $type)
    {
        if (!preg_match('/^' . _DB_PREFIX_, $table)) {
            $table = _DB_PREFIX_ . $table;
        }
        $res = false;
        $sql = "ALTER TABLE {$table} modify {$field} {$type};";

        try {
            $res = \Db::getInstance()->execute($sql);
        } catch (\Throwable $th) {
            return $th->getMessage();
        }

        return $res;
    }

    public function addSelect(&$select, $field)
    {
        if (!preg_match('/,$/i', $select)) {
            $select .= ',';
        }

        $select .= $field;
    }

    public function addJoin(&$join, $item)
    {
        $item = str_replace('{PFX}', _DB_PREFIX_, $item);
        $join .= ' ' . $item;
    }

    public function addWhere($where, $item)
    {
        $where .= ' AND ' . $item;
    }
}
