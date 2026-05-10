<?php
/**
 * Plugin Name: Kobara Payments for WooCommerce
 * Plugin URI: https://kobara.app
 * Description: Acceptez les paiements MonCash sur WooCommerce via l'API Kobara.
 * Version: 1.0.0
 * Author: Kobara Team
 * Author URI: https://kobara.app
 * Text Domain: kobara-payments
 * WC requires at least: 5.0
 * WC tested up to: 8.0
 */

if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('KOBARA_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('KOBARA_PLUGIN_URL', plugin_dir_url(__FILE__));
define('KOBARA_API_BASE_URL', 'https://api.kobara.com/api/v1');

// Initialize the plugin when WooCommerce is loaded
add_action('plugins_loaded', 'kobara_init_gateway_class');
function kobara_init_gateway_class() {
    if (!class_exists('WooCommerce')) {
        return;
    }

    require_once KOBARA_PLUGIN_DIR . 'includes/class-kobara-api-client.php';
    require_once KOBARA_PLUGIN_DIR . 'includes/class-kobara-settings.php';
    require_once KOBARA_PLUGIN_DIR . 'includes/class-kobara-webhook.php';
    require_once KOBARA_PLUGIN_DIR . 'includes/class-kobara-woocommerce-gateway.php';

    // Register Gateway
    add_filter('woocommerce_payment_gateways', 'kobara_add_gateway_class');
    function kobara_add_gateway_class($methods) {
        $methods[] = 'WC_Gateway_Kobara';
        return $methods;
    }
}
