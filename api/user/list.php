<?
require_once './include/startup.php';

$user_idx = $_REQUEST['useridx'];
$email = $_REQUEST['email'];
$device_model = $_REQUEST['device_model'];
$limit_photo_idx = $_REQUEST['limitphotoidx'];
$limit = $_REQUEST['limit'];
$callback = $_REQUEST['callback'];

$list = array (
    'roominfo' => array(
        'useridx' => '51',
        'username' => '김태진',
        'mainphotourl' => 'http://kyoe.blogcocktail.com/facechart/file/user/1/1_1339921734.jpg',
        'profilephotourl' => 'http://kyoe.blogcocktail.com/facechart/file/user/1/4_1339915848_80.jpg',
        'roomtitle' => '룸 타이틀 입니다.',
        'totalpoint' => 1024,
    ),
    'contentlist' => array(
        array(
            'photoidx' => 17,
            'title' => '두번째 사진 제목 입니다.',
            'point' => 70,
            'photourl' => 'http://kyoe.blogcocktail.com/facechart/file/user/1/1_1339921734.jpg',
            'commentcnt' => 3,
            'createdate' => '2012-06-17 17:30:11',
            'comments' => array(
                array(
                    'useridx' => 4,
                    'name' => '제시카',
                    'content' => '저녁 뭐먹지?',
                    'photourl' => 'http://kyoe.blogcocktail.com/facechart/file/user/1/4_1339915848_80.jpg',
                    'createdate' => '2012-06-17 17:31:11',
                ),
                array(
                    'useridx' => 5,
                    'name' => '수지',
                    'content' => '소연도 이쁘긴 하네? ㅎㅎ',
                    'photourl' => 'http://kyoe.blogcocktail.com/facechart/file/user/1/5_1339915898_80.jpg',
                    'createdate' => '2012-06-17 17:32:11',
                ),
                array(
                    'useridx' => 6,
                    'name' => '현아',
                    'content' => '이거까지만 하면 끝!',
                    'photourl' => 'http://kyoe.blogcocktail.com/facechart/file/user/1/6_1339915921_80.jpg',
                    'createdate' => '2012-06-17 17:33:11',
                ),
            ),
        ),
        array(
            'photoidx' => 1,
            'title' => '사진 제목 입니다.',
            'point' => 120,
            'photourl' => 'http://kyoe.blogcocktail.com/facechart/file/user/1/1_1339915656.jpg',
            'commentcnt' => 2,
            'createdate' => '2012-06-17 17:23:11',
            'comments' => array(
                array(
                    'useridx' => 2,
                    'name' => '태연',
                    'content' => '피곤하다 피곤해 ㅠㅠ',
                    'photourl' => 'http://kyoe.blogcocktail.com/facechart/file/user/1/2_1339915668_80.jpg',
                    'createdate' => '2012-06-17 17:25:11',
                ),
                array(
                    'useridx' => 3,
                    'name' => '아이유',
                    'content' => '페이스 차트 대박!!',
                    'photourl' => 'http://kyoe.blogcocktail.com/facechart/file/user/1/3_1339915783_80.jpg',
                    'createdate' => '2012-06-17 17:27:11',
                ),
            ),
        ),
    ),
);

$json_data = json_encode($list);
if ( $callback ) {
    echo $callback.'('.$json_data.')';
} else {
    echo $json_data;
}
?>
