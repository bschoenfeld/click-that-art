var express = require('express');
var http = require("http");
var parseString = require('xml2js').parseString;

var norfolkArtUrl = {
    host: 'www.norfolkva.gov',
    port: 80,
    path: '/cultural_affairs/public_art_downtown.xml'
};

var checkExists = function(path) {
    http.get({host:'www.norfolkva.gov', port:80, path:path}, function(r) {
        if(r.statusCode !== 200) {
            console.log(path + ' ' + r.statusCode);
        }
    });
};

var getNorfolkArtData = function(dataHandler) {
    var xmlData = '';
    
    var dataToJson = function() {
        parseString(xmlData, function (err, jsonData) {
            jsonData = jsonData['parks']['parkz'];
            art = jsonData;
            for(var i=0; i<art.length; i++) {
                art[i] = art[i]['$']
                var piece = art[i];
                piece['link'] = piece['link'].substring(8, piece['link'].length-1);
                piece['img'] = piece['img'].split(" ")[1];
                piece['img'] = piece['img'].substring(5, piece['img'].length-1);
                piece['img_small'] = piece['img'];
                
                if(piece['img'].indexOf('_Map') !== -1) {
                    piece['img'] = piece['img'].replace('_Map', '_LightBox');
                } else if(piece['img'].indexOf('_map') !== -1) {
                    piece['img'] = piece['img'].replace('_map', '_LightBox');
                } else if(piece['img'].indexOf('_ma') !== -1) {
                    piece['img'] = piece['img'].replace('_ma', '_Li');
                } else if(piece['img'].indexOf('map_') !== -1 || piece['img'].indexOf('Map_') !== -1) {
                    piece['img'] = piece['img'].replace('map_', 'LightBox_');
                    piece['img'] = piece['img'].replace('Map_', 'LightBox_');
                    piece['img'] = piece['img'].substring(0, piece['img'].lastIndexOf('.') - 5) + piece['img'].substring(piece['img'].lastIndexOf('.'), piece['img'].length);
                } else {
                    console.log(piece['img']);
                }
                
                piece['img'] = piece['img'].replace('Confederate_Soldier_LightBox', 'Confederate_Soldier_LightBo');
                piece['img'] = piece['img'].replace('GMB_LightBox', 'GMB_LBox');
                piece['img'] = piece['img'].replace('BITBYBIT_LightBox', 'BITBYBIT_OVSenior_LBox');
                piece['img'] = piece['img'].replace('EYES_LightBox', 'EYES_MacArthurNorth_LBox');
                piece['img'] = piece['img'].replace('Armed_Forces_Memorial_LightBox', 'Armed_Forces_Memorial_Light');
                piece['img'] = piece['img'].replace('Norfolk_1682_Plaque_LightBox', 'Norfolk_1682_War_LightBox');
                piece['img'] = piece['img'].replace('Waterwork_web_LightBox', 'Waterwork_LightBox');
                piece['img'] = piece['img'].replace('Flight_of_the_Seagulls_LightBox', 'Flight_of_the_Seagulls_Ligh');
                piece['img'] = piece['img'].replace('Good_Fortune_Garage_LightBox', 'Good_Fortune_Garage_LB');
                piece['img'] = piece['img'].replace('LightBox_pretlow_sun', 'pretlow_sunburst_LBox');
                piece['img'] = piece['img'].replace('LightBox_book_migr', 'book_migration_LBox');
                piece['img'] = piece['img'].replace('coleman_elementary_gate_LightBox', 'coleman_elementary_gate_LB');
                piece['img'] = piece['img'].replace('coleman_elem_wallmural_LightBox', 'coleman_elem_wallmural_LB');
                
                //var path = piece['img'].substring(24, piece['img'].length);
                //checkExists(path);
            }
            dataHandler(jsonData);
        });
    };
    
    http.get(norfolkArtUrl, function(response) {    
        response.on('data', function(chunk){xmlData += chunk});
        response.on('end', dataToJson);
    }).on('error', function(e) {
        dataHandler(null);
    });
};

var app = express();

app.use(express.static(__dirname + '/public'));
app.use(express.logger());
app.get('/', function(req, res){
    res.sendfile('./public/norfolk_art_quiz.html');
});
app.get('/api/downtown', function(req, res){
    getNorfolkArtData(function(data) {
        res.json(data);
    });
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
    console.log("Listening on " + port);
});
