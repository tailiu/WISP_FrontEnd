import React from 'react'
import ReactDOM from 'react-dom'
import {FancyContainer, Map, ContainerTitle, MyButton} from './utils.jsx'

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

class Algorithms extends React.Component {
	render () {
		var a1 = {}
		a1.name = 'A1'
		a1.id = 'A1'
		a1.invokeEvent = true

		var a2 = {}
		a2.name = 'A2'
		a2.id = 'A2'
		a2.invokeEvent = true

		return (
			<div>
				<h4 className='text-center'>Algorithms</h4><br/>
				<MyButton button={a1} /><br/>
				<MyButton button={a2} />
			</div>
		)
	}
}

class MapLegends extends React.Component {
	render() {
		return (
			<div>
            	<h4>Legends</h4>
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
				<FancyContainer>
					<NetworkParameters paras={window.data.result}/>
				</FancyContainer>
			</div>
		)
	}
}


ReactDOM.render(
	<PlannedNetworkContainer />,
	document.getElementById('root')
)
