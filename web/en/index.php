<?php
require_once './include/startup.php';
?>
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>FaceChart</title>
<!--
    <link rel="stylesheet" href="<?=URL_WEB_STATIC?>/bootstrap/css/bootstrap.min.css" />
    <link rel="stylesheet" href="<?=URL_WEB_STATIC?>/css/facechart.css" />
-->
<link rel="stylesheet" href="<?=URL_WEB?>/bootstrap/css/bootstrap.min.css" />
<link rel="stylesheet" href="<?=URL_WEB?>/css/facechart.css" />

<style type="text/css">
body {
    padding-top: 60px;
    padding-bottom: 40px;
}
</style>
</head>

<body>
    <div class="navbar navbar-fixed-top">
        <div class="navbar-inner">
            <div class="container">
                <a class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse"> <span class="icon-bar"></span>
                <span class="icon-bar"></span> <span class="icon-bar"></span>
                </a> <a class="brand" href="/">FaceChart</a>
                <div class="nav-collapse">
                    <ul class="nav">
                        <li class="active"><a href="#">Home</a></li>
                    </ul>
                </div>
                <!--/.nav-collapse -->
                <div class="nav-collapse" style="float: right;">
                    <ul class="nav">
                        <li class=""><a href="<?=URL_WEB?>">한국어</a></li>
                        <li class=""><a href="<?=URL_WEB?>/jp/index.php">日本語</a></li>
                        <li class="active"><a href="<?=URL_WEB?>/en/index.php">ENGLISH</a>
                        </li>
                    </ul>
                </div>
                <!--/.nav-collapse -->
            </div>
        </div>
    </div>

    <div class="container">
        <!-- Main hero unit for a primary marketing message or call to action -->
        <div class="hero-unit">
            <h1>FaceChart!</h1>
            <p>
                Thank you, beautiful~<br /> Have you ever wondered that your
                face-ranking in the world?<br /> Have you ever wondered who is the
                most attractive woman/ the most handsome man in your area nearby?<br />
                Do you want to record your face every day?<br /> All over the world,
                You can search and attach note.<br /> This is new concept community
                FaceChart!!!<br />
            </p>
            <p>
                <a href="http://14.63.221.243/facechart/faceChart/output/faceChart.apk" target="_blank" class="btn btn-primary btn-large">Download &raquo;</a>
            </p>
        </div>

        <!-- Example row of columns -->
        <div class="row">
            <div class="span4">
                <h2>Ideal World Cup</h2>
                <p>
                    Have fun with tournament!<br /> Pick one of the two, more likable
                    person for you!
                </p>
            </div>
            <div class="span4">
                <h2>Search Face Chart</h2>
                <p>you can search regional, thematic Face Chart.</p>
            </div>
            <div class="span4">
                <h2>User photo views</h2>
                <p>You can see more pictures of winners who you chosen.</p>
            </div>
            <div class="span4">
                <h2>Daily record Face.</h2>
                <p>
                    Record your face every day every month!<br /> Also share with
                    friends and get reaction of users worldwide.
                </p>
            </div>
            <div class="span4">
                <h2>Create Tournament</h2>
                <p>Create your own tournament and have more fun together! Aimed at
                    good-looking people, tag them and make Ideal World Cup, and then
                    you can watch the rankings in the Face Chart!</p>
            </div>
            <div class="span4">
                <h2>Class Ulzzang!</h2>
                <p>Do you want to single out ulzzang of your classmates? Apply for
                    the tournament in the chart to be fair in Face Chart!</p>
            </div>
        </div>

        <hr>

        <footer>
            <p>&copy; FaceChart 2012</p>
        </footer>
    </div>
    <!-- /container -->
</body>
</html>