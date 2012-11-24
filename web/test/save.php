<?php
require_once './include/startup.php';
require_once DIR_LIB.'/Photo.php';

$user_idx = $_POST['useridx'];
$title = '사진 타이틀 입니다.';
$file = $_FILES['photo'];

$photo_idx = Photo::add($user_idx, $title, $file, $warning);

if ( !$photo_idx ) {
    echo $warning->text;
}

$move_url = 'http://14.63.221.243/facechart/web/test/userphoto.php?photoidx='.$photo_idx;
header('Location: '.$move_url);
?>
