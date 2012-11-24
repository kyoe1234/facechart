<?
require_once './include/startup.php';
require_once DIR_LIB.'/Tournament.php';

$callback = $_REQUEST['callback'] ? $_REQUEST['callback'] : '';

## 토너먼트 목록 ##
$tournament_idx_list = $g->db->fetch_col("
    SELECT idx FROM facechart.tournament
");

$list = array();
foreach ( $tournament_idx_list as $tournament_idx ) {
    $tournament = new Tournament($tournament_idx);
    $tag = implode(',', $tournament->tag_list);
    $list[] = array(
        'tournamentidx' => $tournament->idx,
        'title' => $tournament->title,
        'tag' => $tag,
    );
}

$json_data = json_encode($list);
if ( $callback ) {
    echo $callback.'('.$json_data.')';
} else {
    echo $json_data;
}
?>
