var address = 'Norfolk, VA';

var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 15
});

var geocoder = new google.maps.Geocoder();
geocoder.geocode({ 'address': address }, function(results, status) {
    if(status == google.maps.GeocoderStatus.OK) {
        map.setCenter(results[0].geometry.location);
    }
});

function rad (x) {return x*Math.PI/180;}

function distBetween (p1, p2) {
  var R = 6371; // earth's mean radius in km
  var dLat  = rad(p2.lat() - p1.lat());
  var dLong = rad(p2.lng() - p1.lng());

  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) * Math.sin(dLong/2) * Math.sin(dLong/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c;

  return d.toFixed(3) * 1000;
}

function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getArrayOfRandoms(min, max, length, forbiddenValues) {
    if(!forbiddenValues)
        forbiddenValues = []
    var randoms = []
    while(randoms.length < length) {
        var r = getRandomInt(min, max);
        if($.inArray(r, forbiddenValues) === -1 && $.inArray(r, randoms) === -1) {
            randoms.push(r);
        }
    }
    return randoms;
}

var game = function(art) {
    this.totalPoints = 0;
    this.piecesToPlay = getArrayOfRandoms(0, art.length-1, 5);
    this.curTurn = 0;
    
    this.startGame = function() {
        this.playTitle();
    };
    
    this.nextTurn = function() {
        this.curTurn += 1;
        if(this.curTurn === 5){
            this.gameOver();
        } else {
            this.playTitle();
        }
    };
    
    this.playTitle = function() {
        var curPiece = this.piecesToPlay[this.curTurn];
        var points = 20;
        
        // Load image of the piece of art
        $('#instructions').html('Pick the title!');
        $('#art-piece').removeClass('corner');
        $('#art-piece').addClass('center');
        $('#art-piece img').bind('load', function() {
            $('#art-piece').css('margin-left', '-' + ($('#art-piece img').width() / 2) + 'px');
        });
        $('#art-piece img').attr('src', art[curPiece].img);

        // Put three random titles in the boxes
        var randomTitles = getArrayOfRandoms(0, art.length-1, 3, [curPiece]);
        for(var i=0; i<randomTitles.length; i++) {
            $('.title-option:eq(' + i + ')').html(art[randomTitles[i]].title);
        }

        // Put the correct title in a random box
        $('.title-option:eq(' + getRandomInt(0,2) + ')').html(art[curPiece].title);

        var that = this;
        $('.title-option').css('background-color', 'white');
        $('.title-option').click(function(e){
            var titleClicked = $(e.target).html();
            if(titleClicked != art[curPiece].title) {
                $(e.target).css('background-color', 'red');
                points -= 10
            } else {
                $(e.target).css('background-color', 'green');
                that.totalPoints += points;
                setTimeout($.proxy(that.playLocation, that), 250);
            }
        });
    };
    
    this.playLocation = function() {
        var curPiece = this.piecesToPlay[this.curTurn];
        
        $('#instructions').html('Pick the location!');
        $('#art-piece').removeClass('center');
        $('#art-piece').addClass('corner');
        $('#art-piece').css('margin-left', '0px');
        $('#title').html(art[curPiece].title + '<br/><i>' + art[curPiece].artist + '</i>');
        var startTime = new Date();
        
        var nextTurn = $.proxy(this.nextTurn, this);
        var that = this;
        google.maps.event.clearListeners(map, 'click');
        google.maps.event.addListener(map, 'click', function(event) {
            var artLocation = new google.maps.LatLng(art[curPiece].lat, art[curPiece].lng);
            var artMarker = new google.maps.Marker({
                position: artLocation,
                map: map
            });
            var guessMarker = new google.maps.Marker({
                position: event.latLng,
                map: map
            });
            var line = new google.maps.Polyline({
                path: [guessMarker.getPosition(), artMarker.getPosition()],
                map: map
            });
            
            var timeInSeconds = Math.round((new Date() - startTime)/1000);
            var distanceInMeters = distBetween(guessMarker.getPosition(), artMarker.getPosition());
            
            var points = Math.floor(30 - (distanceInMeters/100) - timeInSeconds);
            $('#instructions').html(distanceInMeters + ' meters away<br/>in ' + timeInSeconds + ' seconds<br/>' + points + ' points');
            
            that.totalPoints += points;
            setTimeout(nextTurn, 5000);
        });
    };
    
    this.gameOver = function() {
        $('#art-piece').hide();
        $('#instructions').html('Final Score: ' + this.totalPoints);
    };
};

var curGame = null;

$.get('api/downtown', function(data) {
    curGame = new game(data);
    curGame.startGame();
    
    /*
    for(var i=0; i<data.length; i++) {
        new google.maps.Marker({
            position: new google.maps.LatLng(data[i].lat, data[i].lng),
            map: map
        });
    }*/
});