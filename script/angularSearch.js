    var app = angular.module('myApp', ['kendo.directives']); //'kendo.directives'
    var GrowerName = [];

    //remove duplicate
    angular.forEach(FdacswxStdGrowerFinder, function(value, key){
        if (GrowerName.indexOf(value) == -1) {
            GrowerName.push(value);
        }
    });
    
    GrowerName.sort();//list sorting complete

    app.controller('myCtrl', function($scope) {
  
        // initialize
        $scope.growerNames = GrowerName;
        $scope.stationName = [];
        $scope.items = GrowerName;
        $scope.fawnStationName = FawnStationFinder;

        $scope.onChanged = function(grower) {
          $scope.stationName = null;
          var stationTemp = [];
          angular.forEach(FdacswxStdGrowerFinder, function(value, key){
              if (value == grower) {
                  stationTemp.push(key);
              }
          });
          $scope.stationName = stationTemp;
        }

        //submit() event starts
        $scope.submitFadacs = function(GrowerName, stationName){
          var lat;
          var lng;
          $.getJSON(url2, function(data){
              for (var i = 0; i < data.length; i++) {
                if(data[i].grower_name == GrowerName && data[i].station_name == stationName){
                    lat = data[i].latitude;
                    lng = data[i].longitude;
                }
              }
              if (lat != null && lng != null) {
                 require([
                    "esri/map",
                    "esri/geometry/Point",
                    "esri/symbols/PictureMarkerSymbol",
                    "esri/graphic",
                    "esri/layers/GraphicsLayer",
                    "dojo/domReady!"
                  ], function(
                    Map, Point, PictureMarkerSymbol, Graphic, GraphicsLayer
                  ) {
                      map.removeLayer(pinpointLayer);

                      var pictureMarkerSymbol = new PictureMarkerSymbol('http://www.clker.com/cliparts/W/0/g/a/W/E/map-pin-red-th.png', 31, 51);
                      lng = (parseFloat(lng)).toString();
                      lat = (parseFloat(lat) + 0.04).toString();
                      var p = new Point(lng, lat);
                      var g = new Graphic(p, pictureMarkerSymbol); 
                      
                      map.centerAndZoom(p, 10);
                      pinpointLayer.clear();
                      pinpointLayer.add(g);
                      map.addLayer(pinpointLayer);
                  })
              }
          })
        }
        // submitFadacs() ends

        //submitFawn() starts
        $scope.submitFawn = function(stationName){
          var lat;
          var lng;
          $.getJSON(url6, function(data){
            for (var i = 0; i < data.stnsWxData.length; i++) {
              if (data.stnsWxData[i].stnName == stationName) {
                lat = data.stnsWxData[i].lat;
                lng = data.stnsWxData[i].lng;
              }
            }

            if (lat != null && lng != null) {
              require([
                    "esri/map",
                    "esri/geometry/Point",
                    "esri/symbols/PictureMarkerSymbol",
                    "esri/graphic",
                    "esri/layers/GraphicsLayer",
                    "dojo/domReady!"
                  ], function(
                    Map, Point, PictureMarkerSymbol, Graphic, GraphicsLayer
                  ) {
                      map.removeLayer(pinpointLayer);

                      var pictureMarkerSymbol = new PictureMarkerSymbol('http://www.clker.com/cliparts/W/0/g/a/W/E/map-pin-red-th.png', 31, 51);
                      lng = (parseFloat(lng)).toString();
                      lat = (parseFloat(lat) + 0.04).toString();
                      var p = new Point(lng, lat);
                      var g = new Graphic(p, pictureMarkerSymbol); 
                      
                      map.centerAndZoom(p, 10);
                      pinpointLayer.clear();
                      pinpointLayer.add(g);
                      map.addLayer(pinpointLayer);
                      // pinpointer only show once success
                  })
            }
          })

        }

    });
