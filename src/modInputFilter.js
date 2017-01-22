import * as React from "react";
import {InputFilter as OriginalInputFilter} from "searchkit";

export class InputFilter extends OriginalInputFilter {
	componentWillReceiveProps(newProps) {
    	if (newProps.queryOptions.defaultOperator != this.props.queryOptions.defaultOperator){
        	this.accessor.options.queryOptions.defaultOperator = newProps.queryOptions.defaultOperator;
        	this.searchkit.performSearch();
    	}
  	}
}
