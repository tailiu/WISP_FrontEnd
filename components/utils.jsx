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
        var googleMapAPI = document.createElement('script')
        googleMapAPI.setAttribute('type', 'text/javascript')
        googleMapAPI.setAttribute('src', 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDK76FwuJJgha95vSjgK8lUG_oNegAZVC0')
		document.body.appendChild(googleMapAPI)

		var mapScript = document.createElement('script')
        mapScript.setAttribute('type', 'text/javascript')
        mapScript.setAttribute('src', this.props.mapScriptSrc)
        var map = document.getElementById('map')
		map.appendChild(mapScript)
	}

	render() {
		return (
            <div id='map'></div>
		)
	}
}

export class ContainerTitle extends React.Component {
	render() {
		return (
			<div className='text-center stepTitle'>
				<h2>{this.props.title}</h2>
			</div>
		) 
		
	}
}

export class MyButton extends React.Component {
	constructor(props) {
		super(props)

		this.handleBtnClick = this.handleBtnClick.bind(this)
	}

	handleBtnClick(e) {
		window.buttonID = this.props.button.id
		
		if (this.props.button.invokeEvent) {
			window.callAlgorithm()
		}
	}

	render() {
		return (
			<button type="button" onClick={this.handleBtnClick} className="btn btn-success btn-block ">{this.props.button.name}</button>
		)
	}
}