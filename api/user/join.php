<?php
    require_once('../../lib/db.config.inc.php');
    //db debug
    $conn->debug = false;
    $conn2->debug = false;

    if(isset($_REQUEST['email'])){
        $email = $_REQUEST['email'];
        if(!check_email($conn,$email)){
            header('HTTP/1.1 400 Bad Request');
            echo json_encode(array('result' => false, 'text' => 'email is duplicated'));
            exit;
        }
    }else{
        header('HTTP/1.1 400 Bad Request');
        echo json_encode(array('result' => false, 'text' => 'email is null'));
        exit;
    }

    if(isset($_REQUEST['password'])){
        $password = $_REQUEST['password'];
    }else{
        header('HTTP/1.1 400 Bad Request');
        echo json_encode(array('result' => false, 'text' => 'password is null'));
        exit;
    }
    
    if(isset($_REQUEST['name'])){
        $name = $_REQUEST['name'];
    }else{
        header('HTTP/1.1 400 Bad Request');
        echo json_encode(array('result' => false, 'text' => 'name is null'));
        exit;
    }

    if(isset($_REQUEST['debug'])){
        $debug = $_REQUEST['debug'];
    }else{
        $debug = 0;
    }
    
    if(isset($_REQUEST['callback'])){
        $callback = $_REQUEST['callback'];
    }else{
        $callback = 0;
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
    
    $sequence_sql = "SELECT max(user_idx) FROM User ";
    $rs_seq = $conn2->Execute($sequence_sql);

    $seq = $rs_seq->fields[0];
    $seq = $seq+1;
            
    $user_join_sql =  " INSERT INTO "
                                    ." User "
                                    ." (user_idx, email, password, name, last_login, "
                                    ." updated_date) "
                        ." VALUES "     
                                    ."(?, ?, ?, ?, DATE_FORMAT(now(), '%Y%m%d%H%i%s') ,"
                                    ." DATE_FORMAT(now(), '%Y%m%d%H%i%s') ) ";
    
    $array_list = array($seq, $email, $password, $name);

    $stmt = $conn2->Prepare($user_join_sql);

    $rs = $conn2->Execute($stmt, $array_list);

    if(!$rs){
        $conn2->FailTrans();
        header('HTTP/1.1 400 Bad Request');
        echo json_encode(array('result' => false, 'text' => 'userinfo insert failed'));
        exit;
    }else{
        $conn2->CompleteTrans();        
        //$conn2->Close();
        
        $rs = array();
        //
        $user_info_table = "User";
        
        $user_info_sql = " SELECT "
                                    ." user_idx, "
                                    ." email, "
                                    ." password, "
                                    ." name, "
                                    ." today_point, "
                                    
                                    ." total_point, "
                                    ." today_comment, "
                                    ." total_comment, "
                                    ." sns, "
                                    ." last_login, "
                                    
                                    ." visit_count, "
                                    ." updated_date "
                        ." FROM "
                                    .$user_info_table
                        ." WHERE "
                                    ." email = '$email' "
                                    ." AND deleted_date IS NULL ";
    
        $stmt = $conn2->Prepare($user_info_sql);
        
        $rs = $conn2->Execute($stmt);
        //echo($stmt);
        $result_value = array();
        //DB
        if(!$rs) {
            header('HTTP/1.1 400 Bad Request');
            echo json_encode(array('result' => false, 'text' => 'userinfo get failed'));
            exit;
        } else {
            //$result_value = $rs;
            $result_value['user_idx'] = $rs->fields[0];
            $result_value['email'] = $rs->fields[1];
            $result_value['name'] = $rs->fields[3];
            $result_value['point'] = 0;
            $result_value['comment'] = 0;
            
            $result_value['favorite_room'] = "";
            $result_value['history_room'] = "";
            $result_value['favorite_tag'] = "";
            $result_value['history_tag'] = "";
            $result_value['user_tag'] = "";
            
            $result_value['sns'] = "";
            $result_value['last_login'] = "";
            $result_value['visit_count'] = "";
            $result_value['updated_date'] = $rs->fields[11];
        }
        
        if ( $callback ) {
            echo $callback.'('.json_encode($result_value).')';
        } else {
            print(json_encode($result_value));
        }
    }

?>
