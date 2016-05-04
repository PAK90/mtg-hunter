import {FacetFilter} from "./FacetFilter"
import {FacetFilterProps, FacetFilterPropTypes} from "searchkit"

export class RefinementListFilter extends FacetFilter {

}

export class TestRefinementListFilter extends FacetFilter {
  getAccessorOptions(){
    const defaultOptions = super.getAccessorOptions()
    return {
      defaultOptions,
      min_doc_count: 0  
    }
  }
}
