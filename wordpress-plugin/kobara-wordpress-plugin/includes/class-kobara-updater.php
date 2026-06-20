<?php
if (!defined('ABSPATH')) {
    exit;
}

class Kobara_Plugin_Updater {
    private $file;
    private $plugin;
    private $basename;
    private $active;
    private $info_url;

    public function __construct($file, $info_url) {
        $this->file = $file;
        $this->info_url = $info_url;
        $this->plugin = plugin_basename($this->file);
        $this->basename = plugin_basename($this->file);
        $this->active = is_plugin_active($this->basename);

        add_action('admin_init', array($this, 'set_plugin_properties'));
        add_filter('pre_set_site_transient_update_plugins', array($this, 'check_update'));
        add_filter('plugins_api', array($this, 'plugin_info'), 20, 3);
    }

    public function set_plugin_properties() {
        $plugin_data = get_plugin_data($this->file);
        $this->version = $plugin_data['Version'];
    }

    public function check_update($transient) {
        if (empty($transient->checked)) {
            return $transient;
        }

        $remote = $this->get_remote_info();

        if ($remote && version_compare($this->version, $remote->version, '<')) {
            $obj = new stdClass();
            $obj->slug = $this->plugin;
            $obj->new_version = $remote->version;
            $obj->url = $remote->details_url;
            $obj->package = $remote->download_url;
            $obj->icons = array(
                '1x' => KOBARA_PLUGIN_URL . 'moncashicon.png'
            );
            $transient->response[$this->plugin] = $obj;
        }

        return $transient;
    }

    public function plugin_info($false, $action, $arg) {
        if ($action !== 'plugin_information' || !isset($arg->slug) || $arg->slug !== $this->plugin) {
            return $false;
        }

        $remote = $this->get_remote_info();

        if (!$remote) {
            return $false;
        }

        $obj = new stdClass();
        $obj->name = $remote->name;
        $obj->slug = $this->plugin;
        $obj->version = $remote->version;
        $obj->author = $remote->author;
        $obj->homepage = $remote->details_url;
        $obj->requires = $remote->requires;
        $obj->tested = $remote->tested;
        $obj->downloaded = 0;
        $obj->last_updated = $remote->last_updated;
        $obj->sections = array(
            'description' => $remote->sections->description,
            'changelog' => $remote->sections->changelog
        );
        $obj->download_link = $remote->download_url;

        return $obj;
    }

    private function get_remote_info() {
        $request = wp_remote_get($this->info_url, array('timeout' => 10));

        if (!is_wp_error($request) && wp_remote_retrieve_response_code($request) === 200) {
            return json_decode(wp_remote_retrieve_body($request));
        }

        return false;
    }
}
