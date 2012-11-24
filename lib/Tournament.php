<?php
require_once DIR_LIB.'/Tag.php';

class Tournament {
    /**
     * @brief 토너먼트 등록
     * @param $title string 토너먼트 타이틀
     * @param $tag_idx_list array 태그idx 목록
     * @param $warning object Warning 객체 참조
     * @return int tournament.idx
     */
    public static function add($title, $tag_idx_list, &$warning = null) {
        global $g;

        if ( !preg_match("/[^\s]+/su", $title) ) {
            return Warning::make($warning, 0, 'title', '타이틀을 입력해 주세요.');
        }

        if ( !is_array($tag_idx_list) ) {
            $tag_idx_list = array($tag_idx_list);
        }

        $g->db->begin();

        // 토너먼트 등록
        $g->db->query("
            INSERT facechart.tournament SET
                title = '{$title}',
                createdate = NOW()
        ");
        $tournament_idx = (int)$g->db->insert_id();

        // 토너먼트 태그 등록
        $values = array();
        foreach ( $tag_idx_list as $tag_idx ) {
            $tag = new Tag($tag_idx);
            if ( !$tag->tag_idx ) {
                $g->db->rollback();
                return Warning::make($warning, 0, 'tag', '토너먼트 등록 실패');
            }

            $result = self::add_tag($tournament_idx, $tag_idx, $warning);
            if ( !$result ) {
                $g->db->rollback();
                return $warning->remake(0);
            }
        }

        $g->db->commit();

        return Warning::make($warning, $tournament_idx);
    }

    /**
     * @brief 토너먼트 수정
     * @param $tournament_idx int facechart.tournament.idx
     * @param $title string 토너먼트 타이틀
     * @param $tag_idx_list array 태그idx 목록
     * @param $warning object Warning 객체 참조
     * @return boolean
     */
    public static function modify($tournament_idx, $title, $tag_idx_list, &$warning = null) {
        global $g;

        $tournament = new self($tournament_idx);
        if ( !$tournament->idx ) {
            return Warning::make($warning, false, 'tournament', '토너먼트를 찾을수 없습니다.');
        }

        if ( !is_array($tag_idx_list) ) {
            $tag_idx_list = array($tag_idx_list);
        }

        $g->db->begin();

        // 타이틀이 있으면 타이틀 변경
        if ( preg_match("/[^\s]+/su", $title) ) {
            $g->db->query("
                UPDATE facechart.tournament SET
                    title = '{$title}'
                WHERE idx = {$tournament_idx}
            ");
        }

        // 기존 토너먼트 태그 삭제
        $result = self::remove_tag($tournament_idx, $warning);
        if ( !$result ) {
            $g->db->rollback();
            return $warning->remake(false);
        }

        // 토너먼트 태그 등록
        $values = array();
        foreach ( $tag_idx_list as $tag_idx ) {
            $tag = new Tag($tag_idx);
            if ( !$tag->tag_idx ) {
                $g->db->rollback();
                return Warning::make($warning, false, 'tag', '토너먼트 등록 실패');
            }

            $result = self::add_tag($tournament_idx, $tag_idx, $warning);
            if ( !$result ) {
                $g->db->rollback();
                return $warning->remake(false);
            }
        }

        $g->db->commit();

        return Warning::make($warning, true);
    }


    /**
     * @brief 토너먼트 삭제
     * @param $tournament_idx int facechart.tournament.idx
     * @param $warning object Warning 객체 참조
     * @return boolean
     */
    public static function remove($tournament_idx, &$warning = null) {
        global $g;

        $tournament = new self($tournament_idx);
        if ( !$tournament->idx ) {
            return Warning::make($warning, false, 'tournament', '토너먼트를 찾을수 없습니다.');
        }

        $g->db->begin();

        $result = self::remove_tag($tournament_idx, $warning);
        if ( !$result ) {
            $g->db->rollback();
            return $warning->remake(false);
        }

        $result = $g->db->query("
            DELETE FROM facechart.tournament
            WHERE idx = {$tournament_idx}
        ");
        if ( !$result ) {
            $g->db->rollback();
            return Warning::make($warning, false, 'tournament', '토너먼트 삭제 실패');
        }

        $g->db->commit();

        return Warning::make($warning, true);
    }

    /**
    * @brief 토너먼트 태그 삭제
    * @param $tournament_idx int facechart.tournament.idx
    * @param $warning object Warning 객체 참조
    * @return boolean
    */
    public static function remove_tag($tournament_idx, &$warning = null) {
        global $g;

        $tournament = new self($tournament_idx);
        if ( !$tournament->idx ) {
            return Warning::make($warning, false, 'tournament', '토너먼트를 찾을수 없습니다.');
        }

        $result = $g->db->query("
            DELETE FROM facechart.tournamenttag
            WHERE tournamentidx = '{$tournament_idx}'
        ");
        if ( !$result ) {
            $g->db->rollback();
            return Warning::make($warning, false, 'tournament_tag', '토너먼트 태그 삭제 실패');
        }

        return Warning::make($warning, true);
    }

    /**
     * @brief 토너먼트 태그 추가
     * @param $tournament_idx int facechart.tournament.idx
     * @param $tag_idx int facechart.Tag.idx
     * @param $warning object Warning 객체 참조
     * @return boolean
     */
    private static function add_tag($tournament_idx, $tag_idx, &$warning = null) {
        global $g;

        $tournament = new self($tournament_idx);
        if ( !$tournament->idx ) {
            return Warning::make($warning, false, 'tournament', '토너먼트를 찾을수 없습니다.');
        }

        if ( !preg_match('/^[1-9][0-9]*$/', $tag_idx) ) {
            return Warning::make($warning, false, 'tag', '태그를 찾을수 없습니다.');
        }

        $result = $g->db->query("
            INSERT IGNORE INTO facechart.tournamenttag (`tournamentidx`, `tagidx`)
            VALUES ({$tournament_idx}, {$tag_idx})
        ");

        if ( !$result ) {
            return Warning::make($warning, false, 'error', '토너먼트 태그 등록 실패');
        }

        return Warning::make($warning, true);
    }

    /**
     * @brief 생성자
     * @param $tournament int facechart.tournament.idx
     */
    public function __construct($tournament_idx) {
        global $g;

        if ( !preg_match('/^[1-9][0-9]*$/', $tournament_idx) ) {
            return Warning::make($warning, false, 'tournament', '토너먼트를 찾을수 없습니다.');
        }

        $row = $g->db->fetch_row("
            SELECT * FROM facechart.tournament
            WHERE idx = {$tournament_idx}
        ");

        $this->idx = $row['idx'];
        $this->title = $row['title'];

        $row_list = $g->db->fetch_all("
            SELECT t.tag_idx, t.tag_name
            FROM facechart.Tag t JOIN facechart.tournamenttag tg
                ON(t.tag_idx = tg.tagidx)
            WHERE tg.tournamentidx = {$tournament_idx}
        ");

        $this->tag_list = array();
        foreach ( $row_list as $row ) {
            $this->tag_list[$row['tag_idx']] = $row['tag_name'];
        }
    }

    /**
     * @brief 배열형태
     * @return array
     */
    public function to_array() {
        $data = array(
            'idx' => $this->idx,
            'title' => $this->title,
            'tag_list' => $this->tag_list,
        );

        return $data;
    }
}

?>