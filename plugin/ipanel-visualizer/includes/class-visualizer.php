<?php
if (!defined('ABSPATH')) { exit; }
class iPanel_Visualizer {
    public static function init() {
        add_shortcode('ipanel_room_visualizer', [__CLASS__, 'render']);
        add_action('admin_menu', [__CLASS__, 'menu']);
        add_action('admin_init', [__CLASS__, 'settings']);
    }
    public static function menu() {
        add_options_page('iPanel Visualizer', 'iPanel Visualizer', 'manage_options', 'ipanel-visualizer', [__CLASS__, 'page']);
    }
    public static function settings() {
        register_setting('ipanel_rv', 'ipanel_rv_samples');
        register_setting('ipanel_rv', 'ipanel_rv_products');
        register_setting('ipanel_rv', 'ipanel_rv_color');
        register_setting('ipanel_rv', 'ipanel_rv_livear');
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
        submit_button(); echo '</form></div>';
    }
    public static function render($atts) {
        wp_enqueue_style('ipanel-rv', IPANEL_VISUALIZER_URL . 'assets/css/visualizer.css', [], IPANEL_VISUALIZER_VERSION);
        wp_enqueue_script('ipanel-rv', IPANEL_VISUALIZER_URL . 'assets/js/visualizer.js', [], IPANEL_VISUALIZER_VERSION, true);
        $samples = array_values(array_filter(array_map('trim', explode("\n", (string) get_option('ipanel_rv_samples', '')))));
        $cols = [];
        foreach (array_filter(array_map('trim', explode("\n", (string) get_option('ipanel_rv_color', '')))) as $line) {
            $kv = explode('=', $line); if (count($kv) === 2) { $cols[trim($kv[0])] = trim($kv[1]); }
        }
        $prods = [];
        foreach (array_filter(array_map('trim', explode("\n", (string) get_option('ipanel_rv_products', '')))) as $line) {
            $kv = explode('=', $line); if (count($kv) === 2) { $prods[trim($kv[0])] = (int) trim($kv[1]); }
        }
        return '<div class="ipanel-rv" data-samples=\'' . wp_json_encode($samples) . '\' data-products=\'' . wp_json_encode($prods) . '\' data-colors=\'' . wp_json_encode($cols) . '\' data-livear="' . (get_option('ipanel_rv_livear','') ? '1' : '0') . '"></div>';
    }
}
iPanel_Visualizer::init();
