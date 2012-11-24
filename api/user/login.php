<?php
    require_once './include/common.php';
    require_once('../../lib/db.config.inc.php');
    //db debug
    $conn->debug = false;
    $conn2->debug = false;

    if(isset($_REQUEST['email'])){
        $email = $_REQUEST['email'];
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
    
    
    if(isset($_REQUEST['callback'])){
        $callback = $_REQUEST['callback'];
    }else{
        $callback = 0;
    }
        
    $rs = array();
    //
    $user_info_table = "User";
    
    $user_info_sql = " SELECT "
                                ." user_idx "
                    ." FROM "
                                .$user_info_table
                    ." WHERE "
                                ." email = '$email' "
                                ." AND password = '$password' "
                                ." AND deleted_date IS NULL ";

    $stmt = $conn2->Prepare($user_info_sql);
    
    $rs = $conn2->Execute($stmt);
    //echo($stmt);
    $result_value = array();
    //DB
    if(!$rs) {
        header('HTTP/1.1 400 Bad Request');
        echo json_encode(array('result' => false, 'text' => 'login failed'));
        exit;
    } else {
        //$result_value = $rs;
        $result_value['user_idx'] = $rs->fields[0];
        
        //최종접속시간 갱신
        update_last_login($conn2, $result_value['user_idx'], 'useridx');
		if(!$result_value['user_idx']){
        	header('HTTP/1.1 400 Bad Request');
        	echo json_encode(array('result' => false, 'text' => 'login failed'));
        	exit;
		}
    }
    
    
    if ( $callback ) {
        echo $callback.'('.json_encode($result_value).')';
    } else {
        print(json_encode($result_value));
    }

?>
