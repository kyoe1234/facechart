<?php
    require_once './include/common.php';
    require_once('../../lib/db.config.inc.php');
    //db debug
    $conn->debug = false;
    $conn2->debug = false;

    if(isset($_REQUEST['useridx'])){
        $useridx = $_REQUEST['useridx'];
    }else{
        $useridx = '';
    }

    if(isset($_REQUEST['email'])){
        $email = $_REQUEST['email'];
    }else{
        $email = '';
    }
    
    if($email=='' && $useridx==''){
        header('HTTP/1.1 400 Bad Request');
        echo json_encode(array('result' => false, 'text' => 'useridx and email is null'));
        exit;
    }

    if(isset($_REQUEST['password'])){
        $password = $_REQUEST['password'];
    }else{
        $password = "";
    }
    
    if(isset($_REQUEST['name'])){
        $name = $_REQUEST['name'];
    }else{
        $name = "";
    }
    
    if(isset($_REQUEST['sex'])){
        $sex = $_REQUEST['sex'];
    }else{
        $sex = "";
    }
    
    if(isset($_REQUEST['age'])){
        $age = $_REQUEST['age'];
    }else{
        $age = "";
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
    

    if($useridx){
        $where_sql = " user_idx = $useridx ";
    }else{
        $where_sql = " email = '$email' ";
    }
    $is_user_sql = "SELECT count(user_idx) FROM User WHERE $where_sql ";
    
    $rs = $conn2->Execute($is_user_sql);

    $count_user_idx = $rs->fields[0];
    if(!$count_user_idx){
        header('HTTP/1.1 400 Bad Request');
        echo json_encode(array('result' => false, 'text' => 'userinfo is null'));
        exit;
    }

    $update_value = "";
    if($password){
        $update_value .= " password=$password, ";
    }
    if($name){
        $update_value .= " name='$name', ";
    }
    if($sex){
        $update_value .= " sex='$sex', ";
    }
    if($age){
        $update_value .= " age='$age', ";
    }
    if($useridx){
        $where_sql = " user_idx = $useridx ";
    }else{
        $where_sql = " email = '$email' ";
    }
    $update_value .= " updated_date=DATE_FORMAT(now(), '%Y%m%d%H%i%s') ";
    
    $user_info_update_sql =  " UPDATE User SET "
                                    .$update_value 
                            ." WHERE "     
                                    .$where_sql.";";
                                    
    $stmt = $conn2->Prepare($user_info_update_sql);

    $rs = $conn2->Execute($stmt);
    
	if(!$rs){
        $conn2->FailTrans();
        header('HTTP/1.1 400 Bad Request');
        echo json_encode(array('result' => false, 'text' => 'userinfo update failed'));
        exit;
    }else{
        $conn2->CompleteTrans();        
        //$conn2->Close();
        
        $rs = array();
        //
        $user_info_table = "User";
        
        if($useridx){
            $where_sql = " user_idx = $useridx ";
        }else{
            $where_sql = " email = '$email' ";
        }
        
        $user_info_sql = " SELECT "
                                    ." user_idx, "
                                    ." email, "
                                    ." password, "
                                    ." name, "
                                    ." sex, "
                                    
                                    ." age, "
                                    ." updated_date "
                        ." FROM "
                                    .$user_info_table
                        ." WHERE "
                                    .$where_sql
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
            $result_value['sex'] = $rs->fields[4];
			if($rs->fields[5]){
				$field_age = $rs->fields[5]."~".($rs->fields[5]+10);
			}else{
				$field_age = "";
			}
            $result_value['age'] = $field_age;
            
            $result_value['updated_date'] = $rs->fields[6];
        }
        
        if ( $callback ) {
            echo $callback.'('.json_encode($result_value).')';
        } else {
            print(json_encode($result_value));
        }
    }

?>
