<?php
declare(strict_types=1);
require __DIR__ . '/lib.php';

if (request_method() !== 'POST') {
    json_response(['error' => 'روش درخواست پشتیبانی نمی‌شود'], 405);
}

same_origin();
if (auth_record()) {
    json_response(['error' => 'پنل قبلاً راه‌اندازی شده است'], 403);
}

$body = read_json_body();
$password = (string) ($body['password'] ?? '');
$length = function_exists('mb_strlen') ? mb_strlen($password) : strlen($password);
if ($length < 8 || $length > 80) {
    json_response(['error' => 'رمز باید حداقل ۸ نویسه باشد'], 400);
}

write_json_file(storage_dir() . '/auth.json', [
    'password_hash' => password_hash($password, PASSWORD_DEFAULT),
    'token_secret' => bin2hex(random_bytes(32)),
    'createdAt' => time(),
]);

$auth = auth_record();
json_response(['ok' => true, 'token' => issue_token($auth['token_secret'])]);
