<?php
    function update_last_login($conn, $useridx, $flag){
        if($flag=='email'){
            $where_sql = " email = '$email' ";
        }else{
            $where_sql = " user_idx = $useridx ";
        }
        $update_value .= " last_login=DATE_FORMAT(now(), '%Y%m%d%H%i%s') ";
        
        $user_info_update_sql =  " UPDATE User SET "
                                        .$update_value 
                                ." WHERE "     
                                        .$where_sql.";";
                                        
        $stmt = $conn->Prepare($user_info_update_sql);
    
        $rs = $conn->Execute($stmt);
        
        if(!$rs){
            $conn->FailTrans();
            return false;
        }else{
            return true;
        }
    }

    function get_user_idx($conn, $flag, $value){
    	if($flag!='photoidx'){
    		$sql = "SELECT user_idx as useridx FROM User WHERE email='$value' ";
		}else{
			$sql = "SELECT useridx FROM photo WHERE idx=$value ";
		}
        $result = $conn->Execute($sql);
        $useridx = $result->fields[0];
		if(!$useridx){
            return '';
        }else{
            return $useridx;
        }
    }

    function get_tag_relation_list($conn, $user_idx, $flag){
        $rs_array = array();
        
        $sql = "
                SELECT 
                        tr.flag, 
                        tr.group_idx, 
                        t.tag_name 
                FROM 
                        TagRelation tr
                INNER JOIN 
                        Tag t ON tr.tag_idx=t.tag_idx
                WHERE 
                        user_idx=$user_idx 
                        AND tr.flag = '$flag'
                GROUP BY 
                        tr.flag, tr.group_idx, t.tag_name ";
        
        $stmt = $conn->Prepare($sql);
        $rs = $conn->Execute($stmt);
        
        if(!$rs) {
            
        }else{
            while(!$rs->EOF) {
                $rs_array[$rs->fields[1]][] = $rs->fields[2];
                
                $rs->MoveNext();
            }
        }
        
        return $rs_array;
    }

    function get_user_relation_list($conn, $my_idx, $flag){
        $rs_array = array();
        
        $sql = "
                SELECT 
                        ur.flag, 
                        u.user_idx,
                        u.email,
                        u.name
                FROM 
                        UserRelation ur
                INNER JOIN 
                        User u ON ur.user_idx=u.user_idx
                WHERE 
                        ur.idx=$my_idx 
                        AND ur.flag = '$flag' ";
        
        $stmt = $conn->Prepare($sql);
        $rs = $conn->Execute($stmt);
        
        if(!$rs) {
            
        }else{
            while(!$rs->EOF) {
                $rs_array[] = array("user_idx"=>$rs->fields[1],"user_email"=>$rs->fields[2],"nickname"=>$rs->fields[3]);
                
                $rs->MoveNext();
            }
        }
        
        return $rs_array;
    }
    
    function check_email($conn, $email){
        $sql = "SELECT count(email) FROM User WHERE email='$email' ";
        $count_email = $conn->Execute($sql);
        $rs = $count_email->fields[0];
        if($rs=="0"){
            return true;
        }else{
            return false;
        }
    }
    
    
?>