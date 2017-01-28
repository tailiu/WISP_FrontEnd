const serverAddr = 'localhost'
const serverPort = 8000

var buttonID = 'A1'
var socket
var map
var providerlinks
var newUserlinks
var providerMarkers = []
var newUserMarkers = []
var oldMarkerPosition

function callAlgorithm() {
    var args = {}
    args.algorithm = buttonID
    args.pixels = window.data.pixels

    socket.emit('callAlgorithm', args)
}

function recalculateNetworkPlan(newMarkerPosition) {
    var oldLat = oldMarkerPosition.lat().toFixed(6)
    var oldLng = oldMarkerPosition.lng().toFixed(6)
    var newLat = newMarkerPosition.lat()
    var newLng = newMarkerPosition.lng()
    var newPosition = {}
    newPosition.lat = newLat
    newPosition.lng = newLng

    var coordinates = window.data.coordinates
    var providerArr = coordinates[0]
    var newUserArr = coordinates[1]

    var args = {}
    args.algorithm = buttonID
    args.coordinates = {}
    args.coordinates.provider = []
    args.coordinates.newUser = []

    for (var i in providerArr) {
        if (providerArr[i].lat == oldLat && providerArr[i].lng == oldLng) {
            args.coordinates.provider.push(newPosition)
        } else {
            args.coordinates.provider.push(providerArr[i])
        }
    }

    for (var j in newUserArr) {
        if (newUserArr[j].lat == oldLat && newUserArr[j].lng == oldLng) {
            args.coordinates.newUser.push(newPosition)
        } else {
            args.coordinates.newUser.push(newUserArr[j])
        }
    }

    socket.emit('recalculateNetworkPlan', args)
}

function drawBoundary() {
    var boundary = window.data.boundary

    for (var i in boundary) {
        new google.maps.Marker({
            position: boundary[i],
            title: 'boundary',
            map: map,
            icon: 'styles/images/boundary.jpg'
        })
    }
}

function drawNetwork() {
    var coordinates = window.data.coordinates
    var providerArr = coordinates[0]
    var newUserArr = coordinates[1]

    providerlinks = new google.maps.Polyline({
        path: providerArr,
        geodesic: true,
        strokeColor: '#FF0000', //red
        strokeOpacity: 1.0,
        strokeWeight: 2
    })  

    providerlinks.setMap(map)

    for (var i in providerArr) {
        var providerMarker = new google.maps.Marker({
            position: providerArr[i],
            title: 'Provider Markers',
            map: map,
            icon: 'styles/images/provider.jpg',
            draggable: true
        })

        providerMarker.addListener('dragstart', function() {
            oldMarkerPosition = this.getPosition()
        })

        providerMarker.addListener('dragend', function() {
            var newMarkerPosition = this.getPosition()

            recalculateNetworkPlan(newMarkerPosition)
        })

        providerMarkers.push(providerMarker)
    }


    newUserlinks = new google.maps.Polyline({
        path: newUserArr,
        geodesic: true,
        strokeColor: '#000000', //black
        strokeOpacity: 1.0,
        strokeWeight: 3
    })  

    newUserlinks.setMap(map)
    
    for (var i in newUserArr) {
        var newUserMarker = new google.maps.Marker({
            position: newUserArr[i],
            title: 'New User Markers',
            map: map,
            icon: 'styles/images/newUser.jpg',
            draggable: true
        })

        newUserMarker.addListener('dragstart', function() {
            oldMarkerPosition = this.getPosition()
        })

        newUserMarker.addListener('dragend', function() {
            var newMarkerPosition = this.getPosition()

            recalculateNetworkPlan(newMarkerPosition)
        })

        newUserMarkers.push(newUserMarker)
    }
}

function removeNetwork() {
    providerlinks.setMap(null)

    newUserlinks.setMap(null)

    for (var i = 0; i < providerMarkers.length; i++) {
        providerMarkers[i].setMap(null);
    }
    providerMarkers = []

    for (var i = 0; i < newUserMarkers.length; i++) {
        newUserMarkers[i].setMap(null);
    }
    newUserMarkers = []
}

function initMap() {
    var center = window.data.coordinates[0][0]

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: center
    })

    drawNetwork()
    drawBoundary()
}

function initSocket(){
    socket = io('http://' + serverAddr + ':' + serverPort)

    socket.on('getResults', function(results) {
        window.data.coordinates = results
        removeNetwork()
        drawNetwork()
    })

    socket.on('newNetworkPlan', function(results) {
        window.data.coordinates = results.coordinates
        window.data.pixels = results.pixels
        removeNetwork()
        drawNetwork()
    })
}

window.onload = function() {
    initMap()

    initSocket()
}
