<?
require_once './include/startup.php';
require_once DIR_LIB.'/User.php';
require_once DIR_LIB.'/Photo.php';
require_once DIR_LIB.'/PhotoComment.php';

$user_idx = $_REQUEST['useridx'];
$email = $_REQUEST['email'];
$limit_photo_idx = $_REQUEST['limitphotoidx'];
$limit = $_REQUEST['limit'] ? $_REQUEST['limit'] : 20;
$device_model = $_REQUEST['devicemodel'];
$callback = $_REQUEST['callback'];

// user_idx가 없으면 이메일로 찾아온다.
if ( !$user_idx ) {
    $user_idx = User::mail_to_idx($email);
}

## photo idx 목록 ##
$where = "WHERE useridx = {$user_idx}";
if ( $limit_photo_idx ) {
    $where .= " AND idx > {$limit_photo_idx}";
}

$photo_idx_list = $g->db->fetch_col("
    SELECT idx FROM facechart.photo
    {$where}
    ORDER BY idx DESC
    limit {$limit}
");

## 룸 목록 ##
// 룸 정보
$user = new User($user_idx);
$list = array(
    'roominfo' => array(
        'useridx' => $user->user_idx,
        'username' => $user->name,
        'email' => $user->email,
        'title' => $user->title,
        'mainphotourl' => $user->main_photo,
        'profilephotourl' => $user->profile_photo,
        'totalpoint' => $user->total_point,
    ),
    'contentlist' => array(),
);

// 룸 사진 목록
foreach ( $photo_idx_list as $photo_idx ) {
    // 댓글 데이터 생성
    $row_list = $g->db->fetch_all("
        SELECT * FROM facechart.photocomment
        WHERE photoidx = {$photo_idx}
        ORDER BY idx DESC
    ");

    $comment_list = array();
    foreach ( $row_list as $row ) {
        $comment_user = new User($row['useridx']);
        $comment_list[] = array(
            'useridx' => $comment_user->user_idx,
            'name' => $comment_user->name,
            'content' => $row['content'],
            'photourl' => $comment_user->profile_photo,
            'createdate' => $row['createdate'],
        );
    }

    // 룸 목록 생성
    $photo = new Photo($photo_idx);
    $list['contentlist'][] = array(
        'photoidx' => $photo->idx,
        'title' => $photo->title,
        'point' => $photo->point,
        'photourl' => $photo->photo['320'],
        'main' => $photo->main,
        'profile' => $photo->profile,
        'commentcnt' => count($comment_list),
        'createdate' => $photo->createdate,
        'comments' => $comment_list,
    );
}

$json_data = json_encode($list);
if ( $callback ) {
    echo $callback.'('.$json_data.')';
} else {
    echo $json_data;
}
?>
