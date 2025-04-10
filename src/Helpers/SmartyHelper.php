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
class SmartyHelper
{
    /** @var \ModuleAdminController */
    protected $admin_controller;
    /** @var \FrontController */
    protected $front_controller;
    /** @var \Module */
    protected $module;

    public function construct()
    {
        if (\Validate::isLoadedObject(\Context::getContext()->controller)) {
            $controller = \Context::getContext()->controller;
            if (is_a($controller, 'ModuleAdminController')) {
                $this->admin_controller = $controller;
                $this->module = $this->admin_controller->module;
            } elseif (is_a($controller, 'FrontController')) {
                $this->front_controller = $controller;
                $this->module = null;
            }
        }
    }

    public function renderTplAdmin($template, $params = [])
    {
        return $this->renderTpl($template, $params, 'admin');
    }

    public function renderTplHook($template, $params = [])
    {
        return $this->renderTpl($template, $params, 'hook');
    }

    public function renderTplFront($template, $params = [])
    {
        return $this->renderTpl($template, $params, 'front');
    }

    public function renderTpl($template, $params = [], $folder = '')
    {
        $smarty = \Context::getContext()->smarty;
        if ($folder && !self::endsWith($folder, '/')) {
            $folder .= '/';
        }
        $pathInfo = pathinfo($template);
        if (isset($pathInfo['dirname']) && $pathInfo['dirname']) {
            $tpl = $pathInfo['dirname'] . '/' . $pathInfo['filename'];
        } else {
            $tpl = $pathInfo['filename'];
        }

        if (\Validate::isLoadedObject($this->module)) {
            $path = $this->module->getLocalPath() . 'views/templates/';
        } else {
            preg_match('/^.*\/modules\/.+?\//i', dirname(__FILE__), $matches);
            if ($matches) {
                $path = $matches[0] . 'views/templates/';
            } else {
                return false;
            }
        }

        $template = $path . $folder . $tpl . '.tpl';
        $tpl = \Context::getContext()->smarty->createTemplate($template);

        if ($params) {
            $tpl->assign($params);
        }

        return $tpl->fetch();
    }

    public static function startsWith($haystack, $needle)
    {
        return preg_match('/^' . $needle . '/i', $haystack);
    }

    public static function endsWith($haystack, $needle)
    {
        if ($needle == '/') {
            $needle = '\/';
        }

        return preg_match('/' . $needle . '$/i', $haystack);
    }
}
