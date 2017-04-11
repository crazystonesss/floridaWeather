var chart;
$(document).ready(function() {
  var stdID_global;
    addBarChart = function(evt,TagName, stdID){
        stdID_global = stdID;
        // close other tag and open graph
        openTag(evt, TagName);
        getChart('graphRender', 'temp2fts', 'Dry Bulb Temperature', 'Temperature °F');
        // getChart('rainFall2mInch_FAWN', 'rainFall', 'Rain Fall', 'Inch');
        // getChart('wetBulbF_FAWN', 'wetBulbTemp', 'Wet Bulb Temperature', 'Temperature °F');

      changeGraphFAWN = function(){
        var e = document.getElementById("selectBar");
        getChart('graphRender', e.options[e.selectedIndex].value, e.options[e.selectedIndex].text, 'Temperature °F');
      }

      function getChart(renderDiv, target, title, yAxisTitle){
         var chartData = [];

         $.getJSON(url4 + stdID, function(data){
            for (var i = 0; i < data[target].length - 4; i++){
              chartData.push([data[target][i][0], data[target][i][1]]);
            };
            // console.log(chartData);
             chart = new Highcharts.StockChart({
                chart: {
                    renderTo: renderDiv,
                    zoomType: 'x'
                },
                rangeSelector : {
                  // enabled : false
                  buttons: [{
                      type: 'hour',
                      count: 4,
                      text: '1h'
                    }, {
                      type: 'hour',
                      count: 12,
                      text: '12h'
                    }, {
                      type: 'hour',
                      count: 24,
                      text: '24h'
                    }, {
                      type: 'day',
                      count: 1,
                      text: '1d'
                    }, {
                      type: 'day',
                      count: 3,
                      text: '3d'
                    }, {
                      type: 'day',
                      count : 7,
                      text: '7d'
                  }]
                },
                title: {
                  text: title
                },
                xAxis: {
                  type: 'datetime',
                },
                yAxis: {
                    title: {
                      text: yAxisTitle
                    }    
                },
                series: [{
                    Name: 'FAWN',
                    data: chartData,
                    tooltip: {
                      valueDecimals: 2
                    }
                }],
            });
            var height_temp = $('.esriPopupWrapper').height();
            var width_temp = $('.esriPopupWrapper').width()
            chart.setSize(width_temp - 36, height_temp - 168, doAnimation = true);      
         });
    }

    

    $(".owl-carousel").owlCarousel({
          //  navigation : true, // Show next and prev buttons
            slideSpeed : 300,
            paginationSpeed : 400,
            singleItem:true,
            mouseDrag: false
    });

  }

  addBarChartFdacswx = function(evt,TagName, stdID){
        // close other tag and open graph
      openTag(evt, TagName);

      changeGraphFadacswx = function(){
        var e = document.getElementById("selectBar");
        // console.log(e.options[e.selectedIndex].value);
        getChart('graphRender', e.options[e.selectedIndex].value, e.options[e.selectedIndex].text, 'Temperature °F'); 
      }

      function getChart(renderDiv, target, title, yAxisTitle){
         var chartData = [];
         $.getJSON(url3 + stdID + url3_1, function(data){
          // console.log(data[0][target]);
            for (var i = 0; i < data.length; i++){
              var float = parseFloat(data[i][target]);
              chartData.push([data[i].date_time, float]);
            };
            // console.log(chartData);
           chart = new Highcharts.StockChart({
              chart: {
                  // renderTo: 'graph',
                  renderTo: renderDiv,
                  zoomType: 'x'
              },
              rangeSelector : {
                // enabled : false
                buttons: [{
                    type: 'hour',
                    count: 4,
                    text: '1h'
                  }, {
                    type: 'hour',
                    count: 12,
                    text: '12h'
                  }, {
                    type: 'hour',
                    count: 24,
                    text: '24h'
                  }, {
                    type: 'day',
                    count: 3,
                    text: '3d'
                  }, {
                    type: 'day',
                    count : 7,
                    text: '7d'
                }]
              },
              title: {
                text: title
              },
              xAxis: {
                type: 'datetime',
                // categories : date
              },
              yAxis: {
                  title: {
                    text: yAxisTitle
                  }    
              },
              series: [{
                  Name: 'Fdacswx',
                  data: chartData,
                  tooltip: {
                    valueDecimals: 2
                  }
              }]
            });
          var height_temp = $('.esriPopupWrapper').height();
          var width_temp = $('.esriPopupWrapper').width()
          chart.setSize(width_temp - 36, height_temp - 170, doAnimation = true); 
         });
    }
    getChart('graphRender', 'dry_bulb_air_temp', 'Dry Bulb Air Temperature', 'Temperature °F');
    // getChart('rainFall_Fdacswx', 'rainfall', 'Rain Fall', 'Inch');
    // getChart('wetTemp_Fdacswx', 'wet_bulb_temp', 'Wet Bulb Temperature', 'Temperature °F');

    $(".owl-carousel").owlCarousel({
          //  navigation : true, // Show next and prev buttons
            slideSpeed : 300,
            paginationSpeed : 400,
            singleItem:true,
            mouseDrag: false
    });
  }
})
