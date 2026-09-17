<?php
/**
 * Plugin Name: iPanel Visualizer
 * Description: AR/3D product visualization for iPanel ceiling & wall panels.
 * Version: 0.3.1
 * Requires PHP: 8.0
 */
if (!defined('ABSPATH')) { exit; }
define('IPANEL_VISUALIZER_VERSION', '0.4.0');
define('IPANEL_VISUALIZER_URL', plugin_dir_url(__FILE__));

add_action('wp_enqueue_scripts', function () {
    wp_enqueue_style('ipanel-viewer', IPANEL_VISUALIZER_URL . 'assets/css/viewer.css', [], IPANEL_VISUALIZER_VERSION);
    wp_enqueue_script('ipanel-viewer', IPANEL_VISUALIZER_URL . 'assets/js/viewer.js', [], IPANEL_VISUALIZER_VERSION, true);
});

require_once __DIR__.'/includes/class-visualizer.php';
require_once __DIR__.'/includes/class-compat.php';
require_once __DIR__.'/includes/class-elementor.php';
require_once __DIR__.'/includes/class-ugc.php';

add_shortcode('ipanel_viewer', function ($atts) {
    $a = shortcode_atts(['glb' => '', 'usdz' => '', 'height' => '420'], $atts);
    if (empty($a['glb'])) { return ''; }
    ob_start(); ?>
    <div class="ipanel-viewer"
         data-glb="<?php echo esc_url($a['glb']); ?>"
         data-usdz="<?php echo esc_url($a['usdz']); ?>"
         style="height:<?php echo esc_attr((int) $a['height']); ?>px">
        <button class="ipanel-load-btn" type="button">View in 3D / AR</button>
    </div>
    <?php return ob_get_clean();
});
