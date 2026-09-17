<?php
if (!defined('ABSPATH')) { exit; }
add_action('elementor/widgets/register', function ($manager) {
    if (!class_exists('\Elementor\Widget_Base')) { return; }
    class iPanel_RV_Widget extends \Elementor\Widget_Base {
        public function get_name() { return 'ipanel_room_visualizer'; }
        public function get_title() { return 'iPanel Room Visualizer'; }
        public function get_icon() { return 'eicon-image'; }
        public function get_categories() { return ['general']; }
        protected function register_controls() {}
        protected function render() { echo do_shortcode('[ipanel_room_visualizer]'); }
    }
    if (method_exists($manager,'register')) { $manager->register(new iPanel_RV_Widget()); } elseif (method_exists($manager,'register_widget')) { $manager->register_widget(new iPanel_RV_Widget()); }
});
