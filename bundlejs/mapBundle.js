(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function initMap() {
    var boundary = JSON.parse(window.data.boundary)
    var coordinates = window.data.coordinates
    var providerArr = JSON.parse(coordinates).provider
    var newUserArr = JSON.parse(coordinates).newUser

    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: providerArr[0]
    })

    var providerlinks = new google.maps.Polyline({
        path: providerArr,
        geodesic: true,
        strokeColor: '#FF0000', //red
        strokeOpacity: 1.0,
        strokeWeight: 2
    })  

    providerlinks.setMap(map)

    var newUserlinks = new google.maps.Polyline({
        path: newUserArr,
        geodesic: true,
        strokeColor: '#000000', //black
        strokeOpacity: 1.0,
        strokeWeight: 3
    })  

    newUserlinks.setMap(map)

    for (var i in boundary) {
        var marker = new google.maps.Marker({
            position: boundary[i],
            title: 'boundary',
            map: map,
            icon: 'styles/images/boundary.jpg'
        })
    }

    var socket = io('http://localhost:8000');
  socket.on('news', function (data) {
    console.log(data);
    socket.emit('my other event', { my: 'data' });
  });

}


window.onload = function() {
    initMap()
}

},{}]},{},[1]);
