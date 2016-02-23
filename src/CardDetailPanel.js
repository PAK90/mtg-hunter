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

    hide: function() {
        document.removeEventListener("click", this.hide.bind(this));
        this.setState({ visible: false });
    },

	render: function() {
		return <div className="cardDetailContainer">
		 	<div ref="base" className={(this.state.visible ? "visible " : "") + "cardDiv"}>
		 		<div>{this.props.sentContent}(Click anywhere to dismiss.)</div>
		 	</div>
		</div>
	}
});

export default CardDetailPanel;