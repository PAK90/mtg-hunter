import React from 'react';
const elasticsearch = require("elasticsearch");
import { browserHistory } from 'react-router';

export default React.createClass({
	getInitialState() {
		return ({
			cardInfo: null
		})
	},

	componentWillMount() {
		this.client = new elasticsearch.Client({
	 	    host:"http://192.168.1.119:9200"
	    })
	    this.index = "testcards";
	    this.type = "card";
	    this.client.get({
	    	index: this.index,
	    	type: this.type,
	    	id: this.props.params.cardName
	    }, function(error, response) {
	    	if (response.found) {
	    		this.setState({cardInfo: response._source});
	    	}
	    }.bind(this));
	},

  render() {
    return (
      <div>
      	<button onClick={browserHistory.goBack}>Back to search</button>
        <h2>Displaying card <b>{this.props.params.cardName}</b> from set <b>{this.props.params.setName}</b>!</h2>
        <h4>Hit is {JSON.stringify(this.state.cardInfo)}</h4>
      </div>
    )
  }
})
