<?php
if (!defined('ABSPATH')) { exit; }

// P2-2: Class at file scope with class_exists guard
if (!class_exists('iPanel_RV_Widget') && class_exists('\Elementor\Widget_Base')) {

    class iPanel_RV_Widget extends \Elementor\Widget_Base {

        public function get_name()    { return 'ipanel_room_visualizer'; }
        public function get_title()   { return 'iPanel Room Visualizer'; }
        public function get_icon()    { return 'eicon-image'; }
        
        // P4-4: Include woocommerce category
        public function get_categories() { return ['general', 'woocommerce']; }
        
        // P4-5: Keywords for search discoverability
        public function get_keywords()   { return ['ar', 'visualize', 'panel', 'room', 'iPanel']; }

        // P2-3: Add controls for product and finish
        protected function register_controls() {
            $this->start_controls_section('content', ['label' => 'Visualization']);

            $this->add_control('product', [
                'label'   => 'WooCommerce Product ID',
                'type'    => \Elementor\Controls_Manager::NUMBER,
                'default' => 0,
            ]);

            $this->add_control('finish', [
                'label'   => 'Default Finish',
                'type'    => \Elementor\Controls_Manager::SELECT,
                'options' => [
                    ''             => 'None',
                    'rich-brown'   => 'Rich Brown',
                    'rich-teak'    => 'Rich Teak',
                    'rich-maple'   => 'Rich Maple',
                    'gray-marble'  => 'Gray Marble',
                    'black-marble' => 'Black Marble',
                ],
                'default' => '',
            ]);

            $this->end_controls_section();
        }

        // P2-3: Pass product and finish to shortcode
        protected function render() {
            $is_editor = \Elementor\Plugin::$instance->editor->is_edit_mode();
            
            if ($is_editor) {
                $this->render_preview();
                return;
            }
            
            $product = (int) $this->get_settings('product');
            $finish  = sanitize_text_field($this->get_settings('finish'));

            $shortcode = '[ipanel_room_visualizer';
            if ($product) $shortcode .= ' product="' . $product . '"';
            if ($finish)  $shortcode .= ' finish="' . esc_attr($finish) . '"';
            $shortcode .= ']';

            echo do_shortcode($shortcode);
        }

        // P2-3: Editor preview placeholder
        protected function render_preview() {
            echo '<div style="padding:20px;text-align:center;border:2px dashed #ccc;'
               . 'border-radius:8px;color:#888;">'
               . 'iPanel Room Visualizer — renders on the live page'
               . '</div>';
        }
    }
}

add_action('elementor/widgets/register', function ($manager) {
    if (!class_exists('iPanel_RV_Widget')) { return; }
    if (method_exists($manager, 'register')) {
        $manager->register(new iPanel_RV_Widget());
    } elseif (method_exists($manager, 'register_widget')) {
        $manager->register_widget(new iPanel_RV_Widget());
    }
});
