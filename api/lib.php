<?php
/**
 * پنل کوچک «دَمی برای زیستن»
 *
 * بدون دیتابیس و بدون کتابخانه اضافه. محتوا در storage/content.json است
 * و عکس و موزیک در uploads/ ذخیره می‌شود. روی هاست اشتراکی لینوکس با PHP کافی است.
 *
 * راه‌اندازی: یک بار /admin را باز کنید و رمز بسازید.
 * هنگام به‌روزرسانی سایت، پوشه‌های storage و uploads را پاک نکنید.
 */

declare(strict_types=1);

const MAX_JSON_BYTES = 700000;
const TOKEN_TTL = 86400 * 14;
const MAX_IMAGE_EDGE = 1600;

function storage_dir(): string
{
    $dir = dirname(__DIR__) . '/storage';
    if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
        json_response(['error' => 'پوشه storage ساخته نشد. دسترسی نوشتن هاست را بررسی کنید.'], 500);
    }
    $ht = $dir . '/.htaccess';
    if (!is_file($ht)) {
        file_put_contents($ht, "Require all denied\nDeny from all\n");
    }
    return $dir;
}

function uploads_root(): string
{
    $dir = dirname(__DIR__) . '/uploads';
    foreach ([$dir, $dir . '/images', $dir . '/music'] as $path) {
        if (!is_dir($path) && !mkdir($path, 0755, true) && !is_dir($path)) {
            json_response(['error' => 'پوشه uploads ساخته نشد. دسترسی نوشتن هاست را بررسی کنید.'], 500);
        }
    }
    return $dir;
}

function json_response(array $data, int $code = 200): void
{
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
    header('Cache-Control: no-store');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function request_method(): string
{
    return strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
}

function read_json_body(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false) {
        json_response(['error' => 'بدنه درخواست خوانده نشد'], 400);
    }
    if (strlen($raw) > MAX_JSON_BYTES) {
        json_response(['error' => 'حجم محتوا برای این هاست زیاد است'], 413);
    }
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        json_response(['error' => 'داده نامعتبر است'], 400);
    }
    return $data;
}

function same_origin(): void
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin === '') {
        return;
    }
    $host = $_SERVER['HTTP_HOST'] ?? '';
    $https = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
    $expected = ($https ? 'https' : 'http') . '://' . $host;
    if (hash_equals($expected, $origin)) {
        return;
    }
    $devProxy = preg_match('#^(127\.0\.0\.1|localhost):8787$#', $host) === 1
        && preg_match('#^http://(localhost|127\.0\.0\.1)(:\d+)?$#', $origin) === 1;
    if (!$devProxy) {
        json_response(['error' => 'درخواست از مبدأ نامعتبر است'], 403);
    }
}

function clip_text($value, int $max): string
{
    $text = trim(strip_tags((string) $value));
    $text = str_replace(["\r\n", "\r"], "\n", $text);
    if (function_exists('mb_substr')) {
        if (mb_strlen($text) > $max) {
            return mb_substr($text, 0, $max);
        }
        return $text;
    }
    if (strlen($text) > $max) {
        return substr($text, 0, $max);
    }
    return $text;
}

function clip_id($value, string $fallback): string
{
    $id = preg_replace('/[^a-zA-Z0-9_-]/', '', (string) $value) ?? '';
    if ($id === '') {
        $id = $fallback;
    }
    return substr($id, 0, 48);
}

function safe_url($value): string
{
    $url = trim((string) $value);
    if ($url === '' || strlen($url) > 500) {
        return '';
    }
    if (preg_match('#^/(uploads/(images|music)/[A-Za-z0-9._-]+|[A-Za-z0-9._/-]+\.(png|jpe?g|webp|gif|mp3|ogg|wav|m4a))$#', $url)) {
        if (str_contains($url, '..')) {
            return '';
        }
        return $url;
    }
    if (preg_match('#^https://[^\s<>"\']+$#', $url)) {
        return $url;
    }
    return '';
}

function safe_link($value): string
{
    $url = trim((string) $value);
    if ($url === '' || strlen($url) > 500 || str_contains($url, '..')) {
        return '';
    }
    if (preg_match('#^https://[^\s<>"\']+$#', $url)) {
        return $url;
    }
    if (preg_match('#^/[A-Za-z0-9._~/-]*$#', $url)) {
        return $url;
    }
    if (preg_match('#^(home|about|meetup|gallery)$#', $url)) {
        return $url;
    }
    return '';
}

function auth_record(): ?array
{
    $path = storage_dir() . '/auth.json';
    if (!is_file($path)) {
        return null;
    }
    $data = json_decode((string) file_get_contents($path), true);
    if (!is_array($data) || empty($data['password_hash']) || empty($data['token_secret'])) {
        return null;
    }
    return $data;
}

function bearer_token(): string
{
    $header = $_SERVER['HTTP_X_ADMIN_TOKEN'] ?? '';
    if ($header !== '') {
        return trim($header);
    }
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    if ($header === '' && function_exists('getallheaders')) {
        $headers = getallheaders();
        foreach ($headers as $name => $value) {
            if (strcasecmp($name, 'Authorization') === 0) {
                $header = $value;
                break;
            }
        }
    }
    if (preg_match('/^Bearer\s+(\S+)$/', $header, $match)) {
        return $match[1];
    }
    return '';
}

function token_valid(?array $auth, string $token): bool
{
    if (!$auth || $token === '' || !str_contains($token, '.')) {
        return false;
    }
    [$payload, $sig] = explode('.', $token, 2);
    $expected = hash_hmac('sha256', $payload, $auth['token_secret']);
    if (!hash_equals($expected, $sig)) {
        return false;
    }
    $json = base64_decode(strtr($payload, '-_', '+/'), true);
    $data = is_string($json) ? json_decode($json, true) : null;
    return is_array($data) && (int) ($data['exp'] ?? 0) >= time();
}

function issue_token(string $secret): string
{
    $payload = rtrim(strtr(base64_encode(json_encode(['exp' => time() + TOKEN_TTL])), '+/', '-_'), '=');
    return $payload . '.' . hash_hmac('sha256', $payload, $secret);
}

function require_auth(): void
{
    same_origin();
    $auth = auth_record();
    if (!$auth) {
        json_response(['error' => 'پنل هنوز راه‌اندازی نشده است', 'needsInstall' => true], 503);
    }
    if (!token_valid($auth, bearer_token())) {
        json_response(['error' => 'وارد نشده‌اید یا نشست منقضی شده است'], 401);
    }
}

function rate_limit_path(): string
{
    return storage_dir() . '/login-attempts.json';
}

function assert_login_allowed(): void
{
    $path = rate_limit_path();
    $state = is_file($path) ? json_decode((string) file_get_contents($path), true) : null;
    if (!is_array($state)) {
        $state = ['fails' => 0, 'until' => 0];
    }
    if ((int) ($state['until'] ?? 0) > time()) {
        json_response(['error' => 'تلاش‌های ناموفق زیاد بود. چند دقیقه دیگر دوباره وارد شوید.'], 429);
    }
}

function record_login_failure(): void
{
    $path = rate_limit_path();
    $state = is_file($path) ? json_decode((string) file_get_contents($path), true) : null;
    if (!is_array($state)) {
        $state = ['fails' => 0, 'until' => 0];
    }
    $fails = (int) ($state['fails'] ?? 0) + 1;
    $until = $fails >= 6 ? time() + 900 : 0;
    if ($until) {
        $fails = 0;
    }
    file_put_contents($path, json_encode(['fails' => $fails, 'until' => $until]));
}

function clear_login_failures(): void
{
    $path = rate_limit_path();
    if (is_file($path)) {
        unlink($path);
    }
}

function write_json_file(string $path, array $data): void
{
    $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    if ($json === false || strlen($json) > MAX_JSON_BYTES) {
        json_response(['error' => 'محتوا خیلی بزرگ است'], 413);
    }
    $tmp = $path . '.tmp';
    if (file_put_contents($tmp, $json, LOCK_EX) === false) {
        json_response(['error' => 'نوشتن فایل ممکن نشد'], 500);
    }
    if (!rename($tmp, $path)) {
        @unlink($tmp);
        json_response(['error' => 'ذخیره فایل ممکن نشد'], 500);
    }
}

function load_public_content(): array
{
    $path = storage_dir() . '/content.json';
    if (!is_file($path)) {
        $seedPath = __DIR__ . '/seed.json';
        if (!is_file($seedPath)) {
            json_response(['error' => 'محتوای اولیه پیدا نشد'], 500);
        }
        $seed = file_get_contents($seedPath);
        if ($seed === false || file_put_contents($path, $seed, LOCK_EX) === false) {
            json_response(['error' => 'ساخت فایل محتوا ممکن نشد'], 500);
        }
    }
    $data = json_decode((string) file_get_contents($path), true);
    if (!is_array($data)) {
        json_response(['error' => 'فایل محتوا خراب است'], 500);
    }
    return $data;
}

function sanitize_status($status): string
{
    $value = (string) $status;
    return in_array($value, ['open', 'full', 'completed'], true) ? $value : 'open';
}

function sanitize_meetup_section(array $input): array
{
    $legacy = is_array($input['upcomingEvent'] ?? null) ? $input['upcomingEvent'] : [];
    $section = is_array($input['meetupSection'] ?? null) ? $input['meetupSection'] : $legacy;
    return [
        'heading' => clip_text($section['heading'] ?? ($legacy['heading'] ?? ''), 160),
        'subheading' => clip_text($section['subheading'] ?? ($legacy['subheading'] ?? ''), 300),
        'categoryBadge' => clip_text($section['categoryBadge'] ?? ($legacy['categoryBadge'] ?? ''), 60),
    ];
}

function sanitize_upcoming_events(array $input): array
{
    $raw = $input['upcomingEvents'] ?? null;
    if (!is_array($raw)) {
        $legacy = $input['upcomingEvent'] ?? null;
        $raw = is_array($legacy) ? [$legacy] : [];
    }
    $events = [];
    foreach (array_slice($raw, 0, 12) as $i => $event) {
        if (!is_array($event)) {
            continue;
        }
        $events[] = [
            'id' => clip_id($event['id'] ?? '', 'event-' . ($i + 1)),
            'title' => clip_text($event['title'] ?? '', 140),
            'subtitle' => clip_text($event['subtitle'] ?? '', 220),
            'badge' => clip_text($event['badge'] ?? '', 80),
            'date' => clip_text($event['date'] ?? '', 80),
            'time' => clip_text($event['time'] ?? '', 80),
            'location' => clip_text($event['location'] ?? '', 160),
            'note' => clip_text($event['note'] ?? '', 500),
            'status' => sanitize_status($event['status'] ?? 'open'),
        ];
    }
    return $events;
}

function sanitize_content(array $input): array
{
    $site = is_array($input['siteConfig'] ?? null) ? $input['siteConfig'] : [];
    $about = is_array($input['aboutContent'] ?? null) ? $input['aboutContent'] : [];
    $philosophy = is_array($about['philosophy'] ?? null) ? $about['philosophy'] : [];
    $kerman = is_array($about['kermanStory'] ?? null) ? $about['kermanStory'] : [];

    $tracks = [];
    foreach (array_slice(is_array($input['tracks'] ?? null) ? $input['tracks'] : [], 0, 20) as $i => $track) {
        if (!is_array($track)) {
            continue;
        }
        $url = safe_url($track['url'] ?? '');
        if ($url === '') {
            continue;
        }
        $tracks[] = [
            'id' => clip_id($track['id'] ?? '', 'track-' . ($i + 1)),
            'title' => clip_text($track['title'] ?? 'بدون عنوان', 80),
            'artist' => clip_text($track['artist'] ?? '', 80),
            'album' => clip_text($track['album'] ?? '', 80),
            'description' => clip_text($track['description'] ?? '', 200),
            'url' => $url,
        ];
    }

    $features = [];
    foreach (array_slice(is_array($input['features'] ?? null) ? $input['features'] : [], 0, 6) as $i => $feature) {
        if (!is_array($feature)) {
            continue;
        }
        $icon = (string) ($feature['icon'] ?? 'book');
        if (!in_array($icon, ['hourglass', 'grid', 'book'], true)) {
            $icon = 'book';
        }
        $features[] = [
            'id' => clip_id($feature['id'] ?? '', 'feature-' . ($i + 1)),
            'badge' => clip_text($feature['badge'] ?? '', 40),
            'title' => clip_text($feature['title'] ?? '', 80),
            'description' => clip_text($feature['description'] ?? '', 300),
            'linkText' => clip_text($feature['linkText'] ?? '', 80),
            'actionText' => clip_text($feature['actionText'] ?? '', 80),
            'icon' => $icon,
        ];
    }

    $albums = [];
    foreach (array_slice(is_array($input['meetupAlbums'] ?? null) ? $input['meetupAlbums'] : [], 0, 30) as $i => $album) {
        if (!is_array($album)) {
            continue;
        }
        $photos = [];
        foreach (array_slice(is_array($album['photos'] ?? null) ? $album['photos'] : [], 0, 40) as $p => $photo) {
            if (!is_array($photo)) {
                continue;
            }
            $image = safe_url($photo['image'] ?? '');
            if ($image === '') {
                continue;
            }
            $photos[] = [
                'id' => clip_id($photo['id'] ?? '', 'photo-' . ($i + 1) . '-' . ($p + 1)),
                'title' => clip_text($photo['title'] ?? '', 120),
                'image' => $image,
                'description' => clip_text($photo['description'] ?? '', 400),
            ];
        }
        $cover = safe_url($album['coverImage'] ?? '');
        if ($cover === '' && isset($photos[0])) {
            $cover = $photos[0]['image'];
        }
        $albums[] = [
            'id' => clip_id($album['id'] ?? '', 'album-' . ($i + 1)),
            'title' => clip_text($album['title'] ?? 'دورهمی', 140),
            'shortTitle' => clip_text($album['shortTitle'] ?? '', 60),
            'date' => clip_text($album['date'] ?? '', 60),
            'location' => clip_text($album['location'] ?? '', 140),
            'coverImage' => $cover,
            'description' => clip_text($album['description'] ?? '', 500),
            'photos' => $photos,
        ];
    }

    $values = [];
    foreach (array_slice(is_array($about['values'] ?? null) ? $about['values'] : [], 0, 8) as $value) {
        if (!is_array($value)) {
            continue;
        }
        $values[] = [
            'title' => clip_text($value['title'] ?? '', 80),
            'desc' => clip_text($value['desc'] ?? '', 300),
        ];
    }

    $events = sanitize_upcoming_events($input);
    $meetupSection = sanitize_meetup_section($input);
    $primary = $events[0] ?? [
        'id' => 'event-1',
        'title' => '',
        'subtitle' => '',
        'badge' => '',
        'date' => '',
        'time' => '',
        'location' => '',
        'note' => '',
        'status' => 'open',
    ];

    $musicUrl = $tracks[0]['url'] ?? safe_url($site['musicUrl'] ?? '');

    return [
        'siteConfig' => [
            'name' => clip_text($site['name'] ?? '', 80),
            'domain' => clip_text($site['domain'] ?? '', 80),
            'slogan' => clip_text($site['slogan'] ?? '', 180),
            'city' => clip_text($site['city'] ?? '', 40),
            'venue' => clip_text($site['venue'] ?? '', 120),
            'instagramHandle' => clip_text($site['instagramHandle'] ?? '', 80),
            'instagramUrl' => safe_url($site['instagramUrl'] ?? ''),
            'phone' => clip_text($site['phone'] ?? '', 30),
            'musicUrl' => $musicUrl,
            'googleSheetScriptUrl' => safe_url($site['googleSheetScriptUrl'] ?? ''),
            'heroImage' => safe_url($site['heroImage'] ?? '') ?: '/window-hero.png',
            'storyBadge' => clip_text($site['storyBadge'] ?? '', 40),
            'storyTitle' => clip_text($site['storyTitle'] ?? '', 160),
            'storyText' => clip_text($site['storyText'] ?? '', 800),
            'storyImage' => safe_url($site['storyImage'] ?? '') ?: '/tea-illustration.jpg',
            'storyButtonLabel' => clip_text($site['storyButtonLabel'] ?? '', 80),
        ],
        'storySlides' => sanitize_story_slides($input['storySlides'] ?? []),
        'meetupSection' => $meetupSection,
        'upcomingEvents' => $events,
        'upcomingEvent' => [
            'title' => $primary['title'],
            'subtitle' => $primary['subtitle'],
            'badge' => $primary['badge'],
            'categoryBadge' => $meetupSection['categoryBadge'],
            'heading' => $meetupSection['heading'],
            'subheading' => $meetupSection['subheading'],
            'date' => $primary['date'],
            'time' => $primary['time'],
            'location' => $primary['location'],
            'note' => $primary['note'],
            'status' => $primary['status'],
        ],
        'features' => $features,
        'meetupAlbums' => $albums,
        'aboutContent' => [
            'heroTitle' => clip_text($about['heroTitle'] ?? '', 160),
            'heroSubtitle' => clip_text($about['heroSubtitle'] ?? '', 400),
            'philosophy' => [
                'title' => clip_text($philosophy['title'] ?? '', 160),
                'p1' => clip_text($philosophy['p1'] ?? '', 800),
                'p2' => clip_text($philosophy['p2'] ?? '', 800),
            ],
            'values' => $values,
            'kermanStory' => [
                'title' => clip_text($kerman['title'] ?? '', 160),
                'desc' => clip_text($kerman['desc'] ?? '', 800),
            ],
        ],
        'tracks' => $tracks,
    ];
}

function sanitize_story_slides($slides): array
{
    $clean = [];
    foreach (array_slice(is_array($slides) ? $slides : [], 0, 16) as $i => $slide) {
        if (!is_array($slide)) {
            continue;
        }
        $clean[] = [
            'id' => clip_id($slide['id'] ?? '', 'slide-' . ($i + 1)),
            'label' => clip_text($slide['label'] ?? '', 40),
            'image' => safe_url($slide['image'] ?? ''),
            'href' => safe_link($slide['href'] ?? ''),
        ];
    }
    return $clean;
}

function delete_managed_file(string $url): void
{
    if (!preg_match('#^/uploads/(images|music)/([A-Za-z0-9._-]+)$#', $url, $match)) {
        json_response(['error' => 'فقط فایل‌های بارگذاری‌شده در پوشه سایت قابل حذف هستند'], 400);
    }
    $root = realpath(uploads_root());
    $path = uploads_root() . '/' . $match[1] . '/' . $match[2];
    $real = realpath($path);
    if ($root && $real && str_starts_with($real, $root . DIRECTORY_SEPARATOR) && is_file($real)) {
        unlink($real);
    }
}

function store_uploaded_image(array $file): string
{
    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        json_response(['error' => 'بارگذاری عکس انجام نشد'], 400);
    }
    if (($file['size'] ?? 0) > 8 * 1024 * 1024) {
        json_response(['error' => 'حجم عکس باید کمتر از ۸ مگابایت باشد'], 413);
    }
    $info = @getimagesize($file['tmp_name']);
    $mime = is_array($info) ? ($info['mime'] ?? '') : '';
    $allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!in_array($mime, $allowed, true)) {
        json_response(['error' => 'فقط عکس jpg، png، webp یا gif پذیرفته می‌شود'], 400);
    }

    $loaders = [
        'image/jpeg' => 'imagecreatefromjpeg',
        'image/png' => 'imagecreatefrompng',
        'image/webp' => 'imagecreatefromwebp',
        'image/gif' => 'imagecreatefromgif',
    ];
    $loader = $loaders[$mime];
    $canEncode = function_exists($loader) && function_exists('imagecreatetruecolor') && function_exists('imagecopyresampled');
    $keepPng = $mime === 'image/png' || $mime === 'image/webp';
    if ($keepPng && !function_exists('imagepng')) {
        $canEncode = false;
    }
    if (!$keepPng && !function_exists('imagejpeg')) {
        $canEncode = false;
    }

    uploads_root();
    if (!$canEncode) {
        if (($file['size'] ?? 0) > 1500 * 1024) {
            json_response(['error' => 'فشرده‌سازی عکس روی هاست فعال نیست. عکس کوچک‌تر از ۱.۵ مگابایت بفرستید.'], 413);
        }
        $ext = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif'][$mime];
        $name = bin2hex(random_bytes(8)) . '.' . $ext;
        $dest = uploads_root() . '/images/' . $name;
        if (!move_uploaded_file($file['tmp_name'], $dest)) {
            json_response(['error' => 'ذخیره عکس ممکن نشد'], 500);
        }
        return '/uploads/images/' . $name;
    }

    $src = @$loader($file['tmp_name']);
    if (!$src) {
        json_response(['error' => 'این عکس قابل خواندن نیست'], 400);
    }
    $width = imagesx($src);
    $height = imagesy($src);
    $scale = min(1, MAX_IMAGE_EDGE / max($width, $height, 1));
    $newW = max(1, (int) round($width * $scale));
    $newH = max(1, (int) round($height * $scale));
    $dst = imagecreatetruecolor($newW, $newH);
    if ($keepPng) {
        imagealphablending($dst, false);
        imagesavealpha($dst, true);
        $transparent = imagecolorallocatealpha($dst, 0, 0, 0, 127);
        imagefilledrectangle($dst, 0, 0, $newW, $newH, $transparent);
    }
    imagecopyresampled($dst, $src, 0, 0, 0, 0, $newW, $newH, $width, $height);
    $ext = $keepPng ? 'png' : 'jpg';
    $name = bin2hex(random_bytes(8)) . '.' . $ext;
    $dest = uploads_root() . '/images/' . $name;
    $saved = $keepPng ? imagepng($dst, $dest, 6) : imagejpeg($dst, $dest, 82);
    imagedestroy($src);
    imagedestroy($dst);
    if (!$saved) {
        json_response(['error' => 'ذخیره عکس ممکن نشد'], 500);
    }
    return '/uploads/images/' . $name;
}

function store_uploaded_audio(array $file): string
{
    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        json_response(['error' => 'بارگذاری موزیک انجام نشد'], 400);
    }
    if (($file['size'] ?? 0) > 8 * 1024 * 1024) {
        json_response(['error' => 'حجم موزیک باید کمتر از ۸ مگابایت باشد تا هاست پر نشود'], 413);
    }
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file($file['tmp_name']) ?: '';
    $map = [
        'audio/mpeg' => 'mp3',
        'audio/mp3' => 'mp3',
        'audio/ogg' => 'ogg',
        'application/ogg' => 'ogg',
        'audio/wav' => 'wav',
        'audio/x-wav' => 'wav',
        'audio/mp4' => 'm4a',
        'audio/x-m4a' => 'm4a',
        'video/mp4' => 'm4a',
    ];
    if (!isset($map[$mime])) {
        json_response(['error' => 'فقط فایل mp3، ogg، wav یا m4a پذیرفته می‌شود'], 400);
    }
    uploads_root();
    $name = bin2hex(random_bytes(8)) . '.' . $map[$mime];
    $dest = uploads_root() . '/music/' . $name;
    if (!move_uploaded_file($file['tmp_name'], $dest)) {
        json_response(['error' => 'ذخیره موزیک ممکن نشد'], 500);
    }
    return '/uploads/music/' . $name;
}
