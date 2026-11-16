<?php
declare(strict_types=1);

final class SiteError extends RuntimeException {
    public int $status;
    public function __construct(string $message, int $status = 400) { parent::__construct($message); $this->status = $status; }
}
function fail(string $message, int $status = 400): void { throw new SiteError($message, $status); }
function configuration(): array {
    static $config;
    if ($config === null) $config = require dirname(__DIR__) . '/config.php';
    return $config;
}
function dataDirectory(): string {
    $override = PHP_SAPI === 'cli' ? getenv('M4H_TEST_DATA_DIR') : false;
    $path = $override ?: configuration()['data_directory'];
    if (!is_dir($path) && !@mkdir($path, 0700, true) && !is_dir($path)) fail('The private data folder could not be created. Check the hosting account folder permissions.', 503);
    if (!is_writable($path)) fail('The private data folder is not writable. Check hosting folder permissions.', 503);
    return $path;
}
function state(bool $write, callable $callback) {
    $dir = dataDirectory();
    $lock = @fopen($dir . '/state.lock', 'c+');
    if (!$lock || !flock($lock, $write ? LOCK_EX : LOCK_SH)) fail('Storage is temporarily unavailable. Please retry.', 503);
    @chmod($dir . '/state.lock', 0600);
    $temp = false;
    try {
        $path = $dir . '/state.json';
        $data = is_file($path) ? json_decode((string)file_get_contents($path), true, 512, JSON_THROW_ON_ERROR) : ['admin'=>null,'gallery'=>[],'newsletters'=>[],'subscribers'=>[],'volunteers'=>[],'messages'=>[],'uploads'=>[],'limits'=>[]];
        if (!is_array($data)) fail('Stored data could not be read. Restore the private data folder from backup.', 503);
        $result = $callback($data);
        if ($write) {
            $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
            $temp = tempnam($dir, 'save-');
            if (!$temp || file_put_contents($temp, $json) !== strlen($json)) fail('Your changes could not be saved. Please retry.', 503);
            @chmod($temp, 0600);
            if (!rename($temp, $path)) fail('Your changes could not be saved. Please retry.', 503);
            $temp = false;
        }
        return $result;
    } finally {
        if ($temp && is_file($temp)) @unlink($temp);
        flock($lock, LOCK_UN); fclose($lock);
    }
}
function secureRequest(): bool { return (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || ($_SERVER['SERVER_PORT'] ?? '') === '443' || strtolower($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https'; }
function startSession(): void {
    if (session_status() === PHP_SESSION_ACTIVE) return;
    ini_set('session.use_strict_mode', '1'); ini_set('session.use_only_cookies', '1');
    session_name('m4h_admin');
    session_set_cookie_params(['lifetime'=>0,'path'=>'/','secure'=>secureRequest(),'httponly'=>true,'samesite'=>'Strict']);
    if (!session_start()) fail('Your session could not be started. Please retry.', 503);
    if (!isset($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(32));
    if (isset($_SESSION['last_seen']) && time() - $_SESSION['last_seen'] > 7200) unset($_SESSION['admin_email']);
    $_SESSION['last_seen'] = time();
}
function checkWrite(): void {
    $host = strtolower($_SERVER['HTTP_HOST'] ?? '');
    if (!preg_match('/^[a-z0-9.\-:\[\]]+$/', $host)) fail('Invalid request.', 403);
    $expected = (secureRequest() ? 'https://' : 'http://') . $host;
    if (!hash_equals($expected, strtolower(rtrim($_SERVER['HTTP_ORIGIN'] ?? '', '/')))) fail('Please submit from this website.', 403);
    $token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (!is_string($token) || !hash_equals($_SESSION['csrf'], $token)) fail('Your session expired. Refresh the page and try again.', 403);
}
function adminRequired(): void { if (empty($_SESSION['admin_email'])) fail('Please sign in to manage the website.', 401); }
function textField(array $input, string $key, int $max, bool $required = true): string {
    $value = $input[$key] ?? '';
    if (!is_string($value)) fail('Invalid ' . $key . '.');
    $value = trim($value);
    if (($required && $value === '') || strlen($value) > $max || preg_match('/[\x00-\x08\x0B\x0C\x0E-\x1F]/', $value)) fail('Check the ' . $key . ' field and try again.');
    return $value;
}
function jsonInput(int $max = 16384): array {
    if (stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== 0) fail('Invalid submission format.', 415);
    $raw = file_get_contents('php://input', false, null, 0, $max + 1);
    if ($raw === false || strlen($raw) > $max) fail('Your submission is too large.', 413);
    try { $value = json_decode($raw, true, 32, JSON_THROW_ON_ERROR); } catch (JsonException $e) { fail('Invalid submission.'); }
    if (!is_array($value)) fail('Invalid submission.');
    return $value;
}
function emailAddress(string $value): string {
    $email = strtolower(trim($value));
    if (strlen($email) > 254 || !filter_var($email, FILTER_VALIDATE_EMAIL)) fail('Enter a valid email address.');
    return $email;
}
function rateLimit(string $action, int $maximum, int $seconds): void {
    $key = hash('sha256', $action . ':' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'));
    $allowed = state(true, function (&$data) use ($key, $maximum, $seconds) {
        $now = time();
        foreach ($data['limits'] as $k => $value) if ($value['until'] <= $now) unset($data['limits'][$k]);
        if (!isset($data['limits'][$key])) $data['limits'][$key] = ['count'=>0,'until'=>$now+$seconds];
        $data['limits'][$key]['count']++;
        return $data['limits'][$key]['count'] <= $maximum;
    });
    if (!$allowed) fail('Too many attempts. Please try again later.', 429);
}
function response(array $data, int $status = 200): void {
    http_response_code($status); header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store'); header('X-Content-Type-Options: nosniff');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR); exit;
}
function listing(string $type, int $page): array {
    if ($page < 1 || $page > 1000000) fail('Invalid page.');
    return state(false, function ($data) use ($type, $page) {
        $rows = array_values($data[$type]);
        usort($rows, fn($a, $b) => strcmp($b['created'], $a['created']) ?: strcmp($b['id'], $a['id']));
        return [$type=>array_slice($rows, ($page-1)*50, 50),'total'=>count($rows),'page'=>$page,'pageSize'=>50];
    });
}
