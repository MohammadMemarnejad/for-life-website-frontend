<?php
declare(strict_types=1);
require __DIR__ . '/lib.php';

$method = request_method();

if ($method === 'GET') {
    json_response(load_public_content());
}

if ($method === 'PUT' || $method === 'POST') {
    require_auth();
    $saved = sanitize_content(read_json_body());
    write_json_file(storage_dir() . '/content.json', $saved);
    json_response(['ok' => true, 'content' => $saved]);
}

json_response(['error' => 'روش درخواست پشتیبانی نمی‌شود'], 405);
