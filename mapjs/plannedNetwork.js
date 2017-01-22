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
}