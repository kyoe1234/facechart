<?
require_once './include/startup.php';
require_once DIR_LIB.'/Photo.php';

$photo_idx = $_REQUEST['photoidx'];
$callback = $_REQUEST['callback'];

## 사진 데이터 ##
$photo = new Photo($photo_idx);
if ( !$photo->idx ) {
    header('HTTP/1.1 400 Bad Request');
    echo $warning->json();
    exit;
}

$json_data = json_encode($photo->to_array());
if ( $callback ) {
    echo $callback.'('.$json_data.')';
} else {
    echo $json_data;
}
?>
