      var map;
      require([
        "esri/map", 
      	"dojo/dom-construct",
        "esri/symbols/SimpleFillSymbol",
      	"esri/dijit/InfoWindow",
        "esri/dijit/Popup", 
        "esri/dijit/PopupTemplate",
      	"esri/InfoTemplate",
        "esri/layers/FeatureLayer",
        "esri/geometry/Point",
        "esri/symbols/SimpleMarkerSymbol",
        "esri/symbols/TextSymbol",
        "esri/graphic", 
        "esri/layers/GraphicsLayer",
        "dojo/dom",
        "dojo/on",
        "dojo/domReady!"
      ], function(
        Map, domConstruct, SimpleFillSymbol, InfoWindow, Popup, PopupTemplate, InfoTemplate, FeatureLayer, Point, SimpleMarkerSymbol,TextSymbol, Graphic, GraphicsLayer,dom,on
      ) {
        //var fill = new SimpleFillSymbol("solid", null, new Color("#A4CE67"));
        var popup = new Popup({
            //fillSymbol: fill,
            titleInBody: false
        }, domConstruct.create("div"));

        // create map and layers
        map = new Map("map", {
          basemap: "streets",
          center: [-81.379234,28.53833],
          zoom: 8,
          infoWindow: popup
        });

       var template = new PopupTemplate({
          title: "Fawn Weather Stations Locations",
          description: "Latitude: {YCoord} <br/>" + "Longitude: {XCoord} <br/> Plant Name:{Plant}",
          fieldInfos:[],
          mediaInfos:[]});

  		var gl_temp = new GraphicsLayer({
  			infoTemplate: template,
        	outFields: ["*"]
  			  		});
  		var gl_station = new GraphicsLayer({
  			infoTemplate: template,
        	outFields: ["*"]
  		});
  		var gl_windspeed = new GraphicsLayer({
  			infoTemplate: template,
        	outFields: ["*"]
  		});

  		// testing point
  		var myPoint = {"geometry":{"x":-81.379234,"y":28.53833,
    	"spatialReference":{"wkid":4326}},"attributes":{"XCoord":-104.4140625,
    	"YCoord":69.2578125,"Plant":"Mesa Mint"},"symbol":{"color":[255,0,0,128],
    	"size":12,"angle":0,"xoffset":0,"yoffset":0,"type":"esriSMS",
    	"style":"esriSMSSquare","outline":{"color":[0,0,0,255],"width":1,
    	"type":"esriSLS","style":"esriSLSSolid"}}};
  		var gra = new Graphic(myPoint);
  		gl_temp.add(gra);

        //get data from json
        $.getJSON("http://fawn.ifas.ufl.edu/controller.php/latestmapjson/", function(data){
            for (var i = 0; i < data.stnsWxData.length ;i++) {
              	gl_temp.add(GetTemp(
                data.stnsWxData[i].lng, data.stnsWxData[i].lat, data.stnsWxData[i].temp2mF, data.stnsWxData[i].stnName));
              	gl_station.add(GetStation(data.stnsWxData[i].lng, data.stnsWxData[i].lat, data.stnsWxData[i].stnName));
              	gl_windspeed.add(GetWindSpeed(data.stnsWxData[i].lng, data.stnsWxData[i].lat, data.stnsWxData[i].windSpeed10mMph));
            }
        })

        function GetStation(x,y,z)
        {
          var p = new Point(x,y);
          var s = new SimpleMarkerSymbol().setSize(10).setColor("purple");
          var attr = {"XCoord":x,"YCoord":y,"Plant":z};
  			// infoTemplate.setTitle("${Xcoord}");
  			// infoTemplate.setContent("<B>2000 POPULATION: </B>${Xcoord}<BR/>"
     //     	+ "<B>2000 POPULATION PER SQ. MI.: </B>${Xcoord}<BR/>"
     //     	+ "<B>2007 POPULATION: </B>${Xcoord}<BR/>"
     //     	+ "<B>2007 POPULATION PER SQ. MI.: </B>${Xcoord}");
  			//g.setInfoTemplate(infoTemplate);
          var g = new Graphic(p,s,attr);
          return g;
        }

        function GetWindSpeed(x,y,z){
          var p = new Point(x,y);
          var t = new TextSymbol("windSpeed: " + z + "10mMph").setColor("red");
          var attr = {"XCoord":x,"YCoord":y};
          var g = new Graphic(p,t,attr);
          return g;
        }

        function GetTemp(x,y,z,n){
          var attr = {'longtitude': x, 'latitude': y};
          //var infoTemplate = new InfoTemplate("Locations","Latitude: ${latitude} <br/>Longitude: ${longtitude} <br/>");
          var p = new Point(x,y);
          var t = new TextSymbol(n + " " + z + "\xB0").setColor("red");
          var attr = {"XCoord":x,"YCoord":y,"Plant":n};
          var g = new Graphic(p,t,attr);
          return g;
        };

        //map.addLayer(gl_temp);
        //map.addLayer(gl_station);
        // map.addLayer(gl_windspeed);

        // checkbox changing
        var GetTempLyrToggle = dom.byId("GetTemp");
        var GetStationLyrToggle = dom.byId("GetStation");
        var GetWindSpeedLyrToggle = dom.byId("GetWindSpeed");

        on(GetTempLyrToggle, "change", function(){
          // console.log(GetTempLyrToggle.checked);
          gl_temp.visible = GetTempLyrToggle.checked;
          if(gl_temp.visible == false){
            map.removeLayer(gl_temp);
          }
          else{
            map.addLayer(gl_temp);
          }
        });

        on(GetStationLyrToggle, "change", function(){
            gl_station.visible = GetStationLyrToggle.checked;
            if (gl_station.visible == false) {
              map.removeLayer(gl_station);
            }else{
              map.addLayer(gl_station);
            }
        });

        on(GetWindSpeedLyrToggle, "change", function(){
        	gl_windspeed.visible = GetWindSpeedLyrToggle.checked;
        	if (gl_windspeed.visible == false) {
        		map.removeLayer(gl_windspeed);
        	}
        	else{
        		map.addLayer(gl_windspeed);
        		}
        });


      });