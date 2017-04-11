    // map is global for other js file to use
    var popup;
      require([
        "esri/map",
        "esri/dijit/Search",
      	"dojo/dom-construct",
        "esri/symbols/SimpleFillSymbol",
      	"esri/dijit/InfoWindow",
        "esri/dijit/Popup",
        "esri/dijit/PopupTemplate",
      	"esri/InfoTemplate",
        "esri/geometry/Point",
        "esri/symbols/SimpleMarkerSymbol",
        "esri/symbols/TextSymbol",
        "esri/graphic",
        "esri/Color",
        "esri/renderers/SimpleRenderer",
        "esri/symbols/SimpleLineSymbol" ,
        "esri/layers/FeatureLayer",
        "esri/layers/GraphicsLayer",
        "dojo/dnd/Moveable",
        "dojo/dom",
        "dojo/ready",
        "dojo/query",
        "dojo/on",
        "dojo/dom-style",
        "dojo/dom-class",
        "dojo/_base/connect",
        "dojo/domReady!"
      ], function(
        Map, Search, domConstruct, SimpleFillSymbol, InfoWindow, Popup, PopupTemplate, InfoTemplate, Point, SimpleMarkerSymbol,TextSymbol,Graphic,Color,SimpleRenderer,SimpleLineSymbol,FeatureLayer, GraphicsLayer, Moveable, dom,ready,query, on,domStyle, domClass, connect
      ) {

      var lastestDataNameFawn = ['stnName', 'dateTimes','temp2mF', 'windSpeed10mMph','relHum2mPct','temp60cmF','temp10mF','soilTemp10cmF', 'rainFall2mInch','totalRad2mWm2','windDir10mDeg','dewPoint2mF'];

      // var lastestDataNameFawn = ['stnName', 'stnID', 'dateTimes','temp2mF','temp60cmF','temp10mF','soilTemp10cmF', 'rainFall2mInch','totalRad2mWm2','windSpeed10mMph','windDir10mDeg','dewPoint2mF','bp2m','county','facility','wetBulbF','dailyMinTempF','dailyAvgTempF','dailyTotalRainInch','weeklyTotalRainInch','weeklyStartDate','weeklyEndDate'];

      var lastestDataNameFdacswx = ['station_id', 'date_time', 'dry_bulb_air_temp', 'wet_bulb_temp', 'humidity', 'wind_speed', 'wind_direction', 'rainfall', 'latitude', 'longitude', 'total_rain_inche_since_installed', 'start_date_of_total_rain', 'station_name', 'vendor_name', 'time_zone', 'solar_radiation', 'et', 'solar_radiation_field_name', 'minutes_old', 'hasET', 'hasSolarRadiation', 'hasRemote', 'hasSoilMoisture', 'standard_date_time', 'fresh', 'grower_name'];

        popup = new Popup({
          titleInBody: true,
          anchor : "auto",
        }, domConstruct.create("div"));

        // create map and layers
        map = new Map("map", {
          basemap: "streets",
          center: [-81.379234,28.53833],
          zoom: 8,
          infoWindow: popup,
          sliderPosition: "top-right",
          // sliderStyle: "large"
        });

      // title : "<div class='title'><h1>StationName:  {stnName}</h1><h4 style='float:right; font:initial; width: 100%'>lng:{lng} ／ lat:{lat}</h4></div>",
        // PopupTemplate generate function
      var popupTemplateGenerateFawn = {
          title : "<div class='title'><h1>{stnName}</h1><h4 style='float:right; font:initial; width: 100%'>{dateTimes}</h4></div>",
          descriptionStart : "<ul class='tab'>" +
            "<li><a class='tablinks' onclick='openTag(event,&#39;current&#39;)'>Current</a></li>" +
            "<li><a class='tablinks' onclick='addBarChart(event, &#39;graph&#39;, {stnID})'>Graph</a></li>" +
            "<li><a class='tablinks' onclick='openForcast(event,&#39;forcast&#39;, {lng}, {lat})'>Prediction</a></li>" +
            "<li><a class='tablinks' onclick='openToolkit(event,&#39;Toolkit&#39;)'>Toolkit</a></li>" +
            "</ul>" +
            "<div id='current' class='tabcontent' style='background-color: white; display: block'>",

          descriptionEnd:
             "</div>"
             +  "<div id='graph' class='tabcontent'>"
             +    "<select id='selectBar' value='Dry Temperature' onchange='changeGraphFAWN()'>"
             +       "<option value='temp2fts'> Dry Temperature </option>"
             +       "<option value='wetBulbTemp'>  Wet Temperature</option>" 
             +       "<option value='rainFall'>  Rain Fall</option>"
             +    "</select>"
             +    "<div id='graphRender' style='overflow:hidden'></div>"
             +  "</div>"
             +  "<div id='forcast' class='tabcontent' style='background-color: white; display: none' ></div>"
             +  "<div id='Toolkit' class='tabcontent' style='background-color: white; display: none'>"
             +  "<button type='button' style='display: block' onclick='window.open(&#39;http://uffawn-datareport.appspot.com/&#39;)' value='Cold Protection'>Cold Protection Toolkit</button>"
             + "<button type='button' style='display: block' onclick='window.open(&#39;http://uffawn-datareport.appspot.com/&#39;))' value='Irrigation Scheduler Toolkit' >Irrigation Scheduler Toolkit</button>"
             + "<button type='button' style='display: block' onclick='window.open(&#39;http://uffawn-datareport.appspot.com/&#39;))' value='Freeze Alert Notification System'>Freeze Alert Notification System</button>"
             + "</div>",

          descriptionContent : '',
          json : { },
          setContent : function(descripContent){
            // this.descriptionContent = descripContent;
              // console.log(descripContent);
              for (var i = 5; i < descripContent.length; i++) {
                this.descriptionContent = this.descriptionContent.concat("<div style='border-bottom: 1px dotted #e9e9e9'><span style='font-weight:700'>" +  descripContent[i] + ":</span><span style='float:right; color: #999'>{" + descripContent[i] + "}</span></div>");
              }
              // console.log(this.descriptionContent);

              return this.json = { title: this.title, description: this.descriptionStart + this.descriptionContent + this.descriptionEnd };
          }
      }

      var popupTemplateGenerateFadacswx = {
          title : "<div class='title'><h1>StationName:  {station_name}</h1><h4 style='float:right; font:initial; width: 100%'>lng:{longitude} ／ lat:{latitude}</h4></div>",
          descriptionStart : "<ul class='tab'>" +
            "<li><a class='tablinks' onclick='openTag(event,&#39;current&#39;)'>Current</a></li>" +
            "<li><a class='tablinks' onclick='addBarChartFdacswx(event, &#39;graph&#39;, {station_id})'>Graph</a></li>" +
            "<li><a class='tablinks' onclick='openForcast(event,&#39;forcast&#39;, {longitude}, {latitude})'>Prediction</a></li>" +
            "<li><a class='tablinks' onclick='openToolkit(event,&#39;Toolkit&#39;)'>Toolkit</a></li>" +
            "</ul>" +
            "<div id='current' class='tabcontent' style='background-color: white; display: block'>",

          descriptionEnd:
             "</div>"
             +  "<div id='graph' class='tabcontent'>"
             +    "<select id='selectBar' value='Dry Temperature' onchange='changeGraphFadacswx()'>"
             +       "<option value='dry_bulb_air_temp'> Dry Temperature </option>"
             +       "<option value='wet_bulb_temp'>  Wet Temperature</option>" 
             +       "<option value='rainfall'>  Rain Fall</option>"
             +    "</select>"
             +    "<div id='graphRender' style='overflow:hidden' class='graphRender'></div>"
             +  "</div>"
             +  "<div id='forcast' class='tabcontent' style='background-color: white; display: none' ></div>"
             +  "<div id='Toolkit' class='tabcontent' style='background-color: white; display: none'>"
             +  "<button type='button' style='display: block' onclick='coldp(&#39;{grower_name}&#39;, &#39;{station_name}&#39;)' value='Cold Protection'>Cold Protection Toolkit</button>"
             + "<button type='button' style='display: block' onclick='window.open(&#39;http://uffawn-datareport.appspot.com/&#39;))' value='Irrigation Scheduler Toolkit' >Irrigation Scheduler Toolkit</button>"
             + "<button type='button' style='display: block' onclick='window.open(&#39;http://uffawn-datareport.appspot.com/&#39;))' value='Freeze Alert Notification System'>Freeze Alert Notification System</button>"
             + "</div>",

          descriptionContent : '',
          json : { },
          setContent : function(descripContent){
            // this.descriptionContent = descripContent;
              // console.log(descripContent);
              for (var i = 0; i < descripContent.length; i++) {
                this.descriptionContent = this.descriptionContent.concat("<div style='border-bottom: 1px dotted #e9e9e9'><span style='font-weight:700'>" +  descripContent[i] + ":</span><span style='float:right; color: #999'>{" + descripContent[i] + "}</span></div>");
              }
              // console.log(this.descriptionContent);
              return this.json = { title: this.title, description: this.descriptionStart + this.descriptionContent + this.descriptionEnd };
          }
      }

    var templateFdacswx = new PopupTemplate(popupTemplateGenerateFadacswx.setContent(lastestDataNameFdacswx));

    var templateFawn = new PopupTemplate(popupTemplateGenerateFawn.setContent(lastestDataNameFawn));

    gl_attr = new GraphicsLayer({
      infoTemplate: templateFawn,
      outFields:["*"],

      // showAttribution: true
    });

    gl_attr_temp = new GraphicsLayer({
      outFields:["*"],
      minScale: 8000000,
    })

    glAttrFdacswx = new GraphicsLayer({
      infoTemplate: templateFdacswx,
      outFields:["*"],
    });

    glAttrFdacswxTemp = new GraphicsLayer({
      outFields:["*"],
      minScale: 4000000,
    });

    pinpointLayer = new GraphicsLayer({
      outFields:["*"],
    });

    var countyLineSymbol = new SimpleLineSymbol(
      SimpleLineSymbol.STYLE_DASH,
      new Color([0,0,255]),
      3
    );

    var renderer = new SimpleRenderer(countyLineSymbol);

    var featureLayer = new FeatureLayer(url_boundery, {
          mode: FeatureLayer.MODE_ONDEMAND,
          outFields: ["*"],
          opacity : 0.1,
          renderer : renderer
    });
    // console.log(featureLayer);

    loadDataGenerateLayerFawn.getDataCreateLayer(url6, gl_attr);
    loadDataGenerateLayerFawn.getDataCreateLayer(url6, gl_attr_temp);
    loadDataGenerateLayerFdacswx.getDataCreateLayer(url2, glAttrFdacswx);
    loadDataGenerateLayerFdacswx.getDataCreateLayer(url2, glAttrFdacswxTemp);

    map.addLayer(gl_attr);
    map.addLayer(glAttrFdacswx);
    map.addLayer(gl_attr_temp);
    map.addLayer(glAttrFdacswxTemp);
    map.addLayer(featureLayer);
    glAttrFdacswxTemp.visible = false;

    // mapDataFilter(glAttrFdacswxTemp);

        // fawn checkbox
        // var GetStationLyrToggle = dom.byId("GetStation");
        var GetTempLyrToggle = dom.byId("GetTemp");
        var GetWindSpeedLyrToggle = dom.byId("GetWindSpeed");

        //fadacswx checkbox
        var GetTempFdacswx = dom.byId("GetTempFdacswx");
        var GetWindSpeedFdacswx = dom.byId("GetWindSpeedFdacswx");

        //fawn overall control checkbox
        var FawnControlBox = dom.byId('openDropdownMenuFawn');
        var FdacswxControlBox = dom.byId('openDropdownMenuFdacswx');

        on(FawnControlBox, 'change', function(){
          map.removeLayer(pinpointLayer);
          // below part is setting two button exclusive to each other.
            // if (FawnControlBox.checked == true)
            // {
            //   FawnControlBox.checked = false;
            //   var b = 0;
            //     while(gl_attr.graphics[b] != null){
            //       gl_attr.graphics[b].setSymbol(null);
            //       b++;
            //     }
            // }
             
            // if (FawnControlBox.checked == true) {
            //   FawnControlBox.checked = false;
            //   var b = 0;
            //     while(gl_attr.graphics[b] != null){
            //       gl_attr.graphics[b].setSymbol(null);
            //       b++;
            //     }
            // }       

          gl_attr.visible = FawnControlBox.checked;
          // console.log(gl_attr.visible);
          if (gl_attr.visible == true) {
          var i = 0;;
            while(gl_attr.graphics[i] != null){
              var tempSymbol = new SimpleMarkerSymbol().setSize(10).setColor("purple");
              gl_attr.graphics[i].setSymbol(tempSymbol);
              i++;
            }
            //document.getElementById('searchForFawn').style.display = 'block';
            query("#TemperatureLayerFawn").style("display","block");
            query("#WindSpeedLayerFawn").style("display","block");
            gl_attr_temp.show();// = true; // change to delete layer 
          }else{
            var b = 0;
            while(gl_attr.graphics[b] != null){
              gl_attr.graphics[b].setSymbol(null);
              // gl_attr.graphics[b].visible = false;
              b++;
            }
            query("#TemperatureLayerFawn").style("display","none");
            query("#WindSpeedLayerFawn").style("display","none");
            gl_attr_temp.hide();
            //document.getElementById('searchForFawn').style.display = 'none';
          }
          

        })

        // on(GetStationLyrToggle, "change", function(){
        //   map.removeLayer(pinpointLayer);
        //   if (GetTempLyrToggle.checked == true)
        //   {
        //     GetTempLyrToggle.checked = false;
        //     var b = 0;
        //       while(gl_attr.graphics[b] != null){
        //         gl_attr.graphics[b].setSymbol(null);
        //         b++;
        //       }
        //   }
           
        //   if (GetWindSpeedLyrToggle.checked == true) {
        //     GetWindSpeedLyrToggle.checked = false;
        //     var b = 0;
        //       while(gl_attr.graphics[b] != null){
        //         gl_attr.graphics[b].setSymbol(null);
        //         b++;
        //       }
        //   }       

        //   gl_attr.visible = GetStationLyrToggle.checked;
        //   if (gl_attr.visible == true) {
        //   var tempSymbol = new SimpleMarkerSymbol().setSize(10).setColor("purple");
        //   var i = 0;;
        //     while(gl_attr.graphics[i] != null){
        //       gl_attr.graphics[i].setSymbol(tempSymbol);
        //       i++;
        //     }
        //     //document.getElementById('searchForFawn').style.display = 'block';
        //   }else{
        //     var b = 0;
        //     while(gl_attr.graphics[b] != null){
        //       gl_attr.graphics[b].setSymbol(null);
        //       b++;
        //     }
        //     //document.getElementById('searchForFawn').style.display = 'none';
        //   }
        // })

        on(GetTempLyrToggle, "change", function(){
          map.removeLayer(pinpointLayer);
          // console.log(gl_attr_temp);
          if (GetWindSpeedLyrToggle.checked == true) {
              GetWindSpeedLyrToggle.checked = false;
              var b = 0;
              while(gl_attr.graphics[b] != null){
                gl_attr_temp.graphics[b].setSymbol(null);
                b++;
              }
          }

            gl_attr_temp.visible = GetTempLyrToggle.checked;
            if (gl_attr_temp.visible == true) {
            var i = 0;;
              while(gl_attr_temp.graphics[i] != null){
                gl_attr_temp.graphics[i] = gl_attr_temp.graphics[i];
                var t = new TextSymbol(gl_attr_temp.graphics[i].attributes.temp10mF).setColor("purple").setHaloSize(30);
                t.xoffset = 0;
                t.yoffset = -20;
                gl_attr_temp.graphics[i].setSymbol(t);
                i++;
              }
              //document.getElementById('searchForFawn').style.display = 'block';
            }else{
              var b = 0;
              while(gl_attr_temp.graphics[b] != null){
                gl_attr_temp.graphics[b].setSymbol(null);
                b++;
              }
              //document.getElementById('searchForFawn').style.display = 'none';
            }
        });

        on(GetWindSpeedLyrToggle, "change", function(){
            map.removeLayer(pinpointLayer);

            // GetTempFdacswx.checked = false;
            // var b = 0;
            //   while(glAttrFdacswx.graphics[b] != null){
            //     glAttrFdacswx.graphics[b].setSymbol(null);
            //     b++;
            //   }
            //document.getElementById('searchForFadacs').style.display = 'none';
          // if (GetStationLyrToggle.checked == true) {
          //     GetStationLyrToggle.checked = false;
          //     var b = 0;
          //     while(gl_attr.graphics[b] != null){
          //       gl_attr.graphics[b].setSymbol(null);
          //       b++;
          //     }
          // }
          
          if (GetTempLyrToggle.checked == true) {
              GetTempLyrToggle.checked = false;
              var b = 0;
              while(gl_attr_temp.graphics[b] != null){
                gl_attr_temp.graphics[b].setSymbol(null);
                b++;
              }
          }

            gl_attr_temp.visible = GetWindSpeedLyrToggle.checked;
            if (gl_attr_temp.visible == true) {
            //var tempSymbol = new SimpleMarkerSymbol().setSize(10).setColor("red");
            var i = 0;;
              while(gl_attr_temp.graphics[i] != null){
                var t = new TextSymbol(gl_attr_temp.graphics[i].attributes.windSpeed10mMph).setColor("purple").setHaloSize(30);
                t.xoffset = 0;
                t.yoffset = -20;
                gl_attr_temp.graphics[i].setSymbol(t);
                i++;
              }
              //document.getElementById('searchForFawn').style.display = 'block';
            }else{
              var b = 0;
              while(gl_attr_temp.graphics[b] != null){
                gl_attr_temp.graphics[b].setSymbol(null);
                b++;
              }
              //document.getElementById('searchForFawn').style.display = 'none';
            }
        });

        on(GetTempFdacswx, "change", function(){
            map.removeLayer(pinpointLayer);

            if (GetWindSpeedFdacswx.checked == true) {
                GetWindSpeedFdacswx.checked = false;
                var b = 0;
                while(glAttrFdacswxTemp.graphics[b] != null){
                  glAttrFdacswxTemp.graphics[b].setSymbol(null);
                  b++;
                }
            }

            // initializing the visible when fire
            var zoomScale = map.getZoom();
            ZoomInOutScale(glAttrFdacswxTemp, zoomScale);
            // for(var i = 0; i < glAttrFdacswxTemp.graphics.length; i++){
            //   var p1 = new Point();
            //   p1 = glAttrFdacswxTemp.graphics[i].geometry;
            //   for( var j = 0; j < glAttrFdacswxTemp.graphics.length; j++){ 
            //       var p2 = new Point();
            //       p2 = glAttrFdacswxTemp.graphics[j].geometry;  
            
            //       if(Math.sqrt((p1.x - p2.x)*(p1.x - p2.x) + (p1.y - p2.y)*(p1.y - p2.y)) < 0.15 && (p2.y - p1.y) > 0)
            //       {
            //         glAttrFdacswxTemp.graphics[j].visible = false;
            //       }
            //   }
            // }


            glAttrFdacswxTemp.visible = GetTempFdacswx.checked;
            if (glAttrFdacswxTemp.visible == true) {
            var i = 0;
              while(glAttrFdacswxTemp.graphics[i] != null){
                var temp = glAttrFdacswxTemp.graphics[i].attributes.dry_bulb_air_temp;
                // if (temp.length > 4) {
                //   temp = temp.substring(0,3);
                // }
                // console.log(temp.length);
                // // temp = temp.toFixed(2);
                var t = new TextSymbol(temp).setColor("green").setHaloSize(30);
                t.yoffset = -20;
                glAttrFdacswxTemp.graphics[i].setSymbol(t);
                i++;
              }
            }else{
              var b = 0;
              while(glAttrFdacswxTemp.graphics[b] != null){
                glAttrFdacswxTemp.graphics[b].setSymbol(null);
                b++;
              }
            }   
        });

        // on(GetStationFdacswx, "change", function(){
        //     map.removeLayer(pinpointLayer);

        //     // GetTempLyrToggle.checked = false;
        //     // var b = 0;
        //     //   while(gl_attr.graphics[b] != null){
        //     //     gl_attr.graphics[b].setSymbol(null);
        //     //     b++;
        //     //   }
        //     //document.getElementById('searchForFawn').style.display = 'none';
        //     if (GetTempFdacswx.checked == true) {
        //         GetTempFdacswx.checked = false;
        //         var b = 0;
        //         while(glAttrFdacswx.graphics[b] != null){
        //           glAttrFdacswx.graphics[b].setSymbol(null);
        //           b++;
        //         }
        //     }
          
        //     if (GetWindSpeedFdacswx.checked == true) {
        //         GetWindSpeedFdacswx.checked = false;
        //         var b = 0;
        //         while(glAttrFdacswx.graphics[b] != null){
        //           glAttrFdacswx.graphics[b].setSymbol(null);
        //           b++;
        //         }
        //     }

        //     glAttrFdacswx.visible = GetStationFdacswx.checked;
        //     if (glAttrFdacswx.visible == true) {
        //     var tempSymbol = new SimpleMarkerSymbol().setSize(10).setColor("green");
        //     var i = 0;
        //       while(glAttrFdacswx.graphics[i] != null){
        //         glAttrFdacswx.graphics[i].setSymbol(tempSymbol);
        //         i++;
        //       }
        //     }else{
        //       var b = 0;
        //       while(glAttrFdacswx.graphics[b] != null){
        //         glAttrFdacswx.graphics[b].setSymbol(null);
        //         b++;
        //       }
        //     } 
        // });   

        on(FdacswxControlBox, 'change', function() {
          map.removeLayer(pinpointLayer);

            // GetTempLyrToggle.checked = false;
            // var b = 0;
            //   while(gl_attr.graphics[b] != null){
            //     gl_attr.graphics[b].setSymbol(null);
            //     b++;
            //   }
            //document.getElementById('searchForFawn').style.display = 'none';

            // initizaling the visible points on map
            var zoomScale = map.getZoom();
            ZoomInOutScale(glAttrFdacswx, zoomScale);

            glAttrFdacswx.visible = FdacswxControlBox.checked;
            if (glAttrFdacswx.visible == true) {
            var tempSymbol = new SimpleMarkerSymbol().setSize(10).setColor("green");
            var i = 0;
              while(glAttrFdacswx.graphics[i] != null){
                glAttrFdacswx.graphics[i].setSymbol(tempSymbol);
                i++;
              }
              query("#TemperatureLayerFdacswx").style("display","block");
              query("#WindSpeedLayerFdacswx").style("display","block");
              glAttrFdacswxTemp.show();
              glAttrFdacswxTemp.visible = true;
            }else{
              var b = 0;
              while(glAttrFdacswx.graphics[b] != null){
                glAttrFdacswx.graphics[b].setSymbol(null);
                b++;
              }
              query("#TemperatureLayerFdacswx").style("display","none");
              query("#WindSpeedLayerFdacswx").style("display","none");
              glAttrFdacswxTemp.hide();
              glAttrFdacswxTemp.visible = false;
            } 
        })

        on(GetWindSpeedFdacswx, "change", function(){
            map.removeLayer(pinpointLayer);

            // GetTempLyrToggle.checked = false;
            // var b = 0;
            //   while(gl_attr.graphics[b] != null){
            //     gl_attr.graphics[b].setSymbol(null);
            //     b++;
            //   }
            //document.getElementById('searchForFawn').style.display = 'none';
            // if (GetTempFdacswx.checked == true) {
            //     GetTempFdacswx.checked = false;
            //     var b = 0;
            //     while(glAttrFdacswx.graphics[b] != null){
            //       glAttrFdacswx.graphics[b].setSymbol(null);
            //       b++;
            //     }
            // }
          
            if (GetTempFdacswx.checked == true) {
                GetTempFdacswx.checked = false;
                var b = 0;
                while(glAttrFdacswxTemp.graphics[b] != null){
                  glAttrFdacswxTemp.graphics[b].setSymbol(null);
                  b++;
                }
            }

            var zoomScale = map.getZoom();
            ZoomInOutScale(glAttrFdacswxTemp, zoomScale);
            // for(var i = 0; i < glAttrFdacswxTemp.graphics.length; i++){
            //   var p1 = new Point();
            //   p1 = glAttrFdacswxTemp.graphics[i].geometry;
            //   for( var j = 0; j < glAttrFdacswxTemp.graphics.length; j++){ 
            //       var p2 = new Point();
            //       p2 = glAttrFdacswxTemp.graphics[j].geometry;  
            
            //       if(Math.sqrt((p1.x - p2.x)*(p1.x - p2.x) + (p1.y - p2.y)*(p1.y - p2.y)) < 0.15 && (p2.y - p1.y) > 0)
            //       {
            //         glAttrFdacswxTemp.graphics[j].visible = false;
            //       }
            //   }
            // }

            glAttrFdacswxTemp.visible = GetWindSpeedFdacswx.checked;
            if (glAttrFdacswxTemp.visible == true) {
            // var tempSymbol = new SimpleMarkerSymbol().setSize(10).setColor("green");
            var i = 0;
              while(glAttrFdacswxTemp.graphics[i] != null){
                var t = new TextSymbol(glAttrFdacswxTemp.graphics[i].attributes.wind_speed).setColor("green").setHaloSize(30);
                t.yoffset = -20;
                glAttrFdacswxTemp.graphics[i].setSymbol(t);
                i++;
              }
            }else{
              var b = 0;
              while(glAttrFdacswxTemp.graphics[b] != null){
                glAttrFdacswxTemp.graphics[b].setSymbol(null);
                b++;
              }
            } 
        });   

        // MAP zoom event
        connect.connect(map,"onZoomEnd",function(){
            var zoomScale = map.getZoom();
            // console.log(glAttrFdacswxTemp.graphics[10].attributes.wind_speed.length);
            // console.log(glAttrFdacswxTemp.graphics[10].attributes.wind_speed.substring(0,4));
            if (GetWindSpeedFdacswx.checked == true || GetTempFdacswx.checked == true) 
            {
              // console.log("1");
              ZoomInOutScale(glAttrFdacswxTemp, zoomScale);
            }
            ZoomInOutScale(glAttrFdacswx, zoomScale);
        })

        // MAP popup show event
        connect.connect(popup,"onShow",function(){
          var height;
          var width;
          var heightPopup;
          var minHeight;
          $(document).ready(function() {
            width = $("#map").width();
            height = $('#map').height();
          })

          // make sure is anchor is at (25, 25) position;
          popup.maximize(); 
          // popup.resize(width * 0.8 - 25, height * 0.7 - 25);

          //set new width and height to popup window
          var widthPop = width * 0.8;
          var heightPop = height * 0.8;
          $('.esriPopupWrapper').css("height", heightPop);
          $('.esriPopupWrapper').css("width", widthPop);

          // no need to set up minwidth and minheight anymore
          // $('.esriPopupWrapper').css("min-height", height * 0.7 - 25 ); // this line success for fix size
          // $('.esriPopupWrapper').css("max-height", height * 0.7 - 25 ); 
          // $('.esriPopupWrapper').css("min-width", width * 0.8 - 25 ); 
          // $('.esriPopupWrapper').css("max-width", width * 0.8 - 25); 

          // wipe out unnecessary icons
          query(".restore").style("display","none");
          query('.zoomTo').style("display", "none");
          query('.sizer').style("width", "100%");

          // keep content and contentPane changing size with esriPopupWrapper when on fire
          $(document).ready(function() {
            heightPopup = $('.esriPopupWrapper').height();
            document.getElementsByClassName("sizer content")[0].style.height = heightPopup - 20 + "px";
            query('.contentPane').style('max-height', ( heightPopup - 36 ) + "px");
            query(".contentPane").style("height", "100%");
          })
   
          // put popup in the middle
          query(".esriPopupWrapper").style({
            left : ( width - (width * 0.8) )/ 2 - 25 + "px",
            top : ( height - (height * 0.7) )/ 7 - 25 + "px",
          });

          // document.getElementsByClassName("esriPopupWrapper")[0].style.minWidth = width * 0.6 + "px";
          // document.getElementsByClassName("esriPopupWrapper")[0].style.minHeight = height * 0.6 + "px";

          // successfully delete the third sizer div
          document.getElementsByClassName("sizer")[2].style.display = "none"; 


          $(document).ready(function() {
            $(".esriPopupWrapper").resizable({
              start: function(e, ui) {
                // var height_temp = $('.esriPopupWrapper').height();
                // var width_temp = $('.esriPopupWrapper').width()
                // if (chart != null) {
                //   chart.setSize(width_temp - 22, height_temp - 170, doAnimation = true);
                // }
                // document.getElementsByClassName("esriPopupWrapper")[0].style.minWidth = null;
                // document.getElementsByClassName("esriPopupWrapper")[0].style.maxWidth = null;
                // document.getElementsByClassName("esriPopupWrapper")[0].style.minHeight = null;
                // document.getElementsByClassName("esriPopupWrapper")[0].style.maxHeight = null;
                query('.contentPane').style('max-height', 'none');
              },
              resize: function(e,ui){
                var height_temp = $('.esriPopupWrapper').height();
                var width_temp = $('.esriPopupWrapper').width()
                document.getElementsByClassName("sizer content")[0].style.height = height_temp - 20 +"px";
                document.getElementsByClassName("contentPane")[0].style.height = height_temp - 36 +"px";
              },
              stop: function(e,ui){
                var height_temp = $('.esriPopupWrapper').height();
                var width_temp = $('.esriPopupWrapper').width()
                if (chart != null) {
                  chart.setSize(width_temp - 22, height_temp - 170, doAnimation = true);
                }
              }
            });
          })
          delete gl_attr.infoTemplate;
          delete glAttrFdacswx.infoTemplate;
        });

        connect.connect(popup,"onHide",function(){
            gl_attr.infoTemplate = templateFawn;
            glAttrFdacswx.infoTemplate = templateFdacswx;
        })

        // function for drag and a little modify
        // function draggable(){
        //   $(document).ready(function() {     
        //       $(".esriPopupWrapper").draggable({
        //           handle: ".titlePane",
        //           start: function() {
        //           // 
        //           }
        //       });
        //       $('.pointer').remove();
        //       $('.outerPointer').remove();
        //   })
        // }

        function draggableUsingDojo(){
            var handle = query(".titlePane", map.infoWindow.domNode)[0];
            var dnd = new Moveable(map.infoWindow.domNode, {
                handle: handle
            });
            on(dnd, 'FirstMove', function() {
            }.bind(this));
        }

        draggableUsingDojo();

        function ZoomInOutScale(layer, zoomScale){
            for(var k = 0; k < layer.graphics.length; k++){
              layer.graphics[k].visible = true;
              // glAttrFdacswx.graphics[k].visible = true;
            }

            // calculating relative visible and invisible
            for(var i = 0; i < layer.graphics.length; i++){
              var p1 = new Point();
              p1 = layer.graphics[i].geometry;

              for( var j = 0; j < layer.graphics.length; j++){ 
                  var p2 = new Point();
                  p2 = layer.graphics[j].geometry;  

                  if (zoomScale == 8) {
                    if(Math.sqrt((p1.x - p2.x)*(p1.x - p2.x) + (p1.y - p2.y)*(p1.y - p2.y)) < 0.15 && (p2.y - p1.y) > 0){
                      layer.graphics[j].visible = false;
                      // glAttrFdacswx.graphics[j].visible = false;
                    }
                  }
                  
                  if (zoomScale == 9) {
                    if(Math.sqrt((p1.x - p2.x)*(p1.x - p2.x) + (p1.y - p2.y)*(p1.y - p2.y)) < 0.075 && (p2.y - p1.y) > 0){
                      layer.graphics[j].visible = false;
                      // glAttrFdacswx.graphics[j].visible = false;
                    }
                  }

                  if (zoomScale == 10) {
                    if(Math.sqrt((p1.x - p2.x)*(p1.x - p2.x) + (p1.y - p2.y)*(p1.y - p2.y)) < 0.045 && (p2.y - p1.y) > 0){
                      layer.graphics[j].visible = false;
                      // glAttrFdacswx.graphics[j].visible = false;
                    }
                  }

                  if (zoomScale == 11) {
                    if(Math.sqrt((p1.x - p2.x)*(p1.x - p2.x) + (p1.y - p2.y)*(p1.y - p2.y)) < 0.025 && (p2.y - p1.y) > 0){
                      layer.graphics[j].visible = false;
                      // glAttrFdacswx.graphics[j].visible = false;
                    }
                  }

                  if (zoomScale == 12) {
                    if(Math.sqrt((p1.x - p2.x)*(p1.x - p2.x) + (p1.y - p2.y)*(p1.y - p2.y)) < 0.0001 && (p2.y - p1.y) > 0){
                      layer.graphics[j].visible = false;
                      // glAttrFdacswx.graphics[j].visible = false;
                    }
                  }
              }
            }
        }
  });



















