var labelIndex = 1;
var markerIconLink;
var coordinates = {
                provider: [],
                newUser: []
            }

function initMap() {
    var bangalore = { lat: 12.97, lng: 77.59 };
    
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: bangalore
    });

    // Set up marker icon, and change icon image once the option is changed
    var marker = document.getElementById('marker');
    markerIconLink = marker.options[marker.selectedIndex].value
    google.maps.event.addDomListener(marker, 'change', function() {
        markerIconLink = marker.options[marker.selectedIndex].value
    });

    // This event listener calls addMarker() when the map is clicked.
    google.maps.event.addListener(map, 'click', function(event) {
        addMarker(event.latLng, map);
    });
}

// Determine which marker is being used
function determineMarker() {
    var parts = markerIconLink.split('/')
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
        icon: markerIconLink
    });

    addCoordinate(location)
}