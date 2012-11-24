<?php
	require_once './include/startup.php';
    require_once DIR_LIB.'/Photo.php';
    require_once './include/common.php';
	require_once('../../lib/db.config.inc.php');
	//db debug
	$conn->debug = false;
	$conn2->debug = false;

	if(isset($_REQUEST['taglist'])){
		$tag_list = $_REQUEST['taglist'];
	}else{
		$tag_list = '';
		//header('HTTP/1.1 400 Bad Request');
		//echo json_encode(array('result' => false, 'text' => 'taglist is null'));
		//exit;
	}

    if($tag_list){
        $tag_list_array = explode(",", $tag_list);
    }else{
        $tag_list_array = array();
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
	
	if(isset($_REQUEST['limituseridx'])){
		$limituseridx = $_REQUEST['limituseridx'];
	}else{
		$limituseridx = '0';
	}

	if(isset($_REQUEST['limit'])){
		$limit = $_REQUEST['limit'];
	}else{
		$limit = "20";
	}

	$callback = $_REQUEST['callback'];

	function get_tournament_user_list($conn, $tournament_tags){
	    global $limituseridx;
	    global $limit;
	    
		$rs_array = array();
		
		$tag_count = count($tournament_tags);
		
		if(count($tournament_tags)>0){
			$in_contents = implode("','",$tournament_tags);
		}else{
			$in_contents = $tournament_tags;
		}
	
	    if($limituseridx){
	        $limit_sql = " LIMIT $limituseridx, $limit ";
	    }else{
	        $limit_sql = " LIMIT 0, $limit ";
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
						photo p ON u.user_idx=p.useridx 
				GROUP BY 
                        u.user_idx, 
                        u.email, 
                        u.name, 
                        u.total_point, 
                        p.idx
                HAVING 
                        count(u.user_idx) = $tag_count 
                ORDER BY 
                        total_point, user_idx 
                $limit_sql ";
		
		$stmt = $conn->Prepare($sql);
		$rs = $conn->Execute($stmt);
		
		if(!$rs) {
			
		}else{
			$count = 1+$limituseridx;;
			while(!$rs->EOF) {
                $profile_photo = new Photo($rs->fields[5]);
				$rs_array[$count] = array("user_idx"=>$rs->fields[1],"user_email"=>$rs->fields[2],"nickname"=>$rs->fields[3],"point"=>$rs->fields[4],"photourl"=>"".$profile_photo->photo[90]);
				
				$rs->MoveNext();
				$count++;
			}
		}
		return $rs_array;
	}
    function get_all_user_list($conn){
        global $limituseridx;
        global $limit;
        
        $rs_array = array();
        
        if($limituseridx){
            $limit_sql = " LIMIT $limituseridx, $limit ";
        }else{
            $limit_sql = " LIMIT 0, $limit ";
        }
        
        $rs_array = array();
        
        $sql = "
                SELECT 
                    DISTINCT 
                        u.user_idx, 
                        u.email, 
                        u.name, 
                        u.total_point, 
                        p.idx
                FROM 
                        User u
                LEFT JOIN 
                        photo p ON u.user_idx=p.useridx AND p.main='Y' 
                ORDER BY 
                        total_point desc, user_idx 
                $limit_sql ";
        
        $stmt = $conn->Prepare($sql);
        $rs = $conn->Execute($stmt);
        $count = 1+$limituseridx;
        if(!$rs) {
            
        }else{
            while(!$rs->EOF) {
                $profile_photo = new Photo($rs->fields[4]);
                if($profile_photo->photo[90]){
                    $photourl = $profile_photo->photo[90];
                }else{
                    $photourl = "http://14.63.221.243/facechart/file/user/1/100_1341424086_90.jpg";
                }
                $rs_array[$count] = array("user_idx"=>$rs->fields[0],"user_email"=>$rs->fields[1],"nickname"=>$rs->fields[2],"point"=>$rs->fields[3],"photourl"=>"".$photourl);                
                $rs->MoveNext();
                $count++;
            }
        }
        
        return $rs_array;
    }
    	
	$result = array();
	if(count($tag_list_array)>0){
	    $tournament = get_tournament_user_list($conn, $tag_list_array);
	}else{
	    $tournament = get_all_user_list($conn);
	}
	$result['taglist'] = $tag_list;
	$result['chartlist'] = $tournament;
	
	$json_data = json_encode($result);
	if ( $callback ) {
	    echo $callback.'('.$json_data.')';
	} else {
	    echo $json_data;
	}
?>