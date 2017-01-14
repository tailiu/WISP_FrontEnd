import React from 'react'
import ReactDOM from 'react-dom'
import {FancyContainer, Map} from './utils.jsx'

//Contains a map and its corresponding map legends
class MapContainer extends React.Component {
	render() {
		return (
			<div id='mapContainer'>
				<Map mapScriptSrc='mapjs/plannedNetwork.js'/>
			</div>
        )
	}
}

class NetworkParameters extends React.Component {
	render () {
		return (
			<div>
				<h2>Network Setup Parameters:</h2>
				<ul>
					<li>Bandwidth: {this.props.paras.bandwidth}</li>
					<li>Costs: {this.props.paras.costs}</li>
				</ul>
			</div>
		)
	}
}


class PlannedNetworkContainer extends React.Component {
	render() {
		return (
			<div>
				<FancyContainer styles='grey-container'>
					<MapContainer />
				</FancyContainer>
				<FancyContainer>
					<NetworkParameters paras={window.data}/>
				</FancyContainer>
			</div>
		)
	}
}


ReactDOM.render(
	<PlannedNetworkContainer />,
	document.getElementById('root')
)
