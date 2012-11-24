<?
require_once './include/startup.php';
require_once DIR_LIB.'/PhotoComment.php';

$photo_idx = $_REQUEST['photoidx'];
$callback = $_REQUEST['callback'];

$idx_list = $g->db->fetch_col("
    SELECT idx FROM facechart.photocomment
    WHERE photoidx = {$photo_idx}
");

$comment_list = array();
foreach ( $idx_list as $idx ) {
    $photo_comment = new PhotoComment($idx);
    $comment_list[] = $photo_comment->to_array();
}

$json_data = json_encode($comment_list);
if ( $callback ) {
    echo $callback.'('.$json_data.')';
} else {
    echo $json_data;
}
?>

