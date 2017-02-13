import React from 'react'
import ReactDOM from 'react-dom'
import {FancyContainer, Map, ContainerTitle, MyButton} from './utils.jsx'

class PlanToolTitle extends React.Component {
	render() {
		return (
			<div className='jumbotron text-center'>
	            <h1>Network Planning Tool</h1>
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
            		<li className = 'list-group-item withoutBorder'>Source: <br/>
            			<img src='styles/images/provider.png' className='img-responsive' />
            		</li>
            		<li className = 'list-group-item withoutBorder'>Sink: <br/>
            			<img src='styles/images/newUser.png' className='img-responsive' />
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
					<div className='col-sm-1'>
						<MarkerList />
					</div>
					<div className='col-sm-10 smallMapContainer'>
						<Map mapScriptSrc='mapjs/index.js'/>
					</div>
					<div className='col-sm-1'>
		            	<MapLegends />
		            </div>
	            </div>
        	</FancyContainer>
        )
	}
}

class MarkerList extends React.Component {
	constructor(props) {
		super(props)

		this.state = {nodes: ''}
		this.handleSubmit = this.handleSubmit.bind(this)
	}

	handleSubmit(event) {
		 this.setState({nodes: JSON.stringify(window.nodes)})
		 window.validateMapInputAndSubmit(event)
	}

	render() {
		var serviceProvider = {}
		serviceProvider.name = 'Source'
		serviceProvider.id = 'styles/images/provider.png'
		serviceProvider.invokeEvent = false

		var newUser = {}
		newUser.name = 'Sink'
		newUser.id = 'styles/images/newUser.png'
		newUser.invokeEvent = false

		return (
			<div>
				<h4 className='text-center'>Markers</h4><br/>
				<MyButton button={serviceProvider} /><br/>
				<MyButton button={newUser} /><br/>

				<form className='form-horizontal' method='POST' id='requirementsForm' onSubmit={this.handleSubmit}>
        			<div className='form-group'>
						<div className='col-sm-9'>
		        			<input type='hidden' id='disabledTextInput' className='form-control' name='bandwidth' value='2342342342'/>
		        		</div>
		        	</div>
		        	<div className='form-group'>
		        		<div className='col-sm-9'>
		        			<input type='hidden' id='disabledTextInput' className='form-control' name='costs' value='123123123' />
		        		</div>
		        	</div>
        			<input type='hidden' name='nodes' value={this.state.nodes} />
        			<button className='btn btn-primary btn-block' type='submit'>GO!</button>
	      		</form>

			</div>
		)
	}
}

//Contains the entirety of the tool
class PlanningToolContainer extends React.Component {
	constructor(props) {
		super(props)
	}

	render() {
		return (
			<div>
				<PlanToolTitle />
				<MapContainer />
			</div>
		)
	}
}

ReactDOM.render(
	<PlanningToolContainer />,
	document.getElementById('root')
)