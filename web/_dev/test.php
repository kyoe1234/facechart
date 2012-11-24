<?php
require_once './include/startup.php';
require_once DIR_LIB.'/User.php';

$user = new User(1001);

echo $user->profile_photo;
echo $user->main_photo;
exit;
$profile_photo = User::profile_photo(1001);
echo 'a:'.$profile_photo;
?>