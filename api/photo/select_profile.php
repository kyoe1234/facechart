<?
require_once './include/startup.php';
require_once DIR_LIB.'/User.php';
require_once DIR_LIB.'/Photo.php';

$user_idx = $_REQUEST['useridx'];
$email = $_REQUEST['email'];
$photo_idx = $_REQUEST['photoidx'];

## 인증 ##
if ( !$user_idx ) {
    $user_idx = User::mail_to_idx($email);
}

if ( !$user_idx ) {
    header('HTTP/1.1 400 Bad Request');
    echo json_encode(array('result' => false, 'text' => '인증 오류'));
    exit;
}

## 프로필 사진 선택 ##
$result = Photo::select_profile($photo_idx, $user_idx, $warning);
if ( !$result ) {
    header('HTTP/1.1 400 Bad Request');
    echo $warning->json();
    exit;
}

echo json_encode(array('result' => true));
?>
