import React from 'react'
import ReactDOM from 'react-dom'
import {FancyContainer, Map, ContainerTitle, MyButton} from './utils.jsx'

//Contain a network parameter table
class NetworkParameters extends React.Component {
	render () {
		return (
			<div>
				<div className='table-responsive'>
					<table className='table'>
						<tbody>
							<tr className='text-center'>
								<td>Costs</td>
								<td id='costs'></td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		)
	}
}

class State extends React.Component {
	render () {
		return (
			<div>
				<div className='text-center' id='currentAlgorithm' />
				<NetworkParameters /><br/>
				<div className='center-block' id='loader' />
			</div>
		)
	}
}

class Algorithms extends React.Component {
	render () {
		var dummyNetwork = {}
		dummyNetwork.name = 'Dummy Network'
		dummyNetwork.invokeEvent = true

		var minCostFlow = {}
		minCostFlow.name = 'Min Cost Flow'
		minCostFlow.invokeEvent = true

		var minCostFlowPlus = {}
		minCostFlowPlus.name = 'Min Cost Flow ++'
		minCostFlowPlus.invokeEvent = true

		var CPLEX = {}
		CPLEX.name = 'CPLEX Network Optimizer'
		CPLEX.invokeEvent = true

		var inputDataDirectly = {}
		inputDataDirectly.name = 'Input JSON Data Directly'
		inputDataDirectly.invokeEvent = true


		return (
			<div>
				<h4 className='text-center'><b>Algorithms</b></h4><br/>
				<MyButton button={minCostFlow} /><br/>
				<MyButton button={minCostFlowPlus} /><br/>
				<MyButton button={CPLEX} /><br/><br/>
				<State />
				<br/><br/><br/><br/>
				<h4 className='text-center'><b>Debugging</b></h4><br/>
				<MyButton button={inputDataDirectly} />
			</div>
		)
	}
}

class MapLegends extends React.Component {
	render() {
		return (
			<div>
            	<h4><b>Legends</b></h4>
            	<ul className = 'list-group'>
            		<li className = 'list-group-item grey-container withoutBorder'>Source: <br/>
            			<img src='styles/images/source.png' className='img-responsive' />
            		</li>
            		<li className = 'list-group-item grey-container withoutBorder'>Intermediate: <br/>
            			<img src='styles/images/intermediate.png' className='img-responsive' />
            		</li>
            		<li className = 'list-group-item grey-container withoutBorder'>Sink: <br/>
            			<img src='styles/images/sink.png' className='img-responsive' />
            		</li>
            	</ul>
            </div>
		)
	}
}

class PlannedNetworkContainer extends React.Component {
	render() {
		return (
			<div>
				<FancyContainer styles='grey-container bigMapContainer'>
					<ContainerTitle title='Planned Networks on the Map'/>
					<div className='row'>
						<div className='col-sm-1'>
							<Algorithms />
						</div>
						<div className='col-sm-10 smallMapContainer'>
							<Map mapScriptSrc='mapjs/plannedNetwork.js'/>
						</div>
						<div className='col-sm-1'>
			            	<MapLegends />
			            </div>
		            </div>
				</FancyContainer>
			</div>
		)
	}
}


ReactDOM.render(
	<PlannedNetworkContainer />,
	document.getElementById('root')
)
