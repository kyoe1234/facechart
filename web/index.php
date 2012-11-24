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
                </a>
                <a class="brand" href="#">FaceChart</a>
                <div class="nav-collapse">
                    <ul class="nav">
                        <li class="active"><a href="#">Home</a></li>
                    </ul>
                </div>
                <!--/.nav-collapse -->
                <div class="nav-collapse" style="float: right;">
                    <ul class="nav">
                        <li class="active"><a href="<?=URL_WEB?>">한국어</a></li>
                        <li class=""><a href="<?=URL_WEB?>/jp/index.php">日本語</a></li>
                        <li class=""><a href="<?=URL_WEB?>/en/index.php">ENGLISH</a></li>
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
                이뻐서 고마워여~<br /> 내 얼굴 순위는? 우리동네 얼짱이 궁금하세요? 매일매일의 내 얼굴을 기록하고 싶으세요?<br />
                세계에서 조회하고 쪽지를 붙이는 신개념 커뮤니티 FaceChart!!!<br />
            </p>
            <p>
                <a href="http://14.63.221.243/facechart/faceChart/output/faceChart.apk" target="_blank" class="btn btn-primary btn-large">Download &raquo;</a>
            </p>
        </div>

        <!-- Example row of columns -->
        <div class="row">
            <div class="span4">
                <h2>이상형월드컵</h2>
                <p>호감가는 사람을 선택하는 토너먼트 게임만으로도 충분한 재미가 있습니다.</p>
            </div>
            <div class="span4">
                <h2>페이스차트 조회</h2>
                <p>지역별, 주제별 얼굴 호감도 순위차트를 조회할 수 있습니다.</p>
            </div>
            <div class="span4">
                <h2>회원 사진 조회</h2>
                <p>자신의 택한 우승자의 그동안 올린 사진들을 감상할 수 있습니다.</p>
            </div>
            <div class="span4">
                <h2>매일의 나를 기록하기</h2>
                <p>매일매일의 내 얼굴을 사진으로 기록하고 남들의 반응을 확인할 수 있습니다.</p>
            </div>
            <div class="span4">
                <h2>토너먼트 만들기</h2>
                <p>자신이 직접 토너먼트를 만들어 해당태그의 얼짱들을 대상으로 이상형 월드컵을 할 수 있고 순위를 볼 수 있습니다.</p>
            </div>
            <div class="span4">
                <h2>우리반 얼짱뽑기</h2>
                <p>페이스차트에 토너먼트를 신청하여 공정하게 우리반 얼짱을 뽑을 수 있습니다.</p>
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