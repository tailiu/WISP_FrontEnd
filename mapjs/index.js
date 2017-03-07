var buttonID = undefined
var startDragPosition
var nodes = []

var center = {lat: 38.924280, lng: -122.907255}

var sourceImageURL = 'styles/images/source.png'
var sinkImageURL = 'styles/images/sink.png'

var defaultCapacity = 100
var defaultMountingHeight = 1

var serverURL = 'http://' + window.data.serverAddr + ':' +  window.data.serverPort + '/submitNetworkRawData'

var popoverForm = `<form>
                        <div class='form-group'>
                            <label>Capacity (Mbit/s) <span class='glyphicon glyphicon-info-sign' aria-hidden='true' 
                                data-toggle='popover' data-placement='right' data-content='Capacity of the marker'></span></label>
                            <input type='text' class='form-control' name='capacity' aria-describedby='capacityHelpBlock' />
                            <span id='capacityHelpBlock' class='help-block'></span>
                        </div>
                        <div class='form-group'>
                            <label>Mounting Height (m) <span class='glyphicon glyphicon-info-sign' aria-hidden='true' 
                                data-toggle='popover' data-placement='right' data-content='Mounting height of the marker'></span></label>
                            <input type='text' class='form-control' name='mountingHeight' aria-describedby='mountingHeightHelpBlock' />
                            <span id='mountingHeightHelpBlock' class='help-block'></span>
                        </div>
                        <div class='checkbox'>
                            <b>Frequency (GHz) </b><span class='glyphicon glyphicon-info-sign' aria-hidden='true' 
                                data-toggle='popover' data-placement='right' data-content='Frequency of the marker'></span><br />
                            <label class='checkbox-inline'>
                                <input type='checkbox' class='frequency' value='2.4' /> 2.4
                            </label>
                            <label class='checkbox-inline'>
                                <input type='checkbox' class='frequency' value='3' /> 3
                            </label>
                            <label class='checkbox-inline'>
                                <input type='checkbox' class='frequency' value='5' /> 5
                            </label>
                            <label class='checkbox-inline'>
                                <input type='checkbox' class='frequency' value='24' /> 24
                            </label>
                            <span id='frequencyHelpBlock' class='help-block'></span>
                        </div>
                    </form>`

function initMap() {
    var boundary = window.data.boundary

    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: center
    })

    // This event listener calls addOrModifyMarker() when the map is clicked.
    google.maps.event.addListener(map, 'click', function(event) {
        if (chooseMarkerOrNot()) {
            addOrModifyMarker(map, event.latLng, 'create');
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
        bootbox.alert('Please choose a marker first')
        return false
    }
    return true
}

// Determine which marker is being used
function determineMarkerType() {
    return buttonID.toLowerCase()
}

function setInfoWindowContent(capacity, mountingHeight, frequencies) {
    var content = ''
    content += '<ul> Capacity: ' + capacity + ' Mbit/s </ul>'
    content += '<ul> Mounting Height: ' + mountingHeight + ' m </ul>'

    if (frequencies.length == 1) {
        content += '<ul> Frequency: '
    } else {
        content += '<ul> Frequencies: '
    }
    var index
    for (index = 0; index < frequencies.length - 1; index++) {
        content += frequencies[index] + ' GHz, '
    }
    content += frequencies[index] + ' GHz</ul>'

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

function setHelpBlock(blockID, text) {
    document.getElementById(blockID).innerHTML = text

}

function handleMarkerDragged(position) {
    var index = determineMarker(startDragPosition)
    nodes[index].node = position
}

function validateCapacityInput(capacity) {
    var nonnegativeInt = /^[0-9]+$/.test(capacity) 

    if ((capacity === null) || !nonnegativeInt ) {
        setHelpBlock('capacityHelpBlock', 'Please input an <b>non-negative integer</b>')
        return false
    } else {
        setHelpBlock('capacityHelpBlock', '')
        return true
    }
}

function validateMountingHeightInput(mountingHeight) {
    var nonnegativeInt = /^[0-9]+$/.test(mountingHeight)

    if ((mountingHeight === null) || !nonnegativeInt) {
        setHelpBlock('mountingHeightHelpBlock', 'Please input an <b>non-negative integer</b>')
        return false
    } else {
        setHelpBlock('mountingHeightHelpBlock', '')
        return true
    }
}

function validateFrequencyInput(frequency) {
    if (frequency.length == 0) {
        setHelpBlock('frequencyHelpBlock', 'Please select at least <b>one</b> frequency')
        return false
    } else {
        setHelpBlock('frequencyHelpBlock', '')
        return true
    }
}

function validateInput(capacity, mountingHeight, frequency) {
    var capacityInputResult = validateCapacityInput(capacity) 
    var mountingHeightInputResult = validateMountingHeightInput(mountingHeight) 
    var frequencyInputResult = validateFrequencyInput(frequency)

    return (capacityInputResult && mountingHeightInputResult && frequencyInputResult)    
}

function modifyCoordinate(markerInfo, capacity, mountingHeight, frequencies) {
    var index = determineMarker(markerInfo.node)

    nodes[index].nodeProperty.capacity = capacity
    nodes[index].nodeProperty.mountingHeight = mountingHeight
    nodes[index].nodeProperty.frequencies = frequencies
}

function handleAddOrModifyMarker(map, markerInfo, option) {
    var capacity = document.getElementsByName('capacity')[0].value
    var mountingHeight = document.getElementsByName('mountingHeight')[0].value
    var frequencies = document.querySelectorAll('.frequency:checked')

    if(!validateInput(capacity, mountingHeight, frequencies)) {
        return false
    }

    frequencies = addToFrequencyArr(frequencies)
    capacity = parseInt(capacity)
    mountingHeight = parseInt(mountingHeight)

    if (option == 'create') {
        var iconURL = determineIconURL()

        // Add the marker at the clicked location
        var marker = new google.maps.Marker({
            position: markerInfo,
            map: map,
            icon: iconURL,
            clickable: true,
            draggable:true
        })
        marker.infoWindow = new google.maps.InfoWindow({
            content: setInfoWindowContent(capacity, mountingHeight, frequencies)
        })
        google.maps.event.addListener(marker, 'click', function() {
            modifyMarkerParameters(map, this.position, this.infoWindow)
        })
        google.maps.event.addListener(marker, 'mouseover', function() {
            var index = determineMarker(this.position)
            var markerParameters = nodes[index].nodeProperty
            this.infoWindow.setContent(setInfoWindowContent(markerParameters.capacity, markerParameters.mountingHeight, markerParameters.frequencies))
            this.infoWindow.open(map, this)
        })
        google.maps.event.addListener(marker, 'mouseout', function() {
            this.infoWindow.close(map, this)
        })
        google.maps.event.addListener(marker,"dragstart",function() {
            startDragPosition = this.position
        })
        google.maps.event.addListener(marker, 'dragend', function() {
            handleMarkerDragged(this.position)
        })

        addCoordinate(markerInfo, capacity, mountingHeight, frequencies)
    } else {
        modifyCoordinate(markerInfo, capacity, mountingHeight, frequencies)
    }
}

function renderMarkerParameters(markerInfo) {
    document.getElementsByName('capacity')[0].value = markerInfo.nodeProperty.capacity
    document.getElementsByName('mountingHeight')[0].value = markerInfo.nodeProperty.mountingHeight

    var frequencies = markerInfo.nodeProperty.frequencies
    var checkboxes = document.getElementsByClassName('frequency')

    for (var i in frequencies) {
        for (var j = 0; j < checkboxes.length; j++) {
            if (checkboxes[j].value == frequencies[i]) {
                checkboxes[j].checked = true
            }
        }   
    }
}

// Add a marker to the map.
function addOrModifyMarker(map, markerInfo, option) {
    var markerTitle
    var buttonLabelName

    if (option == 'create') {
        markerTitle = 'Please specify the parameters of this marker'
        buttonLabelName = 'Create'
    } else {
        markerTitle = 'Please modify the parameters of this marker'
        buttonLabelName = 'Modify'
    }

    var markerCreationOrModificationWindow = bootbox.dialog({
        title: markerTitle,

        message: popoverForm,
        
        buttons: [
            {
                label: buttonLabelName,
                className: 'btn btn-primary pull-left',
                callback: function() {
                    return handleAddOrModifyMarker(map, markerInfo, option)
                }
            },
            {
                label: 'Cancel',
                className: 'btn btn-default pull-left',
                callback: function() {}
            }
        ],

        show: false,

        onEscape: function() {
            markerCreationOrModificationWindow.modal("hide")
        }
    })

    markerCreationOrModificationWindow.modal("show");

    $('[data-toggle="popover"]').popover()

    if (option == 'create') {
        addDefaultParameters()
    } else {
        renderMarkerParameters(markerInfo)
    }
    
}

function addDefaultParameters() {
    $('.frequency').prop('checked', true)
    document.getElementsByName('capacity')[0].value = defaultCapacity
    document.getElementsByName('mountingHeight')[0].value = defaultMountingHeight
}

function determineMarker(position) {
    var lat = position.lat()
    var lng = position.lng()
    
    for (var i in nodes) {
        if (nodes[i].node.lat() == lat && nodes[i].node.lng() == lng) {
            return i
        }
    }
}

function modifyMarkerParameters(map, position, infoWindow) {
    var index = determineMarker(position)
    addOrModifyMarker(map, nodes[index], 'modify')
}

function addToFrequencyArr(frequency) {
    var frequencies = []
    for (var i = 0; i < frequency.length; i++) {
        var intValue = parseFloat(frequency[i].value)
        frequencies.push(intValue)
    }
    return frequencies
}

// Store the coordinate of the marker
function addCoordinate(location, capacity, mountingHeight, frequencies) {
    var marker = {}
    marker.node = location
    marker.nodeProperty = {}
    marker.nodeProperty.type = determineMarkerType()
    marker.nodeProperty.capacity = capacity
    marker.nodeProperty.mountingHeight = mountingHeight
    marker.nodeProperty.frequencies = frequencies

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
        bootbox.alert('Please specify at least <b>one source node and one sink node</b>')
        return false
    }

    if (sourceCapacitySum != sinkCapacitySum) {
        bootbox.alert('Please ensure total source capacity <b>=</b> total sink capacity')
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
