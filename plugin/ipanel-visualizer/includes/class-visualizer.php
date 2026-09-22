<?php
if (!defined('ABSPATH')) { exit; }
class iPanel_Visualizer {
    public static function init() {
        add_action('woocommerce_single_product_summary', [__CLASS__, 'ar_button'], 25);
        add_shortcode('ipanel_room_visualizer', [__CLASS__, 'render']);
        add_action('admin_menu', [__CLASS__, 'menu']);
        add_action('admin_init', [__CLASS__, 'settings']);
    }
    public static function menu() {
        add_options_page('iPanel Visualizer', 'iPanel Visualizer', 'manage_options', 'ipanel-visualizer', [__CLASS__, 'page']);
    }
    public static function settings() {
        register_setting('ipanel_rv', 'ipanel_rv_samples', ['sanitize_callback' => [__CLASS__, 'sanitize_lines']]);
        register_setting('ipanel_rv', 'ipanel_rv_products', ['sanitize_callback' => [__CLASS__, 'sanitize_lines']]);
        register_setting('ipanel_rv', 'ipanel_rv_color', ['sanitize_callback' => [__CLASS__, 'sanitize_lines']]);
        register_setting('ipanel_rv', 'ipanel_rv_livear', ['sanitize_callback' => 'rest_sanitize_boolean']);
        register_setting('ipanel_rv', 'ipanel_rv_gl', ['sanitize_callback' => 'rest_sanitize_boolean']);
        register_setting('ipanel_rv', 'ipanel_rv_onproduct', ['sanitize_callback' => 'rest_sanitize_boolean']);
        register_setting('ipanel_rv', 'ipanel_rv_pbr', ['sanitize_callback' => 'rest_sanitize_boolean']);
    }

    public static function sanitize_lines($value) {
        $lines = array_filter(array_map('trim', explode("\n", (string) $value)));
        $lines = array_slice($lines, 0, 100);
        return implode("\n", array_map('wp_strip_all_tags', $lines));
    }


    public static function page() {
        echo '<div class="wrap"><h1>iPanel Visualizer</h1><form method="post" action="options.php">';
        settings_fields('ipanel_rv');
        echo '<textarea name="ipanel_rv_samples" rows="6" class="large-text" placeholder="One sample-room image URL per line">'
           . esc_textarea(get_option('ipanel_rv_samples', '')) . '</textarea>';
        echo '<p>Upload sample rooms via Media Library and paste their URLs here (one per line).</p>';
        echo '<h2>Finish → WooCommerce product</h2><textarea name="ipanel_rv_products" rows="6" class="large-text" placeholder="rich-brown=123&#10;black-marble=124">'
           . esc_textarea(get_option('ipanel_rv_products','')) . '</textarea>';
        echo '<p>One per line: finish-slug=product-ID. Powers the Add-to-cart button.</p>';
        echo '<h2>Finish colour calibration</h2><textarea name="ipanel_rv_color" rows="6" class="large-text" placeholder="rich-maple=1.05,0.95,1.00">'
           . esc_textarea(get_option('ipanel_rv_color','')) . '</textarea>';
        echo '<p>One per line: slug=brightness,saturate,contrast (from the visualizer sliders).</p>';
        submit_button();
        echo '</form></div>';
    }

    public static function ar_button() {
        if (!get_option('ipanel_rv_onproduct', '')) return;
        if (!function_exists('is_product') || !is_product()) return;
        global $product;
        if (!$product) return;
        echo '<button class="ipanel-ar-btn" type="button" data-ipanel-ar-open'
           . ' data-product="' . esc_attr($product->get_id()) . '"'
           . '>&#128241; Visualize in Your Room</button>';
    }

    public static function render($atts) {
        wp_enqueue_style('ipanel-rv', IPANEL_VISUALIZER_URL . 'assets/css/visualizer.css', [], IPANEL_VISUALIZER_VERSION);
        wp_enqueue_script('ipanel-rv-pbr', IPANEL_VISUALIZER_URL . 'assets/js/pbrrenderer.js', [], IPANEL_VISUALIZER_VERSION, true);
        wp_enqueue_script('ipanel-rv-gl', IPANEL_VISUALIZER_URL . 'assets/js/glrenderer.js', ['ipanel-rv-pbr'], IPANEL_VISUALIZER_VERSION, true);
        wp_enqueue_script('ipanel-rv', IPANEL_VISUALIZER_URL . 'assets/js/visualizer.js', ['ipanel-rv-gl'], IPANEL_VISUALIZER_VERSION, true);
        $samples = array_values(array_filter(array_map('trim', explode("\n", (string) get_option('ipanel_rv_samples', '')))));
        $cols = [];
        foreach (array_filter(array_map('trim', explode("\n", (string) get_option('ipanel_rv_color', '')))) as $line) {
            $kv = explode('=', $line); if (count($kv) === 2) { $cols[trim($kv[0])] = trim($kv[1]); }
        }
        $prods = [];
        foreach (array_filter(array_map('trim', explode("\n", (string) get_option('ipanel_rv_products', '')))) as $line) {
            $kv = explode('=', $line); if (count($kv) === 2) { $prods[trim($kv[0])] = (int) trim($kv[1]); }
        }
        return '<div class="ipanel-rv"'
            . ' data-vendor="' . esc_attr(IPANEL_VISUALIZER_URL . 'assets/vendor/') . '"'
            . ' data-models="' . esc_attr(content_url('/uploads/ipanel-ar/hf/')) . '"'
            . ' data-textures="' . esc_attr(content_url('/uploads/ipanel-ar/textures/')) . '"'
            . ' data-samples="' . esc_attr(wp_json_encode($samples)) . '"'
            . ' data-products="' . esc_attr(wp_json_encode($prods)) . '"'
            . ' data-colors="' . esc_attr(wp_json_encode($cols)) . '"'
            . ' data-livear="' . (get_option('ipanel_rv_livear','') ? '1' : '0') . '"'
            . ' data-gl="' . (get_option('ipanel_rv_gl','') ? '1' : '0') . '"'
            . ' data-pbr="' . (get_option('ipanel_rv_pbr','') ? '1' : '0') . '"'
            . ' data-finish="' . esc_attr($a['finish']) . '"'
            . '></div>';
    }
}
iPanel_Visualizer::init();
