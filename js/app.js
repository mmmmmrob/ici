// Generated by CoffeeScript 1.6.2
(function() {
  var defaultZoom, display, displayResults, drawMap, getMarker, layer, locate, map, mapRadius, markers, refreshRate, resultLimit, seenPosition,
    _this = this,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  map = null;

  layer = null;

  markers = {};

  seenPosition = {};

  resultLimit = 200;

  refreshRate = 30 * 1000;

  defaultZoom = 16;

  jQuery(function() {
    var $;

    $ = jQuery;
    if ($.bbq.getState('lat') && $.bbq.getState('lon')) {
      return display();
    } else {
      return locate();
    }
  });

  locate = function() {
    if (Modernizr.geolocation) {
      return navigator.geolocation.getCurrentPosition(function(pos) {
        var lat, lon;

        lat = parseInt(pos.coords.latitude * 10000) / 10000;
        lon = parseInt(pos.coords.longitude * 10000) / 10000;
        $.bbq.pushState({
          lat: lat,
          lon: lon,
          zoom: defaultZoom
        });
        return display();
      }, function(error) {
        var lat, lon, zoom;

        lat = lat = 38.8951;
        lon = -77.0363;
        zoom = defaultZoom;
        $.bbq.pushState({
          lat: lat,
          lon: lon,
          zoom: defaultZoom
        });
        $("#byline").replaceWith("HTML Geo features are not available in your browser ... so here's Washington DC");
        return display();
      }, {
        timeout: 10000
      });
    }
  };

  display = function() {
    var lat, lon, radius, zoom;

    lat = $.bbq.getState('lat');
    lon = $.bbq.getState('lon');
    zoom = $.bbq.getState('zoom') || defaultZoom;
    drawMap(lat, lon, zoom);
    radius = mapRadius();
    if (radius > 10000) {
      radius = 10000;
    }
    if (seenPosition["" + lat + ":" + lon + ":" + radius]) {
      return;
    }
    seenPosition["" + lat + ":" + lon + ":" + radius] = true;
    layer.fire('data:loading');
    return geojson([lon, lat], {
      limit: resultLimit,
      radius: radius,
      images: true,
      summaries: true,
      templates: true
    }, displayResults);
  };

  drawMap = function(lat, lon, zoom) {
    if (!map) {
      map = L.map('map', {
        center: [lat, lon],
        zoom: zoom,
        maxZoom: 17,
        minZoom: 13
      });
      layer = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 22
      });
      layer.addTo(map);
      map.on('dragend', function(e) {
        var center;

        center = map.getCenter();
        $.bbq.pushState({
          lat: center.lat,
          lon: center.lng
        });
        return display();
      });
      return map.on('zoomend', function(e) {
        $.bbq.pushState({
          zoom: map.getZoom()
        });
        return display();
      });
    }
  };

  displayResults = function(results) {
    var article, marker, _i, _len, _ref;

    _ref = results.features;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      article = _ref[_i];
      if (markers[article.properties.name]) {
        continue;
      }
      if (!article.geometry || !article.geometry.coordinates) {
        console.log("article " + article.properties.name + " missing geo from api");
        continue;
      }
      marker = getMarker(article);
      marker.addTo(map);
      markers[article.properties.name] = marker;
    }
    return layer.fire('data:loaded');
  };

  getMarker = function(article) {
    var color, help, icon, marker, needsWorkTemplates, pos, summary, template, url, _i, _len, _ref;

    pos = [article.geometry.coordinates[1], article.geometry.coordinates[0]];
    url = article.id;
    icon = "book";
    color = "blue";
    help = '';
    needsWorkTemplates = ["Copy edit", "Cleanup-copyedit", "Cleanup-english", "Copy-edit", "Copyediting", "Gcheck", "Grammar", "Copy edit-section", "Copy edit-inline", "messages/Cleanup", "Tone"];
    _ref = article.properties.templates;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      template = _ref[_i];
      if (__indexOf.call(needsWorkTemplates, template) >= 0) {
        icon = "icon-edit";
        color = "orange";
        help = "This article is in need of copy-editing.";
      }
      if (template === "Citation needed" || template === "Citation") {
        icon = "icon-external-link";
        color = "orange";
        help = "This article needs one or more citations.";
      }
    }
    if (!article.properties.image) {
      icon = "icon-camera-retro";
      color = "red";
      help = "This article needs an image.";
    }
    marker = L.marker(pos, {
      title: article.properties.name,
      icon: L.AwesomeMarkers.icon({
        icon: icon,
        color: color
      })
    });
    summary = article.properties.summary;
    if (summary && summary.length > 500) {
      summary = summary.slice(0, 501) + " ... ";
    }
    marker.bindPopup("<div class='summary'><a target='_new' href='" + url + "'>" + article.properties.name + "</a> - " + summary + " <div class='help'>" + help + "</div></div>");
    return marker;
  };

  mapRadius = function() {
    var ne, radius;

    ne = map.getBounds().getNorthEast();
    radius = ne.distanceTo(map.getCenter());
    console.log("radius=" + radius);
    return radius;
  };

}).call(this);
