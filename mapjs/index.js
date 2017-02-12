var labelIndex = 1
var buttonID = undefined
var nodes = []
var center = {lat: 38.924280, lng: -122.907255}

var serverURL = 'http://' + window.data.serverAddr + ':' +  window.data.serverPort + '/submitNetworkRawData'

function setRequirementsFormAction() {
    var form = document.getElementById('requirementsForm')
    form.action = serverURL
}

function initMap() {
    var boundary = window.data.boundary

    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: center
    })

    // This event listener calls addMarker() when the map is clicked.
    google.maps.event.addListener(map, 'click', function(event) {
        if (chooseMarkerOrNot()) {
            addMarker(event.latLng, map);
        }
    })

    var icon = {
        url: "styles/images/boundary.jpg",      // url
        scaledSize: new google.maps.Size(2, 2), // scaled size
        origin: new google.maps.Point(0, 0),    // origin
        anchor: new google.maps.Point(0, 0)     // anchor
    }

    for (var i in boundary) {
        var marker = new google.maps.Marker({
            position: boundary[i],
            title: 'boundary',
            map: map,
            icon: icon
        })
    }
}

function chooseMarkerOrNot() {
    if (buttonID == undefined) {
        window.alert('Please choose a marker first')
        return false
    }
    return true
}

// Determine which marker is being used
function determineMarker() {
    var parts = buttonID.split('/')
    var iconFileName = parts[parts.length - 1]
    parts = iconFileName.split('.')
    var type

    switch (parts[0]) {
        case 'provider':
            type = 'source'
            break

        case 'newUser':
            type = 'sink'
            break
    }

    return type
}

// Store the coordinate of the marker
function addCoordinate(location, capacity) {
    var marker = {}
    marker.node = location
    marker.nodeProperty = {}
    marker.nodeProperty.type = determineMarker()
    marker.nodeProperty.capacity = capacity

    nodes.push(marker)
}

// Add a marker to the map.
function addMarker(location, map) {
    // Add the marker at the clicked location
    var marker = new google.maps.Marker({
        position: location,
        label: '' + labelIndex++,
        map: map,
        icon: buttonID
    });

    var capacity = prompt("Please input the capacity of this node:");

    addCoordinate(location, capacity)
}

window.onload = function() {
    initMap()
    setRequirementsFormAction()
}