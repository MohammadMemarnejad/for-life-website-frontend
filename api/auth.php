<?php
declare(strict_types=1);
require __DIR__ . '/lib.php';

$method = request_method();
$auth = auth_record();

if ($method === 'GET') {
    json_response([
        'installed' => $auth !== null,
        'authenticated' => token_valid($auth, bearer_token()),
    ]);
}

if ($method !== 'POST') {
    json_response(['error' => 'روش درخواست پشتیبانی نمی‌شود'], 405);
}

same_origin();
if (!$auth) {
    json_response(['error' => 'اول رمز پنل را بسازید', 'needsInstall' => true], 503);
}

assert_login_allowed();
$body = read_json_body();
$password = (string) ($body['password'] ?? '');
if ($password === '' || !password_verify($password, $auth['password_hash'])) {
    record_login_failure();
    json_response(['error' => 'رمز درست نیست'], 401);
}

clear_login_failures();
json_response(['ok' => true, 'token' => issue_token($auth['token_secret'])]);
