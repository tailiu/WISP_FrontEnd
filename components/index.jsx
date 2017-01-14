import React from 'react'
import ReactDOM from 'react-dom'
import {FancyContainer, Map} from './utils.jsx'

class PlanStepTitle extends React.Component {
	render() {
		return <h2>{this.props.title}</h2>
	}
}

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

class Marker extends React.Component {
	render() {
		return (
    		<select id='marker'>
				<option value='styles/images/provider.jpg'>Service Provider</option>
				<option value='styles/images/newUser.jpg'>New User</option>
			</select>
		)
	}
}

class MapLegends extends React.Component {
	render() {
		return (
			<div>
            	<h3>Map Legends:</h3>
            	<ul>
            		<li>Service Provider: <br/>
            			<img src='styles/images/provider.jpg' />
            		</li>
            		<br/>
            		<li>New User: <br/>
            			<img src='styles/images/newUser.jpg' />
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
			<FancyContainer>
				<PlanStepTitle title='Put Your Network Elements on the Map'/>
				<div className='row'>
					<div id='mapContainer' className='col-sm-10'>
						<Marker />
						<Map mapScriptSrc='mapjs/index.js'/>
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
				<PlanStepTitle title='Input Your Requirements'/>
				<form method='POST' action='http://localhost:8080/submitNetworkRawData'>
        			Bandwidth: <input type='text' name='bandwidth' value={this.props.bandwidth}
        						ref={(input) => this.bandwidth = input} onChange={this.handleChange} />
        			Costs: <input type='text' name='costs' value={this.props.costs}
        					ref={(input) => this.costs = input} onChange={this.handleChange} />
        			<input type='hidden' name='serviceProviders' value={JSON.stringify(window.coordinates)} />
        			<input type='hidden' name='newUsers' value={JSON.stringify(window.coordinates)} /><br/>
        			<input type='submit' name='GO!' />
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
