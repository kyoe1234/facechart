<?
if ( $_GET['error_report'] == 1 ) {
    error_reporting(E_ALL ^ E_NOTICE);
    //ini_set("display_errors", 1);
}

require_once DIR_LIB.'/common/Warning.php';
require_once DIR_LIB.'/GlobalObject.php';

## 전역 객체 ##
global $g;
$g = GlobalObject::singleton();
?>
