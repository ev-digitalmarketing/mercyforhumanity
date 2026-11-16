<?php
declare(strict_types=1);
// Run with `php scripts/test-hostinger.php` after building the Hostinger package.
require dirname(__DIR__).'/outputs/hostinger-package/app/core.php';
function check(bool $condition,string $message): void { if (!$condition) throw new RuntimeException($message); }
$directory=dirname(__DIR__).'/outputs/php-test-'.bin2hex(random_bytes(8));
putenv('M4H_TEST_DATA_DIR='.$directory);
try {
    check(emailAddress(' AMINA@EXAMPLE.COM ')==='amina@example.com','Email normalization');
    try { emailAddress('invalid'); throw new RuntimeException('Invalid email accepted'); } catch (SiteError $e) { check($e->status===400,'Email validation'); }
    check(state(false,fn($data)=>$data['admin'])===null,'Fresh storage');
    state(true,function (&$data) { for($i=0;$i<53;$i++) $data['subscribers'][(string)$i]=['id'=>(string)$i,'name'=>'Test','email'=>'member'.$i.'@example.com','created'=>'2026-11-16T00:00:00Z']; return true; });
    check(count(listing('subscribers',1)['subscribers'])===50,'First page');
    check(count(listing('subscribers',2)['subscribers'])===3,'Second page');
    check(is_file($directory.'/state.json'),'Persistent file');
    $password='A long test passphrase';check(password_verify($password,password_hash($password,PASSWORD_DEFAULT)),'Password hashing');
    $_SESSION=['csrf'=>str_repeat('a',64)];$_SERVER['HTTP_HOST']='mercy.test';$_SERVER['HTTP_ORIGIN']='http://mercy.test';$_SERVER['HTTP_X_CSRF_TOKEN']=$_SESSION['csrf'];checkWrite();
    $_SERVER['HTTP_X_CSRF_TOKEN']='wrong';try{checkWrite();throw new RuntimeException('Invalid CSRF accepted');}catch(SiteError $e){check($e->status===403,'CSRF check');}
    try{adminRequired();throw new RuntimeException('Anonymous admin allowed');}catch(SiteError $e){check($e->status===401,'Admin guard');}
    $_SESSION['admin_email']='owner@example.com';adminRequired();
    foreach(glob(dirname(__DIR__).'/outputs/hostinger-package/assets/*.jpg') as $photo)check((getimagesize($photo)['mime'] ?? '')==='image/jpeg','Image validation');
    echo "Passed PHP storage, pagination, password hashing, CSRF, admin guard, and image checks.\n";
} finally {
    foreach(glob($directory.'/*') ?: [] as $file)unlink($file);
    if(is_dir($directory))rmdir($directory);
}
