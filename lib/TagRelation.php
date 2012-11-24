<?php
require_once DIR_LIB.'/User.php';
require_once DIR_LIB.'/Tag.php';

class TagRelation {
    const FLAG_USER = 'user';
    const FLAG_FAVORITE = 'favorite';
    const FLAG_HISTORY = 'history';
    const MAX_HISTORY = 5;
    const MAX_FAVORITE = 5;

    /**
     * @brief 플래그 체크
     * @param $useridx int facechart.User.useridx
     * @param $flag string 태그 유형 (user|favorite|history)
     * @param $warning object Warning 객체 참조
     * @return boolean
     */
    private static function check_flag($user_idx, $flag, &$warning = null) {
        global $g;

        if ( !preg_match("/[^\s]+/su", $flag) ) {
            return Warning::make($warning, false, 'name', '잘못된 유형 입니다.');
        }

        // 플래그가 user 이면 무조건 true
        if (  $flag == self::FLAG_USER ) {
            return Warning::make($warning, true);
        }

        // 해당 플래그의 태그 그룹 갯수를 가져온다.
        $cnt = $g->db->fetch_val("
            SELECT count(*) FROM facechart.TagRelation
            WHERE user_idx = {$user_idx}
                AND flag = '{$flag}'
            GROUP BY group_idx
        ");

        // 북마크는 최대 5개까지 등록 가능하다.
        if ( $flag == self::FLAG_FAVORITE && $cnt >= self::MAX_FAVORITE ) {
            return Warning::make($warning, false, 'max_favorite', '북마크는 최대 '.self::MAX_FAVORITE.'개 입니다.');
        }

        // 히스토리의 최대 등록 갯수 보다 많으면 가장 오래된 태그 그룹 삭제
        if ( $flag == self::FLAG_HISTORY && $cnt >= self::MAX_HISTORY ) {
            $group_idx = $g->db->fetch_val("
                SELECT group_idx FROM facechart.TagRelation
                WHERE user_idx = {$user_idx}
                    AND flag = '{flag}'
                ORDER BY group_idx DESC
            ");

            $g->db->query("
                DELETE FROM facechart.TagRelation
                WHERE user_idx = {$user_idx}
                    AND flag = '{$flag}'
                    AND group_idx = {$group_idx}
            ");
        }

        return Warning::make($warning, true);
    }

    /**
     * @brief 태그 추가
     * @param $useridx int facechart.User.useridx
     * @param $tag_name_list array 태그 이름 목록
     * @param $flag string 태그 유형 (user|favorite|history)
     * @param $warning object Warning 객체 참조
     * @return int TagRelation.group_idx
     */
    public static function add($user_idx, $flag, $tag_name_list, &$warning = null) {
        global $g;

        $result = User::exists($user_idx);
        if ( !$result ) {
            return Warning::make($warning, false, 'user', '로그인이 필요한 서비스 입니다.');
        }

        $result = self::check_flag($user_idx, $flag, $warning);
        if ( !$result ) {
            return $warning->remake(0);
        }

        if ( !is_array($tag_name_list) ) {
            $tag_name_list = array($tag_name_list);
        }

        // 태그 idx를 가져 온다, 등록되지 않은 태그는 등록
        $tag_idx_list = array();
        foreach ( $tag_name_list as $tag_name ) {
            $tag_idx = Tag::add($tag_name, $warning);
            if ( !$tag_idx ) {
                return $warning->remake(0);
            }
            $tag_idx_list[] = $tag_idx;
        }

        // 플래그에 따른 group_idx 추출
        if ( $flag != self::FLAG_USER ) {
            $group_idx = $g->db->fetch_val("
                SELECT count(*)+1 FROM facechart.TagRelation
                WHERE user_idx = {$user_idx}
                    AND flag = '{$flag}'
            ");
        } else {
            $group_idx = 0;
            $result = self::remove($user_idx, $flag, $group_idx, $warning);
            if ( !$result ) {
                return $warning->remake(0);
            }
        }

        // 태그 등록
        foreach ( $tag_idx_list as $tag_idx ) {
            $g->db->query("
                INSERT facechart.TagRelation SET
                    user_idx = '{$user_idx}',
                    tag_idx = '{$tag_idx}',
                    flag = '{$flag}',
                    group_idx = '{$group_idx}'
            ");
        }

        return Warning::make($warning, $group_idx);
    }


    /**
     * @brief 태그 삭제
     * @param $useridx int facechart.User.useridx
     * @param $flag string 태그 유형 (user|favorite|history)
     * @param $group_idx int facechart.TagRelation.group_idx
     * @param $warning object Warning 객체 참조
     * @return boolean
     */
    public static function remove($user_idx, $flag, $group_idx, &$warning = null) {
        global $g;

        $result = User::exists($user_idx);
        if ( !$result ) {
            return Warning::make($warning, false, 'user', '로그인이 필요한 서비스 입니다.');
        }

        if ( !preg_match("/[^\s]+/su", $flag) ) {
            return Warning::make($warning, false, 'name', '잘못된 유형 입니다.');
        }

        if ( !preg_match('/^[1-9][0-9]*$/', $group_idx) ) {
            return Warning::make($warning, false, 'group', '삭제 실패.');
        }

        $g->db->query("
            DELETE FROM facechart.TagRelation
            WHERE user_idx = {$user_idx}
                AND flag = '{$flag}'
                AND group_idx = {$group_idx}
        ");

        return Warning::make($warning, true);
    }

    /**
     * @brief 생성자
     * @param $user_idx int facechart.User.user_idx
     * @param $flag string 태그유형 (user|favorite|history)
     * @param $group_idx int facechart.TagRelation.group_idx
     */
    public function __construct($user_idx, $flag, $group_idx) {
        global $g;

        if ( !preg_match('/^[1-9][0-9]*$/', $user_idx) ) $user_idx = 0;
        if ( !preg_match('/^[1-9][0-9]*$/', $group_idx) ) $group_idx = 0;

        $row_list = $g->db->fetch_all("
            SELECT  tr.user_idx, tr.flag, tr.group_idx, t.tag_name
            FROM TagRelation tr INNER JOIN Tag t ON tr.tag_idx=t.tag_idx
            WHERE user_idx={$user_idx}
                AND tr.flag = '{$flag}'
                AND tr.group_idx = {$group_idx}
            GROUP BY tr.flag, tr.group_idx, t.tag_name
        ");

        foreach ( $row_list as $row ) {
            $this->tag_list[] = $row;
        }
    }

    /**
     * @brief 배열형태
     * @return array
     */
    public function to_array() {
        $data = array();
        foreach ( $this->tag_list as $tag ) {
            $data[] = $tag;
        }
        return $data;
    }
}