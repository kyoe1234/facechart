<?php
require_once DIR_LIB.'/User.php';
require_once DIR_LIB.'/Photo.php';

/**
 * @brief 댓글
 */
class PhotoComment {
    /**
     * @brief 추가
     * @param $user_idx int facechart.user.idx
     * @param $photo_idx int facechart.photo.idx
     * @param $content string 내용
     * @param $warning object Warning 객체 참조
     * @return int facechart.photocomment.id
     */
    public static function add($user_idx, $photo_idx, $content, &$warning = null) {
        global $g;

        $result = User::exists($user_idx);
        if ( !$result ) {
            return Warning::make($warning, false, 'user', '로그인이 필요한 서비스 입니다.');
        }

        $photo = new Photo($photo_idx);
        if ( !$photo->idx ) {
            return Warning::make($warning, 0, 'photo', '사진을 찾을 수 없습니다.');
        }

        if ( !preg_match('/[^\s]/', $content) ) {
            return Warning::make($warning, 0, 'content', '내용을 확인해주세요.');
        }

        $g->db->begin();

        // 댓글 등록
        $g->db->query("
            INSERT facechart.photocomment SET
                useridx = '{$user_idx}',
                photoidx = '{$photo_idx}',
                content = '{$content}',
                createdate = NOW()
        ");

        $insert_id = (int)$g->db->insert_id();

        // 댓글수 갱신
        $result = self::update_count($user_idx);
        if ( !$result ) {
            $g->db->rollback();
            return Warning::make($warning, 0, 'update', '댓글 등록 실패');
        }

        $g->db->commit();

        return Warning::make($warning, $insert_id);
    }

    /**
     * @brief 삭제
     * @param $comment_idx int facechart.photocomment.idx
     * @param $user_idx int facechart.user.idx
     * @param $warning object Warning 객체 참조
     * @return boolean
     */
    public static function remove($comment_idx, $user_idx, &$warning = null) {
        global $g;

        $comment = new self($comment_idx);
        if ( !$comment->idx ) {
            return Warning::make($warning, true);
        }

        if ( $comment->useridx != $user_idx ) {
            return Warning::make($warning, false, 'owner', '작성자가 다릅니다.');
        }

        $g->db->begin();

        $g->db->query("
            DELETE FROM facechart.photocomment
            WHERE idx = {$comment_idx}
        ");

        // 댓글수 갱신
        $result = self::update_count($user_idx, $warning);
        if ( !$result ) {
            $g->db->rollback();
            return $warning->remake(false);
        }

        $g->db->commit();

        return Warning::make($warning, true);
    }

    /**
     * @brief 댓글수 갱신
     * @param $user_idx int facechart.user.idx
     * @param $warning object Warning 객체 참조
     * @return boolean
     */
    public static function update_count($user_idx, &$warning  = null) {
        global $g;

        $result = User::exists($user_idx);
        if ( !$result ) {
            return Warning::make($warning, false, 'user', '존재하지 않는 회원입니다.');
        }

        // 오늘 댓글 수
        $today_start = date('Y-m-d 00:00:00', time());
        $today_end = date('Y-m-d 23:59:59', time());

        $today_cnt = $g->db->fetch_val("
            SELECT count(*) FROM facechart.photocomment
            WHERE createdate BETWEEN '{$today_start}' AND '{$today_end}'
        ");

        // 총 댓글 수
        $total_cnt = $g->db->fetch_val("
            SELECT count(*) FROM facechart.photocomment
            WHERE useridx = {$user_idx}
        ");

        // 댓글 수 갱신
        $g->db->query("
            UPDATE facechart.User SET
                today_comment = '{$today_cnt}',
                total_comment = '{$total_cnt}'
            WHERE user_idx = {$user_idx}
        ");

        return Warning::make($warning, true);
    }
    /**
     * @brief 생성자
     * @param $comment_idx int facechart.photocomment.idx
     */
    public function __construct($comment_idx) {
        global $g;

        $row = $g->db->fetch_row("
            SELECT * FROM facechart.photocomment
            WHERE idx = '{$comment_idx}'
        ");
        foreach ( $row as $k => $v ) {
            $this->$k = $v;
        }
    }

    /**
     * @brief 배열 형태
     * @return array
     */
    public function to_array() {
        global $g;

        $roomuseridx = $g->db->fetch_val("
            SELECT useridx FROM facechart.photo
            WHERE idx = {$this->photoidx}
        ");

        return array(
            'idx' => $this->idx,
            'photoidx' => $this->photoidx,
            'useridx' => $this->useridx,
            'content' => $this->content,
            'roomuseridx' => $roomuseridx,
            'createdate' => $this->createdate,
        );
    }
}
?>
