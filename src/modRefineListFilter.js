import * as React from "react";

import {TestRefinementListFilter} from "./RefinementListFilter";
import {RefinementListFilter as OriginalRefinementListFilter} from "searchkit";

export class RefinementListFilter extends OriginalRefinementListFilter {
  componentDidUpdate(prevProps) {
    if (prevProps.operator != this.props.operator){
      this.accessor.options.operator = this.props.operator;
      this.searchkit.performSearch();
    }
  }
}
export class OnlyRefinementListFilter extends TestRefinementListFilter {
  componentDidUpdate(prevProps) {
    if (prevProps.operator != this.props.operator){
      this.accessor.options.operator = this.props.operator;
      this.searchkit.performSearch();
    }
  }
}