<?
require_once './include/startup.php';
require_once DIR_LIB.'/User.php';
require_once DIR_LIB.'/Tournament.php';

$user_idx = $_REQUEST['useridx'];
$email = $_REQUEST['email'];
$tournament_idx = $_REQUEST['tournamentidx'];
$title = $_REQUEST['title'];
$tag_idx_list = $_REQUEST['tagidx'];
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

## 토너먼트 수정 ##
$tag_idx_list = explode(',', $tag_idx_list);
$result = Tournament::modify($tournament_idx, $title, $tag_idx_list, $warning);
if ( !$result ) {
    header('HTTP/1.1 400 Bad Request');
    echo $warning->json();
    exit;
}

$tournament = new Tournament($tournament_idx);
$json_data = json_encode($tournament->to_array());
if ( $callback ) {
    echo $callback.'('.$json_data.')';
} else {
    echo $json_data;
}
?>