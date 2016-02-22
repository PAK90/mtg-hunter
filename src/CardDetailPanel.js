import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import "searchkit/theming/theme.scss";
import "./styles/customisations.scss";

var CardDetailPanel = React.createClass({
	showBase: function() {
		this.refs.base.show();
	}
});

export default CardDetailPanel;