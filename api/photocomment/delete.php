<?
require_once './include/startup.php';
require_once DIR_LIB.'/User.php';
require_once DIR_LIB.'/PhotoComment.php';

$user_idx = $_REQUEST['useridx'];
$email = $_REQUEST['email'];
$comment_idx = $_REQUEST['commentidx'];
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


## 덧글 삭제 ##
$result = PhotoComment::remove($comment_idx, $user_idx, $warning);
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