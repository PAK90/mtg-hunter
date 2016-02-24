import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import "searchkit/theming/theme.scss";
import "./styles/customisations.scss";

var CardDetailPanel = React.createClass({
	getInitialState: function() {
        return {
            visible: false,
            selectedCardName: ''
        };
    },

    componentWillUpdate: function(nextProps, nextState) {
    	if (nextProps.selectedCardName != this.state.selectedCardName) {
    		this.show();
    		this.setState({selectedCardName: nextProps.selectedCardName});
    	}
    },

    show: function() {
        this.setState({ visible: true });
        document.addEventListener("click", this.hide.bind(this));
    },

    hide: function(e) {
    	let target = e.target;
    	let thisDiv = document.getElementById('ignore');
    	let gridImgs = document.getElementsByClassName('gridImg');
    	let listImgs = document.getElementsByClassName('listImg');
    	let setIcons = document.getElementsByClassName('setIcon');
    	if (target !== ignore && !ignore.contains(target) && !_.includes(gridImgs,target) && !_.includes(listImgs,target) && !_.includes(setIcons,target)) {
	        document.removeEventListener("click", this.hide.bind(this));
	        this.setState({ visible: false, selectedCardName: '' });
	    }
    },

	render: function() {
		// The ignore ID is for the hide function not to hide on clicking other cards or the card div.
		return <div className="cardDetailContainer">
		 	<div ref="base" id='ignore' className={(this.state.visible ? "visible " : "") + "cardDiv"}>
		 		<div>{this.props.sentContent}(Click anywhere to dismiss.)</div>
		 	</div>
		</div>
	}
});

export default CardDetailPanel;