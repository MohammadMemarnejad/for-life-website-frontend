<?php
declare(strict_types=1);
require __DIR__ . '/lib.php';

if (request_method() !== 'POST') {
    json_response(['error' => 'روش درخواست پشتیبانی نمی‌شود'], 405);
}

require_auth();
$type = $_SERVER['CONTENT_TYPE'] ?? '';

if (str_contains($type, 'application/json')) {
    $body = read_json_body();
    delete_managed_file((string) ($body['url'] ?? ''));
    json_response(['ok' => true]);
}

$kind = (string) ($_POST['kind'] ?? 'image');
if ($kind === 'audio') {
    if (!isset($_FILES['file'])) {
        json_response(['error' => 'فایل موزیک انتخاب نشده است'], 400);
    }
    json_response(['ok' => true, 'url' => store_uploaded_audio($_FILES['file'])]);
}

if (!isset($_FILES['file'])) {
    json_response(['error' => 'فایل عکس انتخاب نشده است'], 400);
}
json_response(['ok' => true, 'url' => store_uploaded_image($_FILES['file'])]);
