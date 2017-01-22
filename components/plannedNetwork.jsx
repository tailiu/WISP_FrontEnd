import React from 'react'
import ReactDOM from 'react-dom'
import {FancyContainer, Map, ContainerTitle} from './utils.jsx'

//Contain a map and its corresponding map legends
class MapContainer extends React.Component {
	render() {
		return (
			<div>
				<ContainerTitle title='The Planned Networks on the Map'/>
				<div className='smallMapContainer'>
					<Map mapScriptSrc='mapjs/plannedNetwork.js'/>
				</div>
			</div>
        )
	}
}

//Contain a network parameter table
class NetworkParameters extends React.Component {
	render () {
		return (
			<div>
				<ContainerTitle title='Network Setup Parameters'/>
				<div className='row'>
					<table className="table-hover table-striped col-sm-offset-3 col-sm-6">
						<tbody>
							<tr>
	    						<td>Bandwith</td>
	    						<td>{this.props.paras.bandwidth}</td>
							</tr>
							<tr>
								<td>Costs</td>
								<td>{this.props.paras.costs}</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		)
	}
}


class PlannedNetworkContainer extends React.Component {
	render() {
		return (
			<div>
				<FancyContainer styles='grey-container bigMapContainer'>
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
