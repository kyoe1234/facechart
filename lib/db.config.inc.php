<?php
	// ADODB Exception
	//require_once('adodb/adodb-exceptions.inc.php');
	
	require_once('adodb/adodb.inc.php');
	
	$ADODB_FETCH_MODE = 'ADODB_FETCH_ASSOC';
	
	$db_driver = 'mysql';
	$db_host = 'localhost';
	$db_user = 'facechart';
	$db_password = 'face1234';
	
	$db_database = 'facechart';
	
	$conn = ADONewConnection($db_driver);
	$conn->Connect($db_host, $db_user, $db_password, $db_database);
		
	$conn->query('SET character_set_database=UTF8');
	$conn->query('SET character_set_client=UTF8');
	$conn->query('SET character_set_connection=UTF8');
	$conn->query('SET character_set_results=UTF8');
	$conn->query('SET character_set_server=UTF8');
	$conn->query('SET names UTF8'); 

	$conn2 = ADONewConnection($db_driver);
	$conn2->Connect($db_host, $db_user, $db_password, $db_database2);
	
	$conn2->query('SET character_set_database=UTF8');
	$conn2->query('SET character_set_client=UTF8');
	$conn2->query('SET character_set_connection=UTF8');
	$conn2->query('SET character_set_results=UTF8');
	$conn2->query('SET character_set_server=UTF8');
	$conn2->query('SET names UTF8'); 
?>