<?
require_once './include/startup.php';
require_once DIR_LIB.'/User.php';
require_once DIR_LIB.'/TagRelation.php';

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
$tag_name_list = explode(',', $tag_name);
$group_idx = TagRelation::add($user_idx, TagRelation::FLAG_HISTORY, $tag_name_list, $warning);
if ( !$group_idx ) {
    header('HTTP/1.1 400 Bad Request');
    echo $warning->json();
    exit;
}

$tag = new TagRelation($user_idx, TagRelation::FLAG_HISTORY, $group_idx);
$json_data = json_encode($tag->to_array());
if ( $callback ) {
    echo $callback.'('.$json_data.')';
} else {
    echo $json_data;
}
?>