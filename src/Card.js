import React from 'react'

export default React.createClass({
  render() {
    return (
      <div>
        <h2>Displaying set {this.props.params.setName} from card {this.props.params.cardName}! Ha ha! :-)</h2>
      </div>
    )
  }
})
