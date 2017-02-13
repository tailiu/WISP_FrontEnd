var labelIndex = 1
var buttonID = undefined
var nodes = []
var center = {lat: 38.924280, lng: -122.907255}
var sourceImageURL = 'styles/images/provider.png'
var sinkImageURL = 'styles/images/newUser.png'

var serverURL = 'http://' + window.data.serverAddr + ':' +  window.data.serverPort + '/submitNetworkRawData'

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
    return buttonID.toLowerCase()
}

function validateCapacityInput(capacity) {
    if (capacity === null) {
        return false
    }

    var isnum = /^[0-9]+$/.test(capacity)
    if (!isnum) {
        alert('Error! Please input a positive integer number')
        return false
    }

    var parsedCapacity = parseInt(capacity)
    if (parsedCapacity == 0) {
        alert('Error! Please input a positive integer number')
        return false
    }

    return true
}

function modifyCapacity(position, infoWindow) {
    var capacity = prompt("Please input a new capacity value of this node:")

    if(validateCapacityInput(capacity)) {
        var lat = position.lat()
        var lng = position.lng()
        
        for (var i in nodes) {
            if (nodes[i].node.lat() == lat && nodes[i].node.lng() == lng) {
                nodes[i].nodeProperty.capacity = parseInt(capacity)
                infoWindow.setContent(infoWindowContent(capacity))
                return
            }
        }
    }
}

function infoWindowContent(capacity) {
    var content = '<ul> capacity: ' + capacity + '</ul>'
    return content
}

function determineIconURL() {
    var type = buttonID.toLowerCase()
    if (type == 'source') {
        return sourceImageURL
    } else {
        return sinkImageURL
    }
}

// Add a marker to the map.
function addMarker(location, map) {
    var capacity = prompt("Please input a positive integer capacity value of this node:")

    if (validateCapacityInput(capacity)) {
        var iconURL = determineIconURL()

         // Add the marker at the clicked location
        var marker = new google.maps.Marker({
            position: location,
            label: '' + labelIndex++,
            map: map,
            icon: iconURL,
            clickable: true
        })
        marker.infoWindow = new google.maps.InfoWindow({
            content: infoWindowContent(capacity, location)
        })
        google.maps.event.addListener(marker, 'click', function() {
            modifyCapacity(this.position, this.infoWindow)
        })
        google.maps.event.addListener(marker, 'mouseover', function() {
            this.infoWindow.open(map, this)
        })
        google.maps.event.addListener(marker, 'mouseout', function() {
            this.infoWindow.close(map, this)
        })

        addCoordinate(location, parseInt(capacity))
    }
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

function validateMapInput() {
    var sourceNum = 0
    var sinkNum = 0
    var sourceCapacitySum = 0
    var sinkCapacitySum = 0

    for (var i in nodes) {
        var node = nodes[i]
        if (node.nodeProperty.type == 'source') {
            sourceCapacitySum += node.nodeProperty.capacity
            sourceNum++
        } else {
            sinkCapacitySum += node.nodeProperty.capacity
            sinkNum++
        }
    }

    if (sinkNum == 0 || sourceNum == 0) {
        alert('Please specify at least one source node and one sink node')
        return false
    }

    if (sourceCapacitySum < sinkCapacitySum) {
        alert('Please ensure total source capacity >= total sink capacity')
        return false
    }

    return true
}

function setRequirementsFormAction() {
    var form = document.getElementById('requirementsForm')
    form.action = serverURL
}

function validateMapInputAndSubmit(event) {
    if(!validateMapInput()) {
        event.preventDefault()
        return
    }
    setRequirementsFormAction()
}

window.onload = function() { 
    initMap()
}