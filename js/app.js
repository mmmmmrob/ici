// Generated by CoffeeScript 1.5.0
(function() {
  var checkImages, display, getImages, init, pageSize;

  pageSize = 25;

  jQuery(function() {
    var $;
    $ = jQuery;
    return init();
  });

  init = function() {
    var lat, lon;
    $(window).bind('hashchange', display);
    lat = $.bbq.getState('lat');
    lon = $.bbq.getState('lon');
    if (lat && lon) {
      return display();
    } else if (Modernizr.geolocation) {
      return navigator.geolocation.getCurrentPosition(function(pos) {
        $.bbq.pushState({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude
        });
        return display(lat, lon);
      });
    } else {
      return console.log("no geo :-(");
    }
  };

  display = function() {
    var lat, lon, url;
    lat = $.bbq.getState('lat');
    lon = $.bbq.getState('lon');
    console.log("display " + lat + " " + lon);
    url = ("http://api.geonames.org/findNearbyWikipediaJSON?lat=" + lat + "&lng=" + lon + "&radius=10&username=wikimedia&maxRows=") + pageSize;
    console.log(url);
    return $.ajax({
      url: url,
      dataType: "jsonp",
      jsonpCallback: 'articles'
    });
  };

  this.articles = function(geo) {
    var article, ul, _i, _len, _ref;
    ul = $("#results");
    _ref = geo.geonames;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      article = _ref[_i];
      ul.append($("<li><a class='title' href='http://" + article.wikipediaUrl + "'>" + article.title + "</a><span class='summary hidden-phone'>: " + article.summary + "</span></li>"));
    }
    return checkImages();
  };

  checkImages = function() {
    return $("#results li").each(function(i, li) {
      var title;
      title = $(this).find("a").text();
      return getImages(title, function(images) {
        if (images.length === 0) {
          return $(li).addClass("needImage");
        } else {
          return $(li).addClass("hasImage");
        }
      });
    });
  };

  getImages = function(title, callback) {
    var url;
    url = "http://en.wikipedia.org/w/api.php?action=query&prop=images&format=json&titles=" + title + "&callback=?&imlimit=500";
    return $.getJSON(url, function(data) {
      var images, page, pageId, _ref;
      images = [];
      _ref = data.query.pages;
      for (pageId in _ref) {
        page = _ref[pageId];
        if (page.images != null) {
          images = page.images;
        }
        break;
      }
      return callback(images);
    });
  };

}).call(this);
