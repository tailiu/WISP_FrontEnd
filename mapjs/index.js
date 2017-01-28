var labelIndex = 1;
var buttonID = undefined;
var coordinates = {
                provider: [],
                newUser: []
            }

function initMap() {
    
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: data[30]
    })

    // This event listener calls addMarker() when the map is clicked.
    google.maps.event.addListener(map, 'click', function(event) {
        if (chooseMarkerOrNot()) {
            addMarker(event.latLng, map);
        }
    })

    for (var i in data) {
        var marker = new google.maps.Marker({
            position: data[i],
            title: 'boundary',
            map: map,
            icon: 'styles/images/boundary.jpg'
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
    return parts[0]
}

// Store the coordinate of the marker
function addCoordinate(location) {
    var marker = determineMarker()
    coordinates[marker + ''].push(location)
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

    addCoordinate(location)
}

window.onload = function() {
    initMap()
}