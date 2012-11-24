<?
require_once './include/startup.php';
require_once DIR_LIB.'/User.php';
require_once DIR_LIB.'/Photo.php';
require_once DIR_LIB.'/Tournament.php';

// 게임 타임
$game_type = array(16 => '16강', 32 => '32강');

$tournament_idx = $_REQUEST['tournamentidx'];
$user_idx = $_REQUEST['useridx'];
$email = $_REQUEST['email'];
$type = in_array($_REQUEST['type'], $game_type) ? $_REQUEST['type'] : 16;
$device_model = $_REQUEST['devicemodel'];
$callback = $_REQUEST['callback'];

## 인증 ##
/*
 * brief 이상형 월드컵은 가입을 하지 않더라도 할 수 있다.
if ( !$user_idx ) {
    $user_idx = User::mail_to_idx($email);
}
*/

## 토너먼트 게임에 참가할 회원 목록 ##
$tournament = new Tournament($tournament_idx);

$tag_idx_list = array_keys($tournament->tag_list);
$tag_list = implode(',', $tag_idx_list);
$tag_count = count($tournament->tag_list);
$user_idx_list = $g->db->fetch_col("
    SELECT user_idx FROM facechart.TagRelation
    WHERE flag = 'user'
        AND tag_idx IN ({$tag_list})
    GROUP BY user_idx
        HAVING COUNT(user_idx) = {$tag_count};
");

// 참가자가 부족한지 확인
if ( count($user_idx_list) < $type ) {
    header('HTTP/1.1 400 Bad Request');
    echo json_encode(array('result' => false, 'text' => '참가자가 부족합니다.'));
    exit;
}

// 참가자를 무작위로 추출
$entry_user_idx_list = array();
while (1) {
    if (  count($entry_user_idx_list) >= $type ) break;

    $key = rand(0, $type - 1);
    if ( !in_array($user_idx_list[$key], $entry_user_idx_list) ) {
        $entry_user_idx_list[] = $user_idx_list[$key];
    }
}

// 참가자 목록 생성
$entry_list = array(
    'idx' => $tournament->idx,
    'title' => $tournament->title,
    'tag' => implode(',', $tournament->tag_list),
);

$user_list = array();
foreach ( $entry_user_idx_list as $user_idx ) {
    $photo_idx = $g->db->fetch_val("
        SELECT idx FROM facechart.photo
        WHERE useridx = {$user_idx}
            AND main = 'Y'
    ");
    $photo = new Photo($photo_idx);
    $photo = $photo->to_array();
    $user_list[] = array(
        'useridx' => $photo['useridx'],
        'useremail' => $photo['useremail'],
        'username' => $photo['username'],
        'photoidx' => $photo['idx'],
        'photourl' => $photo['photo']['320'],
    );
}

$entry_list['userlist'] = $user_list;
$json_data = json_encode($entry_list);
if ( $callback ) {
    echo $callback.'('.$json_data.')';
} else {
    echo $json_data;
}
?>
