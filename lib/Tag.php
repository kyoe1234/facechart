<?php
/**
 * @brief 태그 관리
 */
class Tag {
    /**
     * @brief 태그 추가
     * @param $name string 태그
     * @param $warning object Warning 객체 참조
     * @return int Tag.idx
     */
    public static function add($name, &$warning = null) {
        global $g;

        if ( !preg_match("/[^\s]+/su", $name) ) {
            return Warning::make($warning, 0, 'name', '태그를 입력해 주세요.');
        }

        $name = $g->db->escape($name);

        // 이미 등록 되어있는 태그인지 확인
        $sql = "SELECT tag_idx FROM facechart.Tag
                WHERE tag_name = '{$name}'";
        $tag_idx = $g->db->fetch_val($sql);
        if ( $tag_idx ) {
            return Warning::make($warning, $tag_idx);
        }

        // 태그 등록
        $sql = "INSERT IGNORE INTO facechart.Tag (`tag_name`)
                VALUES ('{$name}')";
        $g->db->query($sql);

        $insert_id = (int)$g->db->insert_id();

        return Warning::make($warning, $insert_id);
    }

    /**
     * @brief 태그 수정
     * @param $idx int Tag.tag_idx
     * @param $name string 태그
     * @param $warning object Warning 객체 참조
     * @return boolean
     */
    public static function modify($idx, $name, &$warning = null) {
        global $g;

        $tag = new self(idx);
        if ( !$tag->tag_idx ) {
            return Warning::make($warning, false, 'tag_idx', '없는 태그 입니다.');
        }

        if ( !preg_match("/[^\s]+/su", $name) ) {
            return Warning::make($warning, false, 'name', '태그를 입력해 주세요.');
        }

        $name = $g->db->escape($name);

        $g->db->query("
            UPDATE facechart.Tag
                SET `tag_name` = '{$name}'
            WHERE tag_idx = {$idx}
        ");

        return Warning::make($warning, true);
    }

    /**
     * @brief 태그 삭제
     * @param $idx int Tag.tag_idx
     * @param $warning object Warning 객체 참조
     * @return boolean
     */
    public static function remove($idx, &$warning = null) {
        global $g;

        $tag = new self(idx);
        if ( !$tag->tag_idx ) {
            return Warning::make($warning, false, 'tag_idx', '없는 태그 입니다.');
        }

        $g->db->query("
            DELETE FROM facechart.Tag
            WHERE tag_idx = '{$idx}'
        ");

        return Warning::make($warning, true);
    }

    /**
     * @brief 생성자
     * @param $tag_idx int facechart.Tag.tag_idx
     */
    public function __construct($tag_idx) {
        global $g;

        $row = $g->db->fetch_row("
            SELECT * FROM facechart.Tag
            WHERE tag_idx = {$tag_idx}
        ");

        foreach ( $row as $k => $v ) {
            $this->$k = $v;
        }
    }

    /**
     * @brief 배열형태
     * @return array
     */
    public function to_array() {
        $data = array(
            'idx' => $this->tag_idx,
            'name' => $this->tag_name,
        );
        return $data;
    }
}
?>
