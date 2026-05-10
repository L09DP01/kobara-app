<?php
if (!defined('ABSPATH')) {
    exit;
}

class Kobara_API_Client {
    private $secret_key;
    private $is_test_mode;

    public function __construct($secret_key, $is_test_mode = false) {
        $this->secret_key = $secret_key;
        $this->is_test_mode = $is_test_mode;
    }

    public function create_payment($order_id, $amount, $currency, $customer_name, $customer_phone, $success_url, $error_url) {
        $endpoint = KOBARA_API_BASE_URL . '/payments';

        $body = array(
            'amount' => $amount,
            'currency' => $currency,
            'description' => 'Commande #' . $order_id,
            'metadata' => array(
                'order_id' => $order_id,
                'source' => 'woocommerce'
            ),
            'customer' => array(
                'name' => $customer_name,
                'phone' => $customer_phone
            ),
            'successUrl' => $success_url,
            'errorUrl' => $error_url
        );

        $response = wp_remote_post($endpoint, array(
            'headers' => array(
                'Authorization' => 'Bearer ' . $this->secret_key,
                'Content-Type' => 'application/json'
            ),
            'body' => wp_json_encode($body),
            'timeout' => 30
        ));

        if (is_wp_error($response)) {
            return array('success' => false, 'message' => $response->get_error_message());
        }

        $response_code = wp_remote_retrieve_response_code($response);
        $response_body = wp_remote_retrieve_body($response);
        $data = json_decode($response_body, true);

        if ($response_code >= 200 && $response_code < 300 && isset($data['data']['url'])) {
            return array('success' => true, 'url' => $data['data']['url'], 'payment_id' => $data['data']['id']);
        }

        return array('success' => false, 'message' => isset($data['error']) ? $data['error'] : 'Unknown error from Kobara API');
    }
}
