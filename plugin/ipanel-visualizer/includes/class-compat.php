<?php
if (!defined('ABSPATH')) { exit; }
class iPanel_Compat {
    public static function init() {
        add_filter('script_loader_tag', [__CLASS__, 'tag'], 10, 2);
        add_filter('style_loader_tag', [__CLASS__, 'tag'], 10, 2);

        // Autoptimize exclusions
        add_filter('autoptimize_filter_js_exclude', [__CLASS__, 'ao']);
        add_filter('autoptimize_filter_css_exclude', [__CLASS__, 'ao']);

        // LiteSpeed Cache: filter-based exclusion (these may be no-ops on LSCache
        // versions that lack them). The data-nooptimize attribute below is recognized
        // by multiple optimization plugins including Autoptimize, providing additional
        // defense-in-depth coverage.
        add_filter('litespeed_optm_js_exclude', [__CLASS__, 'ao']);
        add_filter('litespeed_optm_css_exclude', [__CLASS__, 'ao']);
        add_filter('litespeed_optm_html_exclude', [__CLASS__, 'ao']);
    }

    public static function tag($html, $handle) {
        if (strpos($handle, 'ipanel') !== 0) { return $html; }
        if (strpos($html, '<link') === 0) {
            // P4-6: whitespace-tolerant self-closing replacement
            return preg_replace('/\s*\/>\s*$/', ' data-nooptimize="1" />', $html, 1);
        }
        // P1-11: explicit form. The match consumes the opening tag's '>' and the
        // replacement re-emits it, so the attribute lands INSIDE the opening tag:
        //   <script src="u"></script>  ->  <script src="u" data-nooptimize="1"></script>
        return str_replace('></script>', ' data-nooptimize="1"></script>', $html);
    }

    public static function ao($ex) {
        $tokens = [];
        // Runtime path token: matches every plugin asset URL regardless of
        // custom content directories (Autoptimize/LSCache match on path substring).
        if (defined('IPANEL_VISUALIZER_URL')) {
            $p = parse_url(IPANEL_VISUALIZER_URL, PHP_URL_PATH);
            if ($p) { $tokens[] = trim($p, '/'); }
        }
        // Explicit handles for readability / belt-and-braces.
        foreach (['ipanel-visualizer','ipanel-viewer','ipanel-rv','ipanel-rv-pbr','ipanel-rv-gl','ipanel-rv-homog'] as $h) {
            $tokens[] = $h;
        }
        return $ex . ',' . implode(',', $tokens);
    }
}
iPanel_Compat::init();
