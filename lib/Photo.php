<?php
require_once DIR_LIB.'/User.php';

/**
 * @brief 포토
 */
class Photo {
    /** @brief JPEG 화질 */
    const JPEG_QUALITY = 60;

    /** @brief 사진 크기 종류 */
    private static $size_list = array(90, 160, 320, 640);

    /**
     * @brief useridx에 따른 그룹번호를 반환한다.
     * @param $user_idx int facechart.photo.useridx
     * @return int
     */
    private static function group_number($user_idx) {
        if ( !preg_match('/^[1-9][0-9]*$/', $user_idx) ) return 0;
        return ceil($user_idx / 1000);
    }

    /**
     * @brief 파일 디렉터리 경로를 반환
     * @param $user_idx int facechart.photo.useridx
     * @return string
     */
    private static function file_dir($user_idx) {
        $group = self::group_number($user_idx);
        return DIR_FILE.'/user/'.$group;
    }

    /**
     * @brief 파일 URL을 반환
     * @param $user_idx int facechart.photo.useridx
     * @return string
     */
    private static function file_url($user_idx) {
        $group = self::group_number($user_idx);
        return URL_FILE.'/user/'.$group;
    }

    /**
     * @brief 메인 사진을 선택한다.
     * @param $photo_idx int facechart.photo.idx
     * @param $user_idx int facechart.User.user_idx
     * @param $warning object Warning 객체 참조
     * @return boolean
     */
    public static function select_main($photo_idx, $user_idx, &$warning = null) {
        global $g;

        $photo = new self($photo_idx);
        if ( $photo->useridx != $user_idx ) {
            return Warning::make($warning, false, 'select', '자신의 사진만 선택 가능합니다.');
        }

        // 회원의 모든 사진을 'N'
        $g->db->query("
            UPDATE facechart.photo SET
                main = 'N'
            WHERE useridx = {$user_idx}
        ");

        // 선택한 사진만 'Y'
        $g->db->query("
            UPDATE facechart.photo SET
                main = 'Y'
            WHERE idx = {$photo_idx}
                AND useridx = {$user_idx}
        ");

        return Warning::make($warning, true);
    }

    /**
    * @brief 프로필 사진을 선택한다.
    * @param $photo_idx int facechart.photo.idx
    * @param $user_idx int facechart.User.user_idx
    * @param $warning object Warning 객체 참조
    * @return boolean
    */
    public static function select_profile($photo_idx, $user_idx, &$warning = null) {
        global $g;

        $photo = new self($photo_idx);
        if ( $photo->useridx != $user_idx ) {
            return Warning::make($warning, false, 'user', '자신의 사진만 선택 가능합니다.');
        }

        // 회원의 모든 사진을 'N'
        $g->db->query("
            UPDATE facechart.photo SET
                profile = 'N'
            WHERE useridx = {$user_idx}
        ");

        // 선택한 사진만 'Y'
        $g->db->query("
            UPDATE facechart.photo SET
                profile = 'Y'
            WHERE idx = {$photo_idx}
                AND useridx = {$user_idx}
        ");

        return Warning::make($warning, true);
    }


    /**
     * @brief 자동으로 메인 사진을 선택한다.
     * @param $user_idx int facechart.User.user_idx
     * @param $warning object Warning 객체 참조
     * @return boolean
     */
    private static function auto_select_main($user_idx, &$warning = null) {
        global $g;

        $result = User::exists($user_idx);
        if ( !$result ) {
            return Warning::make($warning, false, 'user', '로그인이 필요한 서비스 입니다.');
        }

        // 회원의 전체 사진
        $row_list = $g->db->fetch_all("
            SELECT idx, main FROM facechart.photo
            WHERE useridx = {$user_idx}
            ORDER BY idx ASC
        ");
        if ( !$row_list ) {
            return Warning::make($warning, true);
        }

        foreach ( $row_list as $row ) {
            // 메인이 존재하면
            if ( $row['main'] == 'Y' ) {
                return Warning::make($warning, true);
            }
        }

        $result = self::select_main($row_list[0]['idx'], $user_idx, $warning);
        if ( !$result ) {
            return $warning->remake(false);
        }

        return Warning::make($warning, true);
    }

    /**
     * @brief 추가
     * @param $user_idx facechart.User.user_idx
     * @param $title string 사진 타이틀
     * @param $file FILE 이미지 파일
     * @param $warning object Warning 객체 참조
     * @return int facechart.photo.idx
     */
    public static function add($user_idx, $title, $file, &$warning = null) {
        global $g;

        $result = User::exists($user_idx);
        if ( !$result ) {
            return Warning::make($warning, false, 'user', '로그인이 필요한 서비스 입니다.');
        }

        if ( !preg_match("/[^\s]+/su", $title) ) {
            return Warning::make($warning, 0, 'title', '사진 설명을 입력해 주세요.');
        }

        $image_path = $file['tmp_name'];

        // 파일 디렉토리
        $file_dir = self::file_dir($user_idx);
        if ( !is_dir($file_dir) ) {
            if ( !mkdir($file_dir, 0777, true) ) {
                return Warning::make($warning, 0, 'mkdir', '디렉토리 생성 오류');
            }
        }

        // 저장 경로
        $time = time();
        $save_path = $file_dir."/{$user_idx}_{$time}.jpg";

        ## 원본 저장 ##
        $mime_type = mime_content_type($image_path);
        if ( $mime_type == 'image/jpeg' ) {
            $result = rename($image_path, $save_path);
            if ( !$result ) {
                $result = copy($image_path, $save_path);
            }

            if ( !$result ) {
                return Warning::make($warning, 0, 'move_origin', '원본 이동 오류');
            }

            chmod($save_path, 0644);
        } else {
            // 원본 소스
            $origin_img = self::create_image_resource($image_path);
            if ( !$origin_img ) {
                return Warning::make($warning, 0, 'origin_resource', '원본 리소스 생성 오류');
            }

            $result = imagejpeg($origin_img, $save_path, self::JPEG_QUALITY);
            if ( !$result ) {
                return Warning::make($warning, 0, 'save_origin', '원본 저장 오류');
            }
        }

        ## 섬네일 생성 ##
        $result = self::make_thumb($user_idx, $time, $warning);
        if ( !$result ) {
            return $warning->remake(0);
        }

        $g->db->begin();

        // db 등록
        $title = $g->db->escape($title);
        $createdate = date('Y-m-d H:i:s', $time);
        $sql = "INSERT facechart.photo SET
                useridx = '{$user_idx}',
                title = '{$title}',
                point = 0,
                createdate = '{$createdate}'";
        $g->db->query($sql);
        $insert_id = (int)$g->db->insert_id();

        // 메인 사진 자동선택
        $result = self::auto_select_main($user_idx, $warning);
        if ( !$result ) {
            $g->db->rollback();
            return $warning->remake(0);
        }

        $g->db->commit();

        return Warning::make($warning, $insert_id);
    }

    /**
     *@brief 이미지 삭제
     *@param $photo int tset.photo.idx
     *@param $user_idx facechart.User.user_idx
     *@param $warning object Warning 객체 참조
     *@return boolean
     */
    public static function remove($photo_idx, $user_idx, &$warning = null) {
        global $g;

        if ( !preg_match('/^[1-9][0-9]*$/', $photo_idx) ) {
            return Warning::make($warning, false, 'photoidx', '존재하지 않는 이미지 입니다.');
        }

        $photo = new self($photo_idx);
        if ( $photo->useridx != $user_idx ) {
            return Warning::make($warning, false, 'useridx', '자신의 사진만 삭제 가능합니다.');
        }
        // db 삭제
        $result = $g->db->query("
            DELETE FROM facechart.photo
            WHERE idx = {$photo_idx}
        ");

        if ( !$result ) {
             return Warning::make($warning, false, 'remove error', '삭제 실패');
        }

        // 이미지 파일 삭제
        foreach ( $photo->photo_file as $file ) {
            exec("rm {$file}");
        }

        return Warning::make($warning, true);
    }

    /**
     * @brief 이미지 파일에 해당하는 GD 이미지 리소스를 생성하여 반환한다.
     * @param $image_path string 이미지 파일 경로(Local 또는 URL)
     * @return resource GD 이미지 리소스, 지원하지 않는 이미지 파일은 null 반환
     */
    private static function create_image_resource($image_path) {
        $mime = mime_content_type($image_path);

        // png, jpg, gif, bmp만 지원
        switch ( $mime ) {
            case 'image/png':
                return imagecreatefrompng($image_path);
            case 'image/jpeg':
                return imagecreatefromjpeg($image_path);
            case 'image/gif':
                return imagecreatefromgif($image_path);
            case 'image/bmp':
                return imagecreatefromwbmp($image_path);
            default:
                return null;
        }
    }

    /**
     * @brief 이미지를 정사각형으로 리사이즈 하여 반환한다.
     * @param $image resource GD 이미지 리소스
     * @param $size int 크기
     * @return resource GD 이미지 리소스
     */
    private static function square_resize($image, $size) {
        $img_w = imagesx($image);
        $img_h = imagesy($image);

        // 가로와 세로중 더 작은 쪽을 기준으로 복사 범위를 계산한다.
        if ( $img_w < $img_h ) {
            $src_w = $img_w;
            $src_h = $img_w;
            $src_x = 0;
            $src_y = ($img_h - $img_w) / 2;
        } else {
            $src_w = $img_h;
            $src_h = $img_h;
            $src_x = ($img_w - $img_h) / 2;
            $src_y = 0;
        }

        // 새 이미지
        $resize_image = imagecreatetruecolor($size, $size);
        // 원본에서 새 이미지로 리사이즈
        $result = imagecopyresampled($resize_image, $image, 0, 0, $src_x, $src_y, $size, $size, $src_w, $src_h);
        if ( !$result ) return null;

        return $resize_image;
    }

    /**
     * @brief 섬네일을 만든다.
     * @warning 섬네일을 재생성 하고 싶을때도 사용
     * @param $user_idx int facechart.User.user_idx
     * @param $time int time()
     * @param $warning object Warning 객체 참조
     * @return boolean
     */
    public static function make_thumb($user_idx, $time, &$warning = null) {
        $file_dir = self::file_dir($user_idx);

        // 원본 사진
        $file_path = $file_dir."/{$user_idx}_{$time}.jpg";
        if ( !is_file($file_path) ) {
            return Warning::make($warning, false, 'origin_file', '원본을 찾을 수 없음.');
        }

        // 원본 소스
        $origin_img = self::create_image_resource($file_path);
        if ( !$origin_img ) {
            return Warning::make($warning, false, 'origin_resource', '원본 리소스 생성 오류');
        }

        ## 섬네일 생성 ##
        foreach ( self::$size_list as $size ) {
            // 섬네일 저장 경로
            $thumb_path = preg_replace('/\.[^.]+$/', "_{$size}$0", $file_path);

            $thumb_img = self::square_resize($origin_img, $size);
            if ( !$thumb_img ) {
                return Warning::make($warning, false, 'resize_thumb', '섬네일 리사이즈 오류');
            }

            $result = imagejpeg($thumb_img, $thumb_path, self::JPEG_QUALITY);
            if ( !$result ) {
                return Warning::make($warning, false, 'save_thumb', '섬네일 저장 오류');
            }
        }

        return Warning::make($warning, true);
    }

    /**
     * @brief 포인트 추가
     * @param $photo_idx int facechart.photo.idx
     * @param $actor_idx int facechart.User.user_idx (포인트를 주는 회원)
     * @param $point int 포인트
     * @param $warning object Warning 객체 참조
     * @return boolean
     */
    public static function add_point($photo_idx, $actor_idx, $point, &$warning = null) {
        global $g;

        $photo = new self($photo_idx);
        if ( !$photo->idx ) {
            return Warning::make($warning, false, 'photo', '사진을 찾을 수 없습니다.');
        }

        $result = User::exists($actor_idx);
        if ( !$result ) {
            return Warning::make($warning, false, 'user', '로그인이 필요한 서비스 입니다.');
        }

        if ( !preg_match('/^[1-9][0-9]*$/', $point) ) {
            return Warning::make($warning, false, 'point', '잘못된 포인트 입니다.');
        }

        $g->db->begin();

        $g->db->query("
            INSERT facechart.photopoint SET
                photoidx = '{$photo->idx}',
                useridx = '{$photo->useridx}',
                actor = '{$actor_idx}',
                point = '{$point}',
                createdate = NOW()
        ");

        $result = self::update_point($photo->idx, $warning);
        if ( !$result ) {
            $g->db->rollback();
            return $warning->remake(false);
        }

        $g->db->commit();

        return Warning::make($warning, true);
    }

    /**
     * @brief 포인트 갱신
     * @param $photo_idx int facechart.photo.idx
     * @param $warning object Warning 객체 참조
     * @return boolean
     */
    public static function update_point($photo_idx, &$warning = null) {
        global $g;

        $photo = new self($photo_idx);
        if ( !$photo->idx ) {
            return Warning::make($warning, false, 'photo', '사진을 찾을 수 없습니다.');

        }

        // 오늘의 포인트
        $today_start = date('Y-m-d 00:00:00', time());
        $today_end = date('Y-m-d 23:59:59', time());

        $today_point = $g->db->fetch_val("
            SELECT sum(point) FROM facechart.photopoint
            WHERE createdate BETWEEN '{$today_start}' AND '{$today_end}'
        ");

        // 총 포인트
        $total_point = $g->db->fetch_val("
            SELECT sum(point) FROM facechart.photopoint
            WHERE useridx = {$photo->useridx}
        ");

        // 포인트 갱신
        $g->db->query("
            UPDATE facechart.User SET
                today_point = {$today_point},
                total_point = {$total_point}
            WHERE user_idx = {$photo->useridx}
        ");

        return Warning::make($warning, true);
    }

    /**
     * @brief 생성자
     * @param $idx int facechart.photo.idx
     */
    public function __construct($photo_idx) {
        global $g;

        if ( !preg_match('/^[1-9][0-9]*$/', $photo_idx) ) {
            $row = array();
        } else {
            $row = $g->db->fetch_row("
                SELECT * FROM facechart.photo
                WHERE idx = {$photo_idx}
            ");
        }

        foreach ( $row as $k => $v ) {
            $this->$k = $v;
        }

        // 사진 파일
        $file_url = self::file_url($this->useridx);
        $file_dir = self::file_dir($this->useridx);

        $time = strtotime($this->createdate);

        // 원본 사진
        $this->photo[0] = $file_url."/{$this->useridx}_{$time}.jpg";
        $this->photo_file[0] = $file_dir."/{$this->useridx}_{$time}.jpg";

        // 섬네일
        foreach ( self::$size_list as $size ) {
            $filename = "{$this->useridx}_{$time}_{$size}.jpg";
            $this->photo[$size] = $file_url.'/'.$filename;
            $this->photo_file[$size] = $file_dir.'/'.$filename;
        }
    }

    /**
     * @brief 배열형태
     * @return array
     */
    public function to_array() {
        global $g;

        $user = $g->db->fetch_row("
            SELECT * FROM facechart.User
            WHERE user_idx = {$this->useridx}
        ");

        $data = array(
            'idx' => $this->idx,
            'useridx' => $this->useridx,
            'username' => $user['name'],
            'useremail' => $user['email'],
            'title' => $this->title,
            'point' => $this->point,
            'photo' => $this->photo,
            'createdate' => $this->createdate
        );
        return $data;
    }
}
?>
