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
		var a1 = {}
		a1.name = 'Dummy Network'
		a1.invokeEvent = true

		var a2 = {}
		a2.name = 'Min Cost Flow (Google OR tools)'
		a2.invokeEvent = true

		var a3 = {}
		a3.name = 'CPLEX Network Optimizer'
		a3.invokeEvent = true

		var a4 = {}
		a4.name = 'Input JSON Data Directly'
		a4.invokeEvent = true


		return (
			<div>
				<h4 className='text-center'><b>Algorithms</b></h4><br/>
				<MyButton button={a1} /><br/>
				<MyButton button={a2} /><br/>
				<MyButton button={a3} /><br/>
				<MyButton button={a4} /><br/><br/>
				<State />
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
