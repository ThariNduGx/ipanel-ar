<?php
if (!defined('ABSPATH')) { exit; }
class iPanel_UGC {
    public static function init() {
        add_action('rest_api_init', [__CLASS__, 'routes']);
        add_action('admin_post_ipanel_ugc_approve', [__CLASS__, 'approve']);
        add_action('admin_post_ipanel_ugc_delete', [__CLASS__, 'delete']);
    }
    protected static function dirs() {
        $up = wp_upload_dir(); $base = $up['basedir'] . '/ipanel-ar/ugc';
        foreach (['/pending', '/approved'] as $d) { if (!is_dir($base . $d)) { wp_mkdir_p($base . $d); } }
        return $base;
    }
    public static function routes() {
        register_rest_route('ipanel/v1', '/ugc', ['methods' => 'POST', 'permission_callback' => '__return_true', 'callback' => [__CLASS__, 'submit']]);
        register_rest_route('ipanel/v1', '/ugc', ['methods' => 'GET', 'permission_callback' => '__return_true', 'callback' => [__CLASS__, 'listing']]);
    }
    public static function submit(WP_REST_Request $r) {
        $consent = (int) $r->get_param('consent'); $img = (string) $r->get_param('image');
        $finish = sanitize_key((string) $r->get_param('finish'));
        if ($consent !== 1 || $img === '') { return new WP_REST_Response(['ok' => false, 'err' => 'consent'], 400); }
        if (!preg_match('#^data:image/(png|jpeg|webp);base64,(.+)$#s', $img, $m)) { return new WP_REST_Response(['ok' => false, 'err' => 'mime'], 400); }
        $bin = base64_decode($m[2]);
        if (!$bin || strlen($bin) > 3 * 1024 * 1024) { return new WP_REST_Response(['ok' => false, 'err' => 'size'], 400); }
        if (!@getimagesizefromstring($bin)) { return new WP_REST_Response(['ok' => false, 'err' => 'image'], 400); }
        $base = self::dirs();
        $name = 'ugc-' . time() . '-' . wp_generate_password(6, false) . '.' . ($m[1] === 'jpeg' ? 'jpg' : $m[1]);
        file_put_contents($base . '/pending/' . $name, $bin);
        file_put_contents($base . '/pending/' . $name . '.json', wp_json_encode(['finish' => $finish, 'ts' => time(), 'status' => 'pending']));
        return new WP_REST_Response(['ok' => true], 200);
    }
    public static function listing() {
        $up = wp_upload_dir(); $base = self::dirs(); $out = [];
        foreach ((array) glob($base . '/approved/ugc-*.{png,jpg,webp}', GLOB_BRACE) as $f) {
            $meta = @json_decode((string) @file_get_contents($f . '.json'), true);
            $out[] = ['url' => $up['baseurl'] . '/ipanel-ar/ugc/approved/' . basename($f), 'finish' => is_array($meta) && isset($meta['finish']) ? $meta['finish'] : ''];
        }
        rsort($out); return new WP_REST_Response(array_slice($out, 0, 12), 200);
    }
    protected static function check() {
        if (!current_user_can('manage_options')) { wp_die('no'); }
        check_admin_referer('ipanel_ugc');
    }
    public static function approve() {
        self::check(); $base = self::dirs(); $n = sanitize_file_name(isset($_GET['f']) ? $_GET['f'] : '');
        if ($n && file_exists($base . '/pending/' . $n)) {
            rename($base . '/pending/' . $n, $base . '/approved/' . $n);
            if (file_exists($base . '/pending/' . $n . '.json')) {
                $m = json_decode((string) file_get_contents($base . '/pending/' . $n . '.json'), true);
                if (!is_array($m)) { $m = []; } $m['status'] = 'approved';
                file_put_contents($base . '/approved/' . $n . '.json', wp_json_encode($m));
                unlink($base . '/pending/' . $n . '.json');
            }
        }
        wp_redirect(admin_url('options-general.php?page=ipanel-visualizer')); exit;
    }
    public static function delete() {
        self::check(); $base = self::dirs(); $n = sanitize_file_name(isset($_GET['f']) ? $_GET['f'] : '');
        if ($n) { @unlink($base . '/pending/' . $n); @unlink($base . '/pending/' . $n . '.json'); }
        wp_redirect(admin_url('options-general.php?page=ipanel-visualizer')); exit;
    }
    public static function admin_list() {
        $base = self::dirs(); $items = (array) glob($base . '/pending/ugc-*.{png,jpg,webp}', GLOB_BRACE);
        echo '<h2>UGC pending moderation</h2>';
        if (!$items) { echo '<p>Nothing pending.</p>'; return; }
        foreach ($items as $f) { $n = basename($f);
            echo '<p><img src="' . esc_url(content_url('/uploads/ipanel-ar/ugc/pending/' . $n)) . '" style="max-width:160px;border-radius:8px"> '
               . '<a href="' . esc_url(wp_nonce_url(admin_url('admin-post.php?action=ipanel_ugc_approve&f=' . rawurlencode($n)), 'ipanel_ugc')) . '">Approve</a> | '
               . '<a href="' . esc_url(wp_nonce_url(admin_url('admin-post.php?action=ipanel_ugc_delete&f=' . rawurlencode($n)), 'ipanel_ugc')) . '">Delete</a></p>';
        }
    }
}
iPanel_UGC::init();
