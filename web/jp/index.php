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
    font-family: Osaka, "ＭＳ Ｐゴシック";
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
                <a class="brand" href="/">FaceChart</a>
                <div class="nav-collapse">
                    <ul class="nav">
                        <li class="active"><a href="#">Home</a></li>
                    </ul>
                </div>
                <!--/.nav-collapse -->
                <div class="nav-collapse" style="float: right;">
                    <ul class="nav">
                        <li class=""><a href="<?=URL_WEB?>">한국어</a></li>
                        <li class="active"><a href="<?=URL_WEB?>/jp/index.php">日本語</a></li>
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
                可愛くてありがとう~!<br /> 私の顔順位は? 私たちの町美男美女が気になりますか？ 毎日毎日の私の顔を記録したいですか？<br />
                世界で照会してメッセージを付ける新概念コミュニティFaceChart!!!<br />
            </p>
            <p>
                <a href="http://14.63.221.243/facechart/faceChart/output/faceChart.apk" target="_blank" class="btn btn-primary btn-large">Download &raquo;</a>
            </p>
        </div>

        <!-- Example row of columns -->
        <div class="row">
            <div class="span4">
                <h2>理想型ワールドカップ</h2>
                <p>好きな人を選ぶトーナメントゲームだけでも十分楽しいです。</p>
            </div>
            <div class="span4">
                <h2>ペースチャート照会</h2>
                <p>地域、話題別好きなペース順位チャートが照会できます。</p>
            </div>
            <div class="span4">
                <h2>会員写真照会</h2>
                <p>自分がえらんだ優勝者のその間アップロードした写真を見ることができます。</p>
            </div>
            <div class="span4">
                <h2>毎日の私を記録する</h2>
                <p>毎日私の顔を写真で記録し、他の人々反応を確認できます。</p>
            </div>
            <div class="span4">
                <h2>トーナメントを作る</h2>
                <p>自分が直接トーナメントを作って、該当タグの美男美女を対象に理想型ワールドカップができて順位を見ることができます。</p>
            </div>
            <div class="span4">
                <h2>私たちのクラス美男美女クジ</h2>
                <p>ペースチャートにトーナメントを申請して公正に私たちのクラス美男美女トップを選ぶことができます。</p>
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
