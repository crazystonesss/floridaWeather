<?php
require $_SERVER['DOCUMENT_ROOT'] . '/_includes/server.php';

// base cache on last update time of this file, the news include, the footer,
// and the lastModified.txt file
require $_SERVER['DOCUMENT_ROOT'] . '/_includes/HTTP/ConditionalGet.php';
$cg = new HTTP_ConditionalGet(array(
            'lastModifiedTime' => max(
                    filemtime(__FILE__)
                    , filemtime('news/indexNews.php')
                    , filemtime('_templates/footer.tpl.php')
                    , filemtime('_cache/private/lastModified.txt')
            )
            , 'isPublic' => true
            , 'maxAge' => 900
        ));
$cg->sendHeaders();
// at least start up to check cache freshness
require_once $_SERVER['DOCUMENT_ROOT'] . '/_includes/fawn_init.php';
if ($cg->cacheIsValid) {
    exit(); // done
}

$tpl = Fawn::getTpl('withLeftNav');
$tpl->start('moreHead');
?>
<META HTTP-EQUIV="Expires" CONTENT="Mon, 04 Dec 1999 21:29:02 GMT">
<!--jquery-ui.min.js is used in station position of the map-->
<script src=" https://ajax.googleapis.com/ajax/libs/jqueryui/1.8.21/jquery-ui.min.js"></script>
<script type="text/javascript" src="<?= FAWN_HTML_ROOT; ?>/js/lib/json2.js"></script><!--$http need this in IE 7-->
<script type="text/javascript"src="<?= FAWN_HTML_ROOT; ?>/js/lib/angular/angular.js"></script>
<script type="text/javascript" src="<?= FAWN_HTML_ROOT; ?>/js/Fawn_HomePageController.js"></script>
<link rel="stylesheet" type="text/css" href="<?= FAWN_HTML_ROOT; ?>/styles/homePageMap.css" />
<link rel="stylesheet" type="text/css" href="<?= FAWN_HTML_ROOT; ?>/styles/css.css" />
<link rel="stylesheet" href="http://code.jquery.com/ui/1.11.1/themes/smoothness/jquery-ui.css"/>

<?php
$tpl->end();
$tpl->start('content');
?>
<!-- RECOMMENDED if your web app will not function without JavaScript enabled -->
<noscript>
<div style="width: 22em; position: absolute; left: 50%; margin-left: -11em; color: red; background-color: white; border: 1px solid red; padding: 4px; font-family: sans-serif">
    Your web browser must have JavaScript enabled
    in order for this application to display correctly.
</div>
</noscript>
<!--[if lt IE 9]>

<div class="ui-widget">
    <div class="ui-state-highlight ui-corner-all">
    <strong>Hey!</strong>
    Looks like your browser is out of date. Why not update to the latest version? Click <a href="http://windows.microsoft.com/en-US/windows-8/internet-explorer">Update</a>
</div>
<![endif]-->

<!-- For IE 7, it is crucial that we use the following syntax for wiring in our app-->
<div class="ng-app:homePageMapApp" id="ng-app">
    <div ng-controller="HomePageMapCtrl" id="HomePageMapCtrl">
        <div id="homePageMapContainer" class="responsiveMarker"> 	
            <ul class="mapsTab" class="mapsTabReponsive">
                <li ng-repeat="map in maps" ng-click="afterUserClickTab(map)">
                    <div class="arrow"></div><a id = {{map.id}}  href="">{{map.name}}</a>
                </li>
	      <!--<li><a href="station/sandbox/test.html">Florida Grower Stations</a></li> -->
            </ul>
            <div id="mapsContent" class="ieMapFixes" ng-mouseleave="setDetailWeatherInfo()">
                <img id="countyImg" ng-src="{{displayedMap.countyImageUrl}}" style="position:absolute;left:0px; top:0px; z-index:2;">
                <img id="gradientImg" ng-src="{{displayedMap.imageUrl}}?{{timeStamp|imageURLFilter:stnParaName}}" style="position:absolute; left:0px; top:0px; z-index:1">
                <img id="shadeImg" ng-src="{{displayedMap.shadeImageUrl}}" style="position:absolute;left:0px; top:0px; z-index:0;">
                <div ng-repeat="station in stations" class="stnLabel" id = {{station.stnID}}
                     ng-mouseover="setDetailWeatherInfo(station)" ng-click="goToStnPage(station)" >
                    {{station[stnParaName]|displayedValFilter:stnParaName:station["isFresh"]}}
                </div>
                <div id = "detailedInfo">
                    <div><span id="mapTitle">{{displayedMap.title}}</span></div>
                    <div id="currentTime">{{fawnTime|dateTimeFilter:stnParaName:stations}}</div>
                    
                    <div ng-show="displayedStn">
                        <div id='weatherSummaryTitle'>{{displayedStn.stnName}}
                        <span id="alert_list"><a href="#" ng-click="showMessage('#alert_content');" title=""><img ng-src="{{displayedStn.cautionImgUrl}}" 
                        alt="{{displayedStn.cautionImgAlt}}" title="{{displayedStn.cautionImgAlt}}"/></a></span>
                        </div>
                        <div id='weatherSummaryContent'>
                        <span id ="measureTimestamp">{{displayedStn.dateTimes}}</span><br />
                            <ul>
            	<li><div class="inline-left"><b>{{displayedStn.temp2mF|missingValFilter}}</b> <sub>&deg;F</sub></div>
            		<div class="inline-right">
            		<img id="wind-direction" alt="{{displayedStn.windImgAlt}}" title="{{displayedStn.windImgAlt}}" ng-src={{displayedStn.windDirection}}>
            		</div>
            	</li>
            	<li><div class="inline-left"><b>Wind</b></div>
            		<div class="inline-right">{{displayedStn.windSpeed10mMph|missingValFilter}} mph</div></li>
            		
            	<li><div class="inline-left"><b>Rainfall</b></div>
            	<div class="inline-right "> {{displayedStn.rainFall2mInch|missingValFilter}} in.</div></li>
            	
            	<li><div class="inline-left"><b>Pressure</b></div>
            	<div class="inline-right "> {{displayedStn.bp2m|missingValFilter}} mb</div></li>
            	
            	<li><div class="inline-left"><b>Dew Point</b></div>
            	<div class="inline-right "> {{displayedStn.dewPoint2mF|missingValFilter}} <sub>&deg;F</sub></div></li>
            	
            	<!--li style="font-size:12px;text-align:left;">Click <a style="color:#79BCEC;"ng-href={{displayedDetail.link}}>here</a> 
            	for complete station data</li-->
            	</ul>
                    </div>
                    <div id="forecastTitle">
                    
            	<ul>
            	<li >{{today.label}}</li>
            	<li >{{tomorrow.label}}</li>
            	<li >{{afterTomorrow.label}}</li>
            	</ul>
            	</div>    	
            	<div id="forecastContent">
            	  	
            	<ul >
            	<li><img class= "cloud" ng-src={{today.icon}}></li>
            	<li >{{today.brief}}</li>
            	<li class="{{today.tempLabel}}">{{today.tempLabel}}: {{today.temperature}} <sub>&deg;F</sub></li>
            	</ul>
            	<ul >
            	<li><img class= "cloud" ng-src={{tomorrow.icon}}></li>
            	<li >{{tomorrow.brief}}</li>
            	<li class="{{tomorrow.tempLabel}}">{{tomorrow.tempLabel}}: {{tomorrow.temperature}} <sub>&deg;F</sub></li>
            	</ul>
            	<ul>
            	<li><img class= "cloud" ng-src={{afterTomorrow.icon}}></li>
            	<li >{{afterTomorrow.brief}}</li>
            	<li class="{{afterTomorrow.tempLabel}}">{{afterTomorrow.tempLabel}}: {{afterTomorrow.temperature}} <sub>&deg;F</sub></li>
            	</ul> 
            	<span id="sponsor" style="float:right;padding-top: 5px; font-size:9px;">Forecast provided by NWS</span>     	
            	</div>
                            
                    </div>
                    <div ng-hide="displayedStn">
			<div ng-show="stnParaName=='windSpeedMph'"></div>
			<div ng-hide="stnParaName=='windSpeedMph'">
                        <br/>
                        <b>Rollover</b> measurement for current observation and forecast<br/><br/>

						<b>Click</b> measurement for additional data and tools<br/><br/>
						
						<b>Click</b> <img src='/img/alert.png' style="width:18px; padding-bottom:5px;"/>,if present, for current weather advisories.
                        
			</div>
                    </div>
	          
                </div>
            </div>
            <br/>
           
        </div><!--The end of homePageMapContainter-->
        <div id="HomePageTable">

            <h4>Tap Station Title For More Info</h4>
            <div class="bs-callout bs-callout-warning">
	<a href="">
		<h3>My Florida Farm Weather</h3>
		<p>Crowd sourced weather data for Florida Farmers</p>
	</a>
</div>

            <table class="TowerData clearfix">
                <thead>
                    <tr>
                        <th>Tower</th>
                        <th>Temp.</th>
                    </tr>
                </thead>
                <tbody>
                    <tr ng-repeat="station in stations" class="tower">
                        <td class="towerName"><span ng-click="goToStnPage(station)">{{station.stnName}}</span></td>
                        <td class="towerTemp">{{station.temp2mF}}</td>
                    </tr>
                </tbody>
            </table>
        </div>	
    </div><!--The end of HomePageMapCtrl-->
</div><!--The end of homePageMapApp-->
</div>
<div id="alert_content" title="Current Watches/Warnings">
<div id="alert_left" class='alert-left'>
<ul class='alertNavigation'><ul>
</div>
<div id="alert_message" class='alert-right'>

</div>
</div>
<!--div id="freeze_watch_message" title="Freeze Watch Message">
</div>
<div id="freeze_warning_message" title="Freeze Warning Message">
</div-->
<script>


</script>
<?php
$tpl->endDisplay();
