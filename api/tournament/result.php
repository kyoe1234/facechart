<?php
    require_once './include/startup.php';
    require_once DIR_LIB.'/Photo.php';
    require_once './include/common.php';
	require_once('../../lib/db.config.inc.php');
	//db debug
	$conn->debug = false;
	$conn2->debug = false;

	if(isset($_REQUEST['tournamentidx'])){
		$tournamentidx = $_REQUEST['tournamentidx'];
	}else{
		$tournamentidx = '';
		header('HTTP/1.1 400 Bad Request');
		echo json_encode(array('result' => false, 'text' => 'tournamentidx is null'));
		exit;
	}
	
	if(isset($_REQUEST['useridx'])){
		$useridx = $_REQUEST['useridx'];
	}else{
		$useridx = '';
	}

	if(isset($_REQUEST['email'])){
		$email = $_REQUEST['email'];
		$useridx = get_user_idx($conn, 'email', $email);
	}else{
		$email = '';
	}
	
	if($email=='' && $useridx==''){
		header('HTTP/1.1 400 Bad Request');
		echo json_encode(array('result' => false, 'text' => 'useridx and email is null'));
		exit;
	}

	if(isset($_REQUEST['photoidx'])){
		$photoidx = urldecode($_REQUEST['photoidx']);
	}else{
		$photoidx = '';
		header('HTTP/1.1 400 Bad Request');
		echo json_encode(array('result' => false, 'text' => 'photoidx is null'));
		exit;
	}
	if($photoidx){
		$photoidx_array = explode(",", $photoidx);
	}else{
		$photoidx_array = array();
	}
	
	if(isset($_REQUEST['photopoint'])){
		$photopoint = urldecode($_REQUEST['photopoint']);
	}else{
		$photopoint = '';
		header('HTTP/1.1 400 Bad Request');
		echo json_encode(array('result' => false, 'text' => 'photopoint is null'));
		exit;
	}
	if($photopoint){
		$photopoint_array = explode(",", $photopoint);
	}else{
		$photopoint_array = array();
	}
	if(count($photopoint_array)!=count($photopoint_array)){
		header('HTTP/1.1 400 Bad Request');
		echo json_encode(array('result' => false, 'text' => 'photoidx count != photopoint count'));
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

	function get_tournament_tag_list($conn, $tournamentidx){
		$rs_array = array();
		
		$sql = "
				SELECT 
						tagidx 
				FROM 
						tournamenttag  
				WHERE 
					tournamentidx=$tournamentidx 
				ORDER BY tagidx ";
		
		$stmt = $conn->Prepare($sql);
		$rs = $conn->Execute($stmt);
	
		if(!$rs) {

		}else{
			while(!$rs->EOF) {
				$rs_array[] = $rs->fields[0];
				
				$rs->MoveNext();
			}
		}
		//print_r($rs_array);
		return $rs_array;
	}
	
	function get_tournament_user_list($conn, $tournamentidx){
		$rs_array = array();
		
		$tournament_tags = get_tournament_tag_list($conn, $tournamentidx);
		
        $tag_count = count($tournament_tags);
		
		if(count($tournament_tags)>0){
			$in_contents = implode("','",$tournament_tags);
		}else{
			$in_contents = $tournament_tags;
		}

        $sql = "
                SELECT 
                    DISTINCT 
                        count(u.user_idx),
                        u.user_idx, 
                        u.email, 
                        u.name, 
                        u.total_point, 
                        p.idx
                FROM 
                        User u
                INNER JOIN 
                        TagRelation tr ON u.user_idx=tr.user_idx 
                        AND flag='user' 
                        AND tag_idx IN ('$in_contents') 
                LEFT JOIN 
                        photo p ON u.user_idx=p.useridx AND p.main='Y' 
                GROUP BY 
                        u.user_idx, 
                        u.email, 
                        u.name, 
                        u.total_point, 
                        p.idx
                HAVING 
                        count(u.user_idx) = $tag_count 
                ORDER BY 
                        total_point desc, user_idx ";
        
		
		$stmt = $conn->Prepare($sql);
		$rs = $conn->Execute($stmt);
		
		if(!$rs) {
			
		}else{
			$count = 1+$limituseridx;;
			$useridx = $rs->fields[1];
			while(!$rs->EOF) {
                $profile_photo = new Photo($rs->fields[5]);
				$rs_array[$count] = array("user_idx"=>$rs->fields[1],"user_email"=>$rs->fields[2],"nickname"=>$rs->fields[3],"point"=>$rs->fields[4],"photourl"=>"".$profile_photo->photo[90]);
				
				$rs->MoveNext();
				$count++;
			}
		}
		return $rs_array;
	}

	//토너먼트 결과합산 로직
	$error_count = 0;
	foreach($photoidx_array as $key=>$val){
	    $rs = Photo::add_point(trim($val), $useridx, trim($photopoint_array[$key]));
	    if(!$rs){
	        $error_count++;
	   }
    }
    if($error_count>0){
        header('HTTP/1.1 400 Bad Request');
        echo $warning->json();
        exit;
    }
	
	//=>합산이 끝나면
	$result = array();
	$result['chartlist'] = get_tournament_user_list($conn, $tournamentidx);

    $tournament_tags = get_tournament_tag_list($conn, $tournamentidx);
        
    //if(count($tournament_tags)>0){
        $in_contents = implode("','",$tournament_tags);
    //}else{
    //    $in_contents = $tournament_tags;
    //}
    
    $in_contents = implode(",",$tournament_tags);
        
    $result['taglist'] = $in_contents;

	if ( $callback ) {
		echo $callback.'('.json_encode($result).')';
	} else {
		print(json_encode($result));
	}
?>
