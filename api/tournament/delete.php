<?
require_once './include/startup.php';
require_once DIR_LIB.'/User.php';
require_once DIR_LIB.'/Tournament.php';

$user_idx = $_REQUEST['useridx'];
$email = $_REQUEST['email'];
$tournament_idx = $_REQUEST['tournamentidx'];
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

## 토너먼트 삭제 ##
$result = Tournament::remove($tournament_idx, $warning);
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