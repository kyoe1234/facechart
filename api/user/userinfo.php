<?php
    require_once './include/common.php';
	require_once('../../lib/db.config.inc.php');
	//db debug
	$conn->debug = false;
	$conn2->debug = false;
	//paging lib
	//require_once('../lib/adodb/adodb-pager.inc.php');
	
	if(isset($_REQUEST['useridx'])){
		$useridx = $_REQUEST['useridx'];
	}else{
		//$useridx = '';
	}
	if(isset($_REQUEST['photoidx'])){
		$photoidx = $_REQUEST['photoidx'];
		$useridx = get_user_idx($conn, 'photoidx', $photoidx);
	}else{
		//$useridx = '';
	}
	if(isset($_REQUEST['email'])){
		$email = $_REQUEST['email'];
	}else{
		//$email = '';
	}
	
	if($email=='' && $useridx=='' && $photoidx==''){
		header('HTTP/1.1 400 Bad Request');
		echo json_encode(array('result' => false, 'text' => 'useridx and email is null'));
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
	
	$rs = array();

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
								.$where_sql
								." AND deleted_date IS NULL ";

	$stmt = $conn->Prepare($user_info_sql);
	
	$rs = $conn->Execute($stmt);
	//echo($stmt);
	$result_value = array();
	//DB
	if(!$rs || count($rs)!=1) {
        header('HTTP/1.1 400 Bad Request');
        echo json_encode(array('result' => false, 'text' => 'userinfo get failed'));
        exit;
	} else {
		//$result_value = $rs;
		$this_user_idx = $rs->fields[0];
		$result_value['user_idx'] = $rs->fields[0];
		$result_value['email'] = $rs->fields[1];

		$result_value['name'] = $rs->fields[3];
	
		$result_value['point'] = $rs->fields[4]."/".$rs->fields[5];
		
		$result_value['comment'] = $rs->fields[6]."/".$rs->fields[7];
				
		$favorite_room_array = array();
		$favorite_room_array = get_user_relation_list($conn2, $this_user_idx, 'favorite');
		$result_value['favorite_room'] = $favorite_room_array;
		
		$history_room_array = array();
		$history_room_array = get_user_relation_list($conn2, $this_user_idx, 'history');
		$result_value['history_room'] = $history_room_array;

		$favorite_tag_array = array();
		$favorite_tag_array = get_tag_relation_list($conn2, $this_user_idx, 'favorite');
		$result_value['favorite_tag'] = $favorite_tag_array;

		$history_tag_array = array();
		$history_tag_array = get_tag_relation_list($conn2, $this_user_idx, 'history');
		$result_value['history_tag'] = $history_tag_array;
		
		$user_tag_array = array();
		$user_tag_array = get_tag_relation_list($conn2, $this_user_idx, 'user');
		//$user_tag_array = array("1"=>"서울","2"=>"서울대","3"=>"남자","4"=>"20대","5"=>"관악구","6"=>"학생","7"=>"경영학과");

		$result_value['user_tag'] = $user_tag_array[0];
		
		$result_value['sns'] = "".$rs->fields[8];//array("facebook"=>"ddd@daum.net");
		$result_value['last_login'] = $rs->fields[9];
		
		$result_value['visit_count'] = $rs->fields[10];
		$result_value['updated_date'] = $rs->fields[11];
	}
    //최종접속시간 갱신
    update_last_login($conn2, $this_user_idx, 'useridx');

	if ( $callback ) {
		echo $callback.'('.json_encode($result_value).')';
	} else {
		print(json_encode($result_value));
	}
?>
