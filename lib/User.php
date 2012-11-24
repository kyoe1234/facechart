<?php
require_once DIR_LIB.'/Photo.php';

/**
 * @brief 회원
 */
class User {
    /**
     * @brief 존재하는 회원의 idx인지 여부
     * @param $user_idx int facechart.User.user_idx
     * @return boolean
     */
    public static function exists($user_idx) {
        global $g;

        $user_idx = $g->db->fetch_val("
            SELECT user_idx FROM facechart.User
            WHERE user_idx = {$user_idx}
        ");

        return $user_idx ? true : false;
    }

    /**
     * @brief 메일에 해당하는 useridx 반환
     * @param $email string 이메일
     * @return int facechart.User.user_idx
     */
    public static function mail_to_idx($email) {
        global $g;

        $email_regexp = "/^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/";
        if ( !preg_match($email_regexp, $email) ) {
            return 0;
        }

        $user_idx = $g->db->fetch_val("
            SELECT user_idx FROM facechart.User
            WHERE email = '{$email}'
        ");

        return $user_idx;
    }

    /**
     * @brief 메인사진
     * @param $user_idx int facechart.User.user_idx
     * @return string 사진 url
     */
    private static function main_photo($user_idx) {
        global $g;

        $default_photo = URL_FILE.'/user/1/100_1341424086_90.jpg';

        if ( !self::exists($user_idx) ) return $default_photo;

        $photo_idx = $g->db->fetch_val("
            SELECT idx FROM facechart.photo
            WHERE useridx = {$user_idx}
                AND main = 'Y'
        ");
        $photo = new Photo($photo_idx);

        return $photo->photo['320'] ? $photo->photo['320'] : $default_photo;
    }

    /**
     * @brief 프로필사진
     * @param $user_idx int facechart.User.user_idx
     * @return string 사진 url
     */
    private  static function profile_photo($user_idx) {
        global $g;

        $default_photo = URL_FILE.'/user/1/100_1341424086_90.jpg';

        if ( !self::exists($user_idx) ) return $default_photo;

        $photo_idx = $g->db->fetch_val("
            SELECT idx FROM facechart.photo
            WHERE useridx = {$user_idx}
                AND profile = 'Y'
        ");

        if ( !$photo_idx ) {
            $photo_idx = $g->db->fetch_val("
                SELECT idx FROM facechart.photo
                WHERE useridx = {$user_idx}
                ORDER BY useridx DESC
                LIMIT 1;
            ");
        }

        $photo = new Photo($photo_idx);

        return $photo->photo['90'] ? $photo->photo['90'] : $default_photo;
    }

    /**
     * @brief 생성자
     */
    public function __construct($user_idx) {
        global $g;

        if ( !preg_match('/^[1-9][0-9]*$/', $user_idx) ) {
            $row = array();
        } else {
            $row = $g->db->fetch_row("
                SELECT * FROM facechart.User
                WHERE user_idx = {$user_idx}
            ");
        }

        foreach ( $row as $k => $v ) {
            $this->$k = $v;
        }

        // 메인사진과 프로필사진
        $this->main_photo = self::main_photo($user_idx);
        $this->profile_photo = self::profile_photo($user_idx);
    }
}
?>