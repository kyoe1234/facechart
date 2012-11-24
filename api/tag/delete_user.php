<?
require_once './include/startup.php';
require_once DIR_LIB.'/User.php';
require_once DIR_LIB.'/TagRelation.php';

$user_idx = $_REQUEST['useridx'];
$email = $_REQUEST['email'];
$group_idx = $_REQUEST['groupidx'];
$callback = $_REQUEST['callback'];

## 인증 ##
if ( !$user_idx ) {
    $user_idx = User::mail_to_idx($email);
}

if ( !$user_idx ) {
    header('HTTP/1.1 400 Bad Request');
    echo json_encode(array('result' => false, 'text' => '인증 오류'));
    exit;
}

## 태그 삭제 ##
$result = TagRelation::remove($user_idx, TagRelation::FLAG_USER, $group_idx, $warning);
if ( !$result ) {
    header('HTTP/1.1 400 Bad Request');
    echo $warning->json();
    exit;
}

$json_data = json_encode(array('result' => true));
if ( $callback ) {
    echo $callback.'('.$json_data.')';
} else {
    echo $json_data;
}
?>