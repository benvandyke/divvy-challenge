$(function() {
    var map = L.mapbox.map('map', 'btvandyke.hdl69ai8')
	.setView([41.877181,-87.627844], 13);

    // Data vars
    var stationSummmaryData = [];
    var top5Data = [];
    var hourlyData = [];
    var monthlyData = [];
    var userData = [];
    var genderData = [];

    // Key functions
    var key = function(d) { return d['name']; };
    var monthlyKey = function(d) { return d['mth']; };
    var userKey = function(d) { return d['usertype']; };

    d3.json("../data/stations.json", function(json) {

	var geoJson = L.geoJson(json, {
	    pointToLayer: function(feature, latlng) {
		return L.circleMarker(latlng, {
		    radius: 10,
		})
	    },
	    onEachFeature: onEachFeature
	}).addTo(map);

     });

    function onEachFeature(feature, layer) {
	layer.on({
	    mouseover: stationMouseover
	});
    }

    function stationMouseover(e) {
	var layer = e.target;
	var stationName = layer.feature.properties.name;
	$('#station-select').text(stationName);
	updateStationData(stationName);
	updateDestinationData(stationName);
	updateHourlyChart(stationName);
	updateMonthlyChart(stationName);
	updateUserChart(stationName);
	updateGenderChart(stationName);
    }
    
    /*
    // Inititialize Map
    d3.csv('Divvy_Stations_2013_ids.csv', function(data) {
	var geoJson = {
	    type: 'FeatureCollection',
	    features: []
	};

	data.forEach(function(d) {
	    geoJson.features.push({type: 'Feature',
				   properties: {
				       title: d.name,
				       station_id: d.station_id,
				       description: d.dpcapacity + " Docks"
				   },
				   geometry: {
				       type: 'Point',
				       coordinates: [d.longitude, d.latitude]
				   }
				  }
				 );
	}); // end forEach

	map.featureLayer.setGeoJSON(geoJson);
	
	map.featureLayer.on('mouseover', function(e) {
	    var stationName = e.layer.feature.properties.title;
	    var stationId = e.layer.feature.properties.station_id;
	    $('#station-select').text(stationName);
	    updateStationData(stationName);
	    updateDestinationData(stationName);
	    updateHourlyChart(stationName);
	    updateMonthlyChart(stationName);
	    updateUserChart(stationName);
	});
    }); // end csv */

    // Load remaining data files
    d3.csv('../data/dailytripranks.csv', function(data) {
	stationSummaryData = data;
    });

    d3.csv('../data/top5.csv', function(data) {
	top5Data = data;
    });

    d3.csv("../data/900hourly.csv", function(data) {
	hourlyData = data;
    });

    d3.csv("../data/mnthlytrips.csv", function(data) {
	monthlyData = data;
    });

    d3.csv("../data/user.csv", function(data) {
	userData = data;
    });

    d3.csv("../data/gender.csv", function(data) {
	genderData = data;
    });

    // Setup the charts
    // Hourly line chart
    var margin = {top: 30, right: 80, bottom: 30, left: 50},
    width = 600 - margin.left - margin.right,
    height = 180 - margin.top - margin.bottom;

    var hourlyX = d3.scale.linear()
	.range([0, width])
	.domain([0, 24]);
    
    var hourlyY = d3.scale.linear()
	.range([height, 0]);
    
    var hourlyXAxis = d3.svg.axis()
	.scale(hourlyX)
	.orient("bottom");
    
    var hourlyYAxis = d3.svg.axis()
	.scale(hourlyY)
	.orient("left")
	.ticks(5);
    
    var line = d3.svg.line()
	.interpolate("basis")
	.x(function(d) { return hourlyX(d.hour); })
	.y(function(d) { return hourlyY(parseFloat(d.trips)); });

    var hourlySvg = d3.select("#hourly-line-chart").append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    hourlySvg.append("g")
	    .attr("class", "x axis")
	    .attr("transform", "translate(0," + height + ")")
	    .call(hourlyXAxis);
	
    hourlySvg.append("g")
	    .attr("class", "y axis")
	    .call(hourlyYAxis)
	    .append("text")
	    .attr("transform", "rotate(-90)")
	    .attr("y", 6)
	    .attr("dy", ".71em")
	    .style("text-anchor", "end")
	    .text("Daily Trips");

    hourlySvg.append("text")
	.attr("x", width / 2)
	.attr("y", 0 - (margin.top / 2))
	.attr("text-anchor", "middle")
	.style("font-size", "14px")
	.text("Daily Inbound/Outbound Trips By Hour");

    var hourlyLabels = ['fromtrips', 'totrips'];
    var hourlyLegendLabels = ['Outbound', 'Inbound'];
    var colors = {fromtrips: '#d7191c', totrips: '#2c7bb6'};
    var hourlyColors = ['#d7191c', '#2c7bb6'];
  
    var hourlyLegend = hourlySvg.append("g")
	.attr("class", "legend")
	.attr("height", 100)
	.attr("width", 100);

    hourlyLegend.selectAll("rect")
	.data(hourlyColors)
	.enter()
	.append("rect")
	.attr("x", width - 65)
	.attr("y", function(d, i) { return i * 20; })
	.attr("width", 10)
	.attr("height", 10)
	.style("fill", function(d, i) { return hourlyColors[i]; });
    
    hourlyLegend.selectAll("text")
	.data(hourlyColors)
	.enter()
	.append("text")
	.attr("x", width - 45)
	.attr("y", function(d, i) { return i * 20 + 9; })
	.text(function(d, i) { return hourlyLegendLabels[i]; });



    // Monthly bar chart
    var monthlyX = d3.scale.ordinal()
	.rangeRoundBands([0, width], .1)
	.domain(['6', '7','8','9','10','11','12']);
    
    var monthlyY = d3.scale.linear()
	.range([height, 0]);
    
    var mthFmt = {6: 'Jun',
		  7: 'Jul',
		  8: 'Aug',
		  9: 'Sep',
		  10: 'Oct',
		  11: 'Nov',
		  12: 'Dec'
		 };

    var monthlyXAxis = d3.svg.axis()
	.scale(monthlyX)
	.orient("bottom")
	.tickFormat(function(d) { return mthFmt[d]; });
    
    var monthlyYAxis = d3.svg.axis()
	.scale(monthlyY)
	.orient("left")
	.ticks(5);

    var monthlySvg = d3.select("#monthly-bar-chart").append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    monthlySvg.append("g")
	    .attr("class", "x axis")
	    .attr("transform", "translate(0," + height + ")")
	    .call(monthlyXAxis);
	
    monthlySvg.append("g")
	    .attr("class", "y axis")
	    .call(monthlyYAxis)
	    .append("text")
	    .attr("transform", "rotate(-90)")
	    .attr("y", 6)
	    .attr("dy", ".71em")
	    .style("text-anchor", "end")
	    .text("Monthly Trips");

    monthlySvg.append("text")
	.attr("x", width / 2)
	.attr("y", 0 - (margin.top / 2))
	.attr("text-anchor", "middle")
	.style("font-size", "14px")
	.text("Total Trips By Month");


    // Usertype donut chart
    var donutMargin = {top: 50, right: 20, bottom: 10, left: 20};

    var donutWidth = 250 - donutMargin.left - donutMargin.right,
    donutHeight = 250 - donutMargin.top - donutMargin.bottom,
    donutRadius = Math.min(donutWidth, donutHeight) / 2;

    var color = d3.scale.category20();
    var userColor = ['#fdae61', '#abdda4'];
    var userLegendLabels = ['Customer', 'Subscriber'];

    var arc = d3.svg.arc()
	.outerRadius(donutRadius - 10)
	.innerRadius(donutRadius - 60);

    var pie = d3.layout.pie()
	.sort(null)
	.value(function(d) { return d.trips; })

    var userSvg = d3.select("#user-chart").append("svg")
	.attr("width", donutWidth + donutMargin.left + donutMargin.right)
	.attr("height", donutHeight + donutMargin.bottom)
	.append("g")
	.attr("transform", "translate(" + donutWidth / 2 + "," + donutHeight / 2 + ")");

    var s = [{usertype: 'customer', trips: 100},
	     {usertype: 'subscriber', trips: 200}];

    var userPath = userSvg.datum(s).selectAll("path")
	.data(pie)
	.enter()
	.append("path")
	.attr("fill", function(d, i) { return userColor[i]; })
	.attr("d", arc)
	.each(function(d) { this._current = d; });

    var userLabels = userSvg.datum(s).selectAll("text")
	.data(pie)
	.enter()
	.append("text")
	.attr("transform", function(d) {return "translate(" + arc.centroid(d) + ")"; })
	.text(function(d, i) {return userLegendLabels[i]; });

    // Gender donut chart
    var genderColor = ['#dfc27d','#80cdc1'];
    var genderLegendLabels = ['Female', 'Male'];
    var arc = d3.svg.arc()
	.outerRadius(donutRadius - 10)
	.innerRadius(donutRadius - 60);

    var pie = d3.layout.pie()
	.sort(null)
	.value(function(d) { return d.trips; })

    var genderSvg = d3.select("#gender-chart").append("svg")
	.attr("width", donutWidth + donutMargin.left + donutMargin.right)
	.attr("height", donutHeight + donutMargin.bottom)
	.append("g")
	.attr("transform", "translate(" + donutWidth / 2 + "," + donutHeight / 2 + ")");

    var s = [{gender: 'male', trips: 100},
	     {gender: 'female', trips: 200}];

    var genderPath = genderSvg.datum(s).selectAll("path")
	.data(pie)
	.enter()
	.append("path")
	.attr("fill", function(d, i) { return genderColor[i]; })
	.attr("d", arc)
	.each(function(d) { this._current = d; });

    var genderLabels = genderSvg.datum(s).selectAll("text")
	.data(pie)
	.enter()
	.append("text")
	.attr("transform", function(d) {return "translate(" + arc.centroid(d) + ")"; })
	.text(function(d, i) {return genderLegendLabels[i]; });


  function updateStationData(stationName) {
      var stationData = stationSummaryData.filter(function(d) { 
	  return d['from_station_name'] == stationName; 
      });

      $('#daily-trips').text(stationData[0]['dailytrips'] + ' trips');
      $('#daily-trips-rank').text(Math.round(stationData[0]['tripranks']));
      $('#subscriber-age').text(Math.round(stationData[0]['age']) + ' years');
      $('#subscriber-age-ranks').text(Math.round(stationData[0]['ageranks']));
      $('#duration').text(stationData[0]['duration'] + ' min');
      $('#duration-ranks').text(Math.round(stationData[0]['durranks']));
      $('#distance').text(stationData[0]['dist'] + ' miles');
      $('#distance-ranks').text(Math.round(stationData[0]['distranks']));
  }

    function updateGenderChart(stationName) {
	var genders = genderData.filter(function(d) {
	    return d['from_station_name'] == stationName;
	});

	var totalTrips = genders.reduce(function(a,b) {
	    return parseInt(a.trips) + parseInt(b.trips);
	});

	var genderPerc = genders.map(function(d) {
	    return Math.round(parseInt(d.trips) / totalTrips * 100);
	});


	genders.forEach(function(d) {
	    d.trips = +d.trips;
	});

	genderPath = genderSvg.datum(genders).selectAll("path")
	    .data(pie);

	genderPath.transition()
	    .attrTween("d", arcTween);

	genderLabels = genderSvg.datum(genders).selectAll("text")
	    .data(pie);

	genderLabels.transition()
	    .attr("transform", function(d) {return "translate(" + arc.centroid(d) + ")"; })
	    .text(function(d, i) {return genderLegendLabels[i] + " " + genderPerc[i]+"%"; });
	
	
    } // End updateGender


    function updateUserChart(stationName) {
	var users = userData.filter(function(d) {
	    return d['from_station_name'] == stationName;
	});

	var totalTrips = users.reduce(function(a,b) {
	    return parseInt(a.trips) + parseInt(b.trips);
	});

	var userPerc = users.map(function(d) {
	    return Math.round(parseInt(d.trips) / totalTrips * 100);
	});

	users.forEach(function(d) {
	    d.trips = +d.trips;
	});

	
	userPath = userSvg.datum(users).selectAll("path")
	    .data(pie);

	userPath.transition()
	    .attrTween("d", arcTween);

	userLabels = userSvg.datum(users).selectAll("text")
	    .data(pie);

	userLabels.transition()
	    .attr("transform", function(d) {return "translate(" + arc.centroid(d) + ")"; })
	    .text(function(d, i) {return userLegendLabels[i] + " " + userPerc[i]+"%"; });
	
	
    } // End updateUser

    function arcTween(a) {
	var i = d3.interpolate(this._current, a);
	this._current = i(0);
	return function(t) {
	    return arc(i(t));
	};
    }

    function updateHourlyChart(stationName) {
	var hourlyStationData = hourlyData.filter(function(d) { 
	    return d['station'] == stationName; 
	});

	hourlyY.domain([0,
		  d3.max(hourlyStationData, function(d) {return parseFloat(d.trips); })]);
	
	var trips = hourlyLabels.map(function(d) {
	    return {name: d,
		    station: stationName,
		    values: hourlyStationData.filter(function(v) {
			return v.type == d;
		    })
		   };
	});

	var trip = hourlySvg.selectAll(".line")
	    .data(trips, key);

	trip.enter()
	    .append("path")
	    .attr("class", "line")
	    .attr("d", function(d) { return line(d.values); })
	    .style("stroke", function(d) { return colors[d.name];})
	    .style("fill", function(d) { return colors[d.name];})
	    .style("fill-opacity", 0.5);

	trip.transition()
	    .duration(300)
	    .attr("class", "line")
	    .attr("d", function(d) { return line(d.values); })
	    .style("stroke", function(d) { return colors[d.name];})
	    .style("fill", function(d) { return colors[d.name];})
	    .style("fill-opacity", 0.5);

	trip.exit()
	    .remove();

	hourlySvg.select(".y.axis")
	    .transition()
	    .call(hourlyYAxis);

    } // End updateHourly function

    function updateMonthlyChart(stationName) {
	var monthlyStationData = monthlyData.filter(function(d) { 
	    return d['from_station_name'] == stationName; 
	});

	// Update the yscale
	monthlyY.domain([0,
			 d3.max(monthlyStationData, function(d) {
			     return parseFloat(d.mthlytrips); })
			]);

	var bars = monthlySvg.selectAll(".bar")
	    .data(monthlyStationData, monthlyKey);

	bars.enter()
	    .append("rect")
	    .attr("class", "bar")
	    .attr("x", function(d) { return monthlyX(d.mth); })
	    .attr("width", monthlyX.rangeBand())
	    .attr("y", function(d) { return monthlyY(d.mthlytrips); })
	    .attr("height", function(d) { 
		return height - monthlyY(d.mthlytrips); 
	    });

	bars.transition()
	    .attr("class", "bar")
	    .attr("x", function(d) { return monthlyX(d.mth); })
	    .attr("width", monthlyX.rangeBand())
	    .attr("y", function(d) { return monthlyY(d.mthlytrips); })
	    .attr("height", function(d) { 
		return height - monthlyY(d.mthlytrips); 
	    });

	bars.exit()
	    .remove();

	var barLabels = 

	monthlySvg.select(".y.axis")
	    .transition()
	    .call(monthlyYAxis);

    } // End updateMonthly function


    function updateDestinationData(stationName) {
	var top5Dest = top5Data.filter(function(d) { 
	  return d['from_station_name'] == stationName; 
      });
	$('.dest-row').remove();
	top5Dest.forEach(function(d) {
	    $('#dest-table > tbody:last').append('<tr class="dest-row"><td>' + d['to_station_name'] + '</td><td>' + d['dailytrips'] +'</td></tr>');
	});
    } // End updateDestination function
});
  
