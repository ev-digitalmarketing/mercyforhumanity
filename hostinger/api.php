<?php
declare(strict_types=1);
ini_set('display_errors', '0');
require __DIR__ . '/app/core.php';
try {
    $path = $_GET['route'] ?? parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    if (!is_string($path)) fail('Not found.', 404);
    if ($method === 'GET' && preg_match('#^/media/([a-f0-9]{32})$#', $path, $match)) {
        $media = state(false, fn($data) => $data['uploads'][$match[1]] ?? null);
        if (!$media) fail('Photo not found.', 404);
        $file = dataDirectory() . '/uploads/' . basename($media['file']);
        if (!is_file($file)) fail('Photo not found.', 404);
        header('Content-Type: ' . $media['mime']); header('X-Content-Type-Options: nosniff');
        header('Cache-Control: public, max-age=3600'); header('Content-Length: ' . filesize($file)); readfile($file); exit;
    }
    if ($path === '/api/content' && $method === 'GET') {
        $result = state(false, function ($data) { $result = []; foreach (['gallery','newsletters'] as $type) { $result[$type] = array_values($data[$type]); usort($result[$type], fn($a,$b)=>strcmp($b['created'],$a['created'])); } return $result; });
        if (!$result['newsletters']) $result['newsletters'][] = json_decode((string)file_get_contents(__DIR__.'/app/example-newsletter.json'), true, 32, JSON_THROW_ON_ERROR);
        response($result);
    }
    startSession();
    if ($path === '/api/me' && $method === 'GET') {
        $installed = state(false, fn($data) => !empty($data['admin']));
        $donation=configuration()['donation_url'] ?? '';
        if ($donation && (!filter_var($donation,FILTER_VALIDATE_URL) || !in_array(parse_url($donation,PHP_URL_SCHEME),['http','https'],true))) $donation='';
        response(['signedIn'=>!empty($_SESSION['admin_email']),'email'=>$_SESSION['admin_email'] ?? '', 'installed'=>$installed,'csrf'=>$_SESSION['csrf'],'donationUrl'=>$donation]);
    }
    if (!in_array($method, ['GET','POST','DELETE'], true)) fail('Method not allowed.', 405);
    if ($method !== 'GET') checkWrite();
    if ($path === '/api/setup' && $method === 'POST') {
        rateLimit('setup', 10, 900); $input = jsonInput(4096);
        if (!hash_equals(configuration()['installation_key'], textField($input, 'key', 100))) fail('The installation key is incorrect. Open config.php in your hosting File Manager to find it.', 403);
        $email = emailAddress(textField($input, 'email', 254)); $password = textField($input, 'password', 72);
        if (strlen($password) < 12) fail('Use a password of at least 12 characters.');
        $hash = password_hash($password, PASSWORD_DEFAULT);
        state(true, function (&$data) use ($email, $hash) { if ($data['admin']) fail('An admin account already exists. Please sign in.', 409); $data['admin'] = ['email'=>$email,'password'=>$hash]; return true; });
        session_regenerate_id(true); $_SESSION['admin_email']=$email; $_SESSION['csrf']=bin2hex(random_bytes(32)); response(['ok'=>true]);
    }
    if ($path === '/api/login' && $method === 'POST') {
        rateLimit('login', 10, 900); $input=jsonInput(4096);
        $email=emailAddress(textField($input,'email',254)); $password=textField($input,'password',72);
        $admin=state(false, fn($data)=>$data['admin']);
        if (!$admin || !hash_equals($admin['email'],$email) || !password_verify($password,$admin['password'])) fail('Email or password is incorrect.',401);
        session_regenerate_id(true); $_SESSION['admin_email']=$email; $_SESSION['csrf']=bin2hex(random_bytes(32)); response(['ok'=>true]);
    }
    if ($path === '/api/logout' && $method === 'POST') {
        $_SESSION=[]; session_regenerate_id(true); $_SESSION['csrf']=bin2hex(random_bytes(32)); response(['ok'=>true]);
    }
    if ($path === '/api/subscribe' && $method === 'POST') {
        rateLimit('subscribe',30,3600); $input=jsonInput(4096); $success=['message'=>'Thank you. You’re on our newsletter list.'];
        if (!empty($input['website'])) response($success);
        $email=emailAddress(textField($input,'email',254)); $name=textField($input,'name',100,false);
        if (($input['consent'] ?? false) !== true) fail('Please agree to receive the newsletter.');
        state(true,function (&$data) use ($email,$name) { $key=hash('sha256',$email); if (!isset($data['subscribers'][$key])) $data['subscribers'][$key]=['id'=>bin2hex(random_bytes(16)),'name'=>$name,'email'=>$email,'created'=>gmdate('c'),'consent_version'=>'newsletter-signup-v1']; return true; });
        response($success);
    }
    if (in_array($path,['/api/volunteer','/api/contact'],true) && $method === 'POST') {
        rateLimit('forms',20,3600); $input=jsonInput(16384); $type=$path==='/api/volunteer'?'volunteers':'messages';
        $success=['message'=>$type==='volunteers'?'Thank you. Your volunteer interest has been received.':'Thank you. Your message has been received.'];
        if (!empty($input['website'])) response($success);
        $row=['id'=>bin2hex(random_bytes(16)),'name'=>textField($input,'name',100),'created'=>gmdate('c')];
        if ($type==='volunteers') {
            $contact=textField($input,'contact',254); $digits=preg_replace('/\D/','',$contact);
            $phone=preg_match('/^[+0-9\s().-]+$/',$contact) && (strlen($digits)===10 || (strlen($digits)===11 && $digits[0]==='1'));
            if (!filter_var($contact,FILTER_VALIDATE_EMAIL) && !$phone) fail('Enter an email address or a Canadian phone number.');
            $row['contact']=$contact; $row['location']=textField($input,'location',150); $row['message']=textField($input,'message',4000,false);
        } else { $row['email']=emailAddress(textField($input,'email',254)); $row['subject']=textField($input,'subject',180); $row['message']=textField($input,'message',10000); }
        state(true,function (&$data) use ($type,$row) { $data[$type][$row['id']]=$row; return true; }); response($success,201);
    }
    adminRequired();
    if ($method==='GET' && in_array($path,['/api/subscribers','/api/volunteers','/api/messages'],true)) {
        $page=filter_var($_GET['page'] ?? '1',FILTER_VALIDATE_INT); if ($page===false) fail('Invalid page.');
        $type=substr($path,5); $result=listing($type,$page);
        if ($type==='subscribers') foreach ($result[$type] as &$row) unset($row['consent_version']);
        response($result);
    }
    if ($method==='POST' && in_array($path,['/api/gallery','/api/newsletters'],true)) {
        $type=substr($path,5); $title=textField($_POST,'title',180,$type==='newsletters'); $body=textField($_POST,'body',100000,$type==='newsletters');
        $file=$_FILES['photo'] ?? null;
        if (!$file || is_array($file['error']) || $file['error']!==UPLOAD_ERR_OK || $file['size']<1 || $file['size']>8*1024*1024 || !is_uploaded_file($file['tmp_name'])) fail('Choose a JPG, PNG, or WebP photo under 8 MB.');
        $image=@getimagesize($file['tmp_name']); $mime=$image['mime'] ?? ''; $extensions=['image/jpeg'=>'jpg','image/png'=>'png','image/webp'=>'webp'];
        if (!isset($extensions[$mime]) || $image[0]*$image[1]>60000000) fail('Choose a valid JPG, PNG, or WebP image up to 60 megapixels.');
        $folder=dataDirectory().'/uploads'; if (!is_dir($folder) && !@mkdir($folder,0700,true) && !is_dir($folder)) fail('The upload folder is not writable.',503);
        $id=bin2hex(random_bytes(16)); $media=bin2hex(random_bytes(16)); $filename=$media.'.'.$extensions[$mime]; $destination=$folder.'/'.$filename;
        if (!move_uploaded_file($file['tmp_name'],$destination)) fail('The photo could not be saved. Check hosting folder permissions.',503); @chmod($destination,0600);
        $item=['id'=>$id,'title'=>$type==='gallery'?'Gallery photo':$title,'body'=>$body,'image'=>'/api.php?route='.rawurlencode('/media/'.$media),'created'=>gmdate('c')];
        try { state(true,function (&$data) use ($type,$id,$media,$filename,$mime,$item) { $data[$type][$id]=$item; $data['uploads'][$media]=['file'=>$filename,'mime'=>$mime]; return true; }); } catch (Throwable $e) { @unlink($destination); throw $e; }
        response($item,201);
    }
    if ($method==='DELETE' && preg_match('#^/api/(gallery|newsletters)/([a-f0-9]{32})$#',$path,$match)) {
        $file=state(true,function (&$data) use ($match) { $type=$match[1]; $id=$match[2]; $item=$data[$type][$id] ?? null; if (!$item) return null; $query=[]; parse_str(parse_url($item['image'],PHP_URL_QUERY) ?? '',$query); $media=basename($query['route'] ?? ''); $file=$data['uploads'][$media]['file'] ?? null; unset($data[$type][$id],$data['uploads'][$media]); return $file; });
        if ($file) @unlink(dataDirectory().'/uploads/'.basename($file)); response(['ok'=>true]);
    }
    fail('Not found.',404);
} catch (SiteError $e) { response(['error'=>$e->getMessage()],$e->status); }
catch (Throwable $e) { error_log('Mercy for Humanity: '.$e->getMessage()); response(['error'=>'The request could not be completed. Check hosting storage permissions and try again.'],503); }
