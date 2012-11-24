<?
define('DOMAIN', 'kyoe.blogcocktail.com');
//define('DOMAIN', '14.63.221.243/facechart');

// dns 서버 재설치 전까지 임시로 kyoe.blogcocktail.com 을 사용한다.
define('DOMAIN_WEB', 'kyoe.blogcocktail.com/facechart');
//define('DOMAIN_WEB', 'facechart.org');

// dns 서저 재설치 전까지 정적파일과 스테틱파일 도메인은 사용하지 않는다.
define('DOMAIN_STATIC', 'static.facechart.org');
//define('DOMAIN_FILE', 'file.withblog.net');


## DIR ##
define('DIR_ROOT', "{$ROOTPATH}"); // 루트
define('DIR_WEB', DIR_ROOT.'/web'); // 웹
define('DIR_LIB', DIR_ROOT.'/lib'); // lib
define('DIR_FILE', DIR_ROOT.'/file'); // 파일

## URL ##
define('URL_WEB', 'http://'.DOMAIN_WEB.'/web'); // 도메인
define('URL_WEB_STATIC', 'http://'.DOMAIN_STATIC.'/web'); // 웹 정적파일
define('URL_FILE', 'http://'.DOMAIN_WEB.'/file'); // 파일

define('MYSQL_HOST', 'localhost');
define('MYSQL_USER', 'facechart');
define('MYSQL_PW', 'face1234');
define('MYSQL_DB', 'facechart');
define('MYSQL_PORT', 3306);
define('MYSQL_SOCKET', null);
?>
