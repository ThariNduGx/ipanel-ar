<?php
if (!defined('ABSPATH')) { exit; }
class iPanel_Compat {
    public static function init() {
        add_filter('script_loader_tag', [__CLASS__, 'tag'], 10, 2);
        add_filter('style_loader_tag', [__CLASS__, 'tag'], 10, 2);
        add_filter('autoptimize_filter_js_exclude', [__CLASS__, 'ao']);
        add_filter('autoptimize_filter_css_exclude', [__CLASS__, 'ao']);
    }
    public static function tag($html, $handle) {
        if (strpos($handle, 'ipanel') !== 0) { return $html; }
        if (strpos($html, '<link') === 0) {
            return str_replace(' />', ' data-nooptimize="1" />', $html);
        }
        return str_replace('></', ' data-nooptimize="1"></', $html);
    }
    public static function ao($ex) { return $ex . ',ipanel-visualizer'; }
}
iPanel_Compat::init();
