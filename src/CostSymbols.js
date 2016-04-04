import React from 'react'

export default class CostSymbols extends React.Component {
  
  render(){
    const { cost } = this.props
    if (!cost) return null
    return (
      <span>
        {cost.toLowerCase().match(/([0-z]\/[0-z])|hw|[0-z,½,∞]/g).map(function (basename, i) {
          var src = './src/img/' + basename.replace("/", "").toLowerCase() + '.png';
            return <img key={i} src={src} height='15px' style={{marginBottom: -2}}/>;
        })}
      </span>
    )
  }   
}