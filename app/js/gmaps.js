// Note: This example requires that you consent to location sharing when
// prompted by your browser. If you see the error "The Geolocation service
// failed.", it means you probably did not give permission for the browser to
// locate you.
var map;
var locals = [];
function initMap() {
    var defaultCenter = {lat: -19.8719184, lng: -43.9893992};
    map = new google.maps.Map(document.getElementById('map'), {
        center: defaultCenter,
        zoom: 14
    });

  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var defaultCenter = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      map.setCenter(defaultCenter);
    }, function() {
      
    });
  } else {    
  }
  loadData(defaultCenter);  
}
var celulas = [];

function placeMarker(options){
    var latLng = options._id.local.coordinates[1] + ',' + options._id.local.coordinates[0];
    var iconUrl = 'img/markers/' + options.quantidade + '.png';
    
	var image = { url: iconUrl /*, size: new google.maps.Size(30, 30) */} ;
    var url = "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + latLng + "&sensor=true";
	$.get(url, function(result){
		marker = new google.maps.Marker({
		map: map,
		animation: google.maps.Animation.DROP,
		position: result.results[0].geometry.location,
		icon: image
	  });	
	});
}

function placeMarkerRecursive(idx) {
    if(idx < celulas.length){
        var options = celulas[idx];
        var latLng = options._id.local.coordinates[1] + ',' + options._id.local.coordinates[0];
        var iconUrl = 'img/markers/' + options.quantidade + '.png';
        
        var image = { url: iconUrl /*, size: new google.maps.Size(30, 30) */} ;
        var url = "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + latLng + "&sensor=true";
        $.get(url, function(result){
            marker = new google.maps.Marker({
                map: map,
                animation: google.maps.Animation.DROP,
                position: result.results[0].geometry.location,
                icon: image
            });	
            marker.addListener('click', function() {
                openInfo(celulas[idx]);
            });
            placeMarkerRecursive(idx+1);
        });
    }
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
                        'Error: The Geolocation service failed.' :
                        'Error: Your browser doesn\'t support geolocation.');
}

function loadData(center){
    $('.chkSemana').prop('checked', true);
    $('.chkRede').prop('checked', true);    
    var urlApi = "https://ibelim-site-api.herokuapp.com/cell/geo/" + center.lng + "/" + center.lat + "/10000";
    $.getJSON(urlApi, (data) => {
        celulas = data;
        placeMarkerRecursive(0);
    });
}
var riv;
function openInfo(obj){
    var diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    obj.celulas.forEach((item) => {
        item.divMoreInfo = "divMore" + item._id;
        item.spanMoreInfo = "spanMore" + item._id;
        item.nomeDiaSemana = diasSemana[item.diaSemana];
        item.collapse = () => {
            if($("#divMore" + item._id).hasClass('in')){
                $("#divMore" + item._id).collapse('hide');   
                $("#spanMore" + item._id)[0].innerText = "+"
            }
            else {
                $("#divMore" + item._id).collapse('show');
                $("#spanMore" + item._id)[0].innerText = "-"
            }
        }
    });

    if(riv) {
        riv.update({celula: obj});
    }
    else {
        riv = rivets.bind($('#celula'), {celula: obj})
    }
    $('#modalInfoCelula').modal();
}
