import React from 'react'

export class FancyContainer extends React.Component {
	render() {
		return (
			<div className={'container-fluid ' + this.props.styles}>
				{this.props.children}
			</div>
		)
	}
}

export class Map extends React.Component {
	// Load Google Map APIs and the map scripts from the server
	componentDidMount() {
		var mapScript = document.createElement('script')
        mapScript.setAttribute('type', 'text/javascript')
        mapScript.setAttribute('src', this.props.mapScriptSrc)

        var map = document.getElementById('map')
		map.appendChild(mapScript)

        var googleMapAPI = document.createElement('script')
        googleMapAPI.setAttribute('type', 'text/javascript')
        googleMapAPI.setAttribute('src', 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDK76FwuJJgha95vSjgK8lUG_oNegAZVC0&callback=initMap')

		document.body.appendChild(googleMapAPI)
	}

	render() {
		return (
            <div id='map'></div>
		)
	}
}