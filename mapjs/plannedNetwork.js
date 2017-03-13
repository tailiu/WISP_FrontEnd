var buttonID
var socket
var map
var lines = []
var markers = []
var sourceMarker = 'styles/images/source.png'
var sinkMarker = 'styles/images/sink.png'
var intermediateMarker = 'styles/images/intermediate.png'
var center = {lat: 38.924280, lng: -122.907255}
var outstandingRequests = 0
var currentAlgorithm

var cachingResults = {}

var serverAddr = window.data.serverAddr
var serverPort = window.data.serverPort

var socketURL = 'http://' + serverAddr + ':' + serverPort + '/socket.io/socket.io.js'
var socketScript = document.createElement('script')
socketScript.setAttribute('src', socketURL)
document.body.appendChild(socketScript)

function addClass(element, newClass) {
    if (element.classList == undefined) {
        for (var i in element) {
            var classList = element[i].classList
            if (classList != undefined) {
                classList.add(newClass)
            }
        }
    } else {
        var classList = element.classList
        classList.add(newClass)
    }   
}

function addLoader () {
    document.getElementById('loader').style.display = 'block'
}

function removeLoader () {
    document.getElementById('loader').style.display = 'none'
}

function addProcessingAnimation() {
    outstandingRequests++

    addClass(document.querySelector('body'), 'wait')
    addClass(document.getElementsByTagName('button'), 'wait')

    addLoader()
}

function getCachingResults(algorithm) {
    return cachingResults[algorithm]
}

function callAlgorithm() {
    var args = {}
    args.algorithm = buttonID

    if (buttonID != 'Input JSON Data Directly') {
        args.input = window.data.input

        addProcessingAnimation()

        var cachedResults = getCachingResults(args.algorithm)
        if(cachedResults == undefined) {
            socket.emit('callAlgorithm', args)
        } else {
            window.data.result = cachedResults
            renderResults()
            checkAndRemoveLoader()
        }
    } else {
        bootbox.prompt({
            title: 'Please input JSON data',
            inputType: 'textarea',
            callback: function (data) {
                if (data !== null && data != '') {
                    args.input = data
                    socket.emit('callAlgorithm', args)
                    addProcessingAnimation()
                }
            }
        })
    }
}

function drawBoundary() {
    var boundary = window.data.boundary

    var icon = {
        url: "styles/images/boundary.jpg",      // url
        scaledSize: new google.maps.Size(2, 2), // scaled size
        origin: new google.maps.Point(0, 0),    // origin
        anchor: new google.maps.Point(0, 0)     // anchor
    }

    for (var i in boundary) {
        new google.maps.Marker({
            position: boundary[i],
            title: 'boundary',
            map: map,
            icon: icon
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
    var markerLink

    for (var i in nodes) {
        switch (nodes[i].nodeProperty.type) {
            case 'source':
                markerLink = sourceMarker
                break

            case 'intermediate':
                markerLink = intermediateMarker
                break

            case 'sink':
                markerLink = sinkMarker
                break
        }
        marker = new google.maps.Marker({
            position: nodes[i].node,
            map: map,
            title: 'Network Node',
            clickable: true,
            icon: markerLink
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
            if (classList != undefined) {
                classList.remove(oldClass)
            }
        }
    } else {
        var classList = element.classList
        classList.remove(oldClass)
    }   
}

function setOrUpdateParameters() {
    var costs = document.getElementById('costs')
    costs.innerHTML = data.result.costs
}

function setCachingResults() {
    cachingResults[window.data.result.algorithm] = window.data.result
}

function renderResults() {
    removeNetwork()
    drawNetwork()
    setOrUpdateParameters()
    setCurrentAlgorithm()
}

function checkAndRemoveLoader() {
    outstandingRequests--
    if (outstandingRequests == 0) {
        removeLoader()
        removeClass(document.querySelector('body'), 'wait')
        removeClass(document.getElementsByTagName('button'), 'wait')
    }
}

function initSocket() {
    socket = io('http://' + serverAddr + ':' + serverPort)

    socket.on('getResults', function(output) {
        if (output.errMsg != undefined) {
            bootbox.alert(output.errMsg)
        } else {
            window.data.result = output
            
            if (output.algorithm != 'Input JSON Data Directly') {
                setCachingResults()
            }

            renderResults()
        }
        
        checkAndRemoveLoader()
    })
}

function setCurrentAlgorithm() {
    var algorithm = document.getElementById('currentAlgorithm')
    currentAlgorithm = data.result.algorithm
    algorithm.innerHTML = '<p>Showing result:</p><p><b>' + currentAlgorithm  + '</b></p>'
}

window.onload = function() {
    initMap()
    initSocket()
    setOrUpdateParameters()
    setCurrentAlgorithm()
    setCachingResults()
    removeLoader()
}
