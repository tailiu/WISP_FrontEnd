const serverAddr = 'localhost'
const serverPort = 8000

var buttonID = 'A1'
var socket
var map
var lines = []
var markers = []

function addClass(element, newClass) {
    if (element.classList == undefined) {
        for (var i in element) {
            var classList = element[i].classList
            classList.add(newClass)
        }
    } else {
        var classList = element.classList
        classList.add(newClass)
    }   
}

function callAlgorithm() {
    var args = {}
    args.algorithm = buttonID
    args.input = window.data.input
    socket.emit('callAlgorithm', args)

    addClass(document.querySelector('body'), 'wait')
    addClass(document.getElementsByTagName('button'), 'wait')
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

function infoWindowContent(properties) {
    var content = '<ul>'

    for (var key in properties) {
        var entry = '<li>'
        entry += key + ': ' + properties[key]
        entry += '</li>'
        content += entry
    }

    content += '</ul>'

    return content
}
 
function drawNetwork() {
    var nodes = window.data.result.nodes
    var edges = window.data.result.edges
    var marker
    var line

    for (var i in nodes) {
        marker = new google.maps.Marker({
            position: nodes[i].node,
            map: map,
            title: 'Network Node',
            clickable: true
        })
        marker.infoWindow = new google.maps.InfoWindow({
            content: infoWindowContent(nodes[i].nodeProperty)
        })
        google.maps.event.addListener(marker, 'click', function() {
            this.infoWindow.open(map, this)
        })
        markers.push(marker)
    }

    for (var i in edges) {
        line = new google.maps.Polyline({
            path: edges[i].nodes,
            geodesic: true,
            strokeColor: '#000000',
            strokeOpacity: 1.0,
            strokeWeight: 5,
            clickable: true
        })
        line.infoWindow = new google.maps.InfoWindow({
            content: infoWindowContent(edges[i].edgeProperty)
        })
        google.maps.event.addListener(line, 'click', function(event) {
            this.infoWindow.open(map)
            this.infoWindow.setPosition(event.latLng)
        })
        line.setMap(map)
        lines.push(line)
    }
}

function initMap() {
    var center = window.data.result.nodes[0].node

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: center
    })

    drawNetwork()
    drawBoundary()
}

function removeNetwork() {
    for (var j in lines) {
        lines[j].setMap(null)
    }
    lines = []

    for (var i in markers) {
        markers[i].setMap(null)
    }
    markers = []
}

function removeClass(element, oldClass) {
    if (element.classList == undefined) {
        for (var i in element) {
            var classList = element[i].classList
            classList.remove(oldClass)
        }
    } else {
        var classList = element.classList
        classList.remove(oldClass)
    }   
}

function initSocket(){
    socket = io('http://' + serverAddr + ':' + serverPort)

    socket.on('getResults', function(output) {
        window.data.result = output
        removeNetwork()
        drawNetwork()

        removeClass(document.querySelector('body'), 'wait')
        removeClass(document.getElementsByTagName('button'), 'wait')
    })
}

window.onload = function() {
    initMap()
    initSocket()
}
