<?php
require_once './include/startup.php';
require_once DIR_LIB.'/User.php';
require_once DIR_LIB.'/Photo.php';

$user_idx = $_REQUEST['useridx'];
$email = $_REQUEST['email'];
$file = $_FILES['photo'];

## 인증 ##
if ( !$user_idx ) {
    $user_idx = User::mail_to_idx($email);
}

if ( !$user_idx ) {
    header('HTTP/1.1 400 Bad Request');
    echo json_encode(array('result' => false, 'text' => '인증 오류'));
    exit;
}

## 사진 등록 ##
$photo_idx = Photo::add($user_idx, $file, $warning);
if ( !$photo_idx ) {
    header('HTTP/1.1 400 Bad Request');
    echo $warning->json();
    exit;
}

$photo = new Photo($photo_idx);
echo json_encode($photo->to_array());
?>