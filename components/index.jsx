import React from 'react'
import ReactDOM from 'react-dom'
import {FancyContainer, Map, ContainerTitle, MyButton} from './utils.jsx'

class PlanToolTitle extends React.Component {
	render() {
		return (
			<div className='jumbotron text-center'>
	            <h1>Network Planning Tool</h1><br />
	            <h3>Helping the Lone Operator in the Vast Frontier</h3> 
	        </div>
		)
	}
}

class MarkerList extends React.Component {
	render() {
		var serviceProvider = {}
		serviceProvider.name = 'Service Provider'
		serviceProvider.id = 'styles/images/provider.jpg'
		serviceProvider.invokeEvent = false

		var newUser = {}
		newUser.name = 'New User'
		newUser.id = 'styles/images/newUser.jpg'
		newUser.invokeEvent = false

		return (
			<div>
				<h3 className='text-center'>Markers</h3><br/>
				<MyButton button={serviceProvider} /><br/>
				<MyButton button={newUser} />
			</div>
		)
	}
}

class MapLegends extends React.Component {
	render() {
		return (
			<div>
            	<h3>Map Legends</h3><br/>
            	<ul>
            		<li>Service Provider: <br/>
            			<img src='styles/images/provider.jpg' className='img-responsive' />
            		</li>
            		<br/>
            		<li>New User: <br/>
            			<img src='styles/images/newUser.jpg' className='img-responsive' />
            		</li>
            	</ul>
            </div>
		)
	}
}

//Contains a map and its corresponding map legends
class MapContainer extends React.Component {
	render() {
		return (
			<FancyContainer styles='bigMapContainer'>
				<ContainerTitle title='Put Your Network Elements on the Map'/>
				<div className='row'>
					<div className='col-sm-2'>
						<MarkerList />
					</div>
					<div className='col-sm-8 smallMapContainer'>
						<Map mapScriptSrc='mapjs/index.js' needWebSocket={false} />
					</div>
					<div className='col-sm-2'>
		            	<MapLegends />
		            </div>
	            </div>
        	</FancyContainer>
        )
	}
}

//Contains a requirement form
class RequirementsContainer extends React.Component {
	constructor(props) {
		super(props)

		this.handleChange = this.handleChange.bind(this)
	}

	handleChange() {
		this.props.onUserInput(
			this.bandwidth.value,
			this.costs.value
		)
	}

	render() {
		return (
			<FancyContainer styles='grey-container'>
				<ContainerTitle title='Input Your Requirements'/>
				<form className='form-horizontal' method='POST' action='http://localhost:8000/submitNetworkRawData'>
					<div className='form-group'>
						<label className='col-sm-2 control-label'>Bandwidth</label>
						<div className='col-sm-9'>
		        			<input type='text' className='form-control' name='bandwidth' value={this.props.bandwidth}
		        						ref={(input) => this.bandwidth = input} onChange={this.handleChange} />
		        		</div>
		        	</div>
		        	<div className='form-group'>
		        		<label className='col-sm-2 control-label'>Costs</label>
		        		<div className='col-sm-9'>
		        			<input type='text' className='form-control' name='costs' value={this.props.costs}
		        					ref={(input) => this.costs = input} onChange={this.handleChange} />
		        		</div>
		        	</div>
        			<input type='hidden' name='coordinates' value={JSON.stringify(window.coordinates)} />
        			<div className='form-group'>
        				<div className='col-sm-offset-4 col-sm-4'>
        					<button className='btn btn-primary btn-block' type='submit'>GO!</button>
        				</div>
        			</div>
	      		</form>
        	</FancyContainer>
		)
	}
}

//Contains the entirety of the tool
class PlanningToolContainer extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			bandwidth:'',
			costs:''
		}

		this.handleUserInput = this.handleUserInput.bind(this)
	}

	handleUserInput(bandwidth, costs) {
		this.setState({
			bandwidth: bandwidth,
			costs: costs
		})
	}

	render() {
		return (
			<div>
				<PlanToolTitle />
				<MapContainer />
				<RequirementsContainer
					 bandwidth={this.state.bandwidth}
					 costs={this.state.costs}
					 onUserInput={this.handleUserInput} />
			</div>
		)
	}
}

ReactDOM.render(
	<PlanningToolContainer />,
	document.getElementById('root')
)
