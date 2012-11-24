<?
require_once './include/startup.php';
require_once DIR_LIB.'/User.php';
require_once DIR_LIB.'/PhotoComment.php';

$user_idx = $_REQUEST['useridx'];
$email = $_REQUEST['email'];
$photo_idx = $_REQUEST['photoidx'];
$content = $_REQUEST['content'];
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

## 덧글 추가 ##
$comment_idx = PhotoComment::add($user_idx, $photo_idx, $content, $warning);
if ( !$comment_idx ) {
    header('HTTP/1.1 400 Bad Request');
    echo $warning->json();
    exit;
}

$photo_comment = new PhotoComment($comment_idx);
$json_data = json_encode($photo_comment->to_array());
if ( $callback ) {
    echo $callback.'('.$json_data.')';
} else {
    echo $json_data;
}
?>