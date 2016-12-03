import React from 'react';
import { browserHistory } from 'react-router';

export default React.createClass({
  render() {
    return (
      <div>
      	<button onClick={browserHistory.goBack}>Back to search</button>
        <h2>Displaying card <b>{this.props.params.cardName}</b> from set <b>{this.props.params.setName}</b>!</h2>
        <h4>Hit is {this.props.hits}</h4>
      </div>
    )
  }
})
