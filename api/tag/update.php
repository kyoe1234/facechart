<?
require_once './include/startup.php';
require_once DIR_LIB.'/User.php';
require_once DIR_LIB.'/Tag.php';

$user_idx = $_REQUEST['useridx'];
$email = $_REQUEST['email'];
$tag_name = $_REQUEST['tagname'];
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

## 태그 추가 ##
$tag_idx = Tag::add($tag_name, $warning);
if ( !$tag_idx ) {
    header('HTTP/1.1 400 Bad Request');
    echo $warning->json();
    exit;
}

$tag = new Tag($tag_idx);
$json_data = json_encode($tag->to_array());
if ( $callback ) {
    echo $callback.'('.$json_data.')';
} else {
    echo $json_data;
}
?>