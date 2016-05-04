import {ArrayState} from "searchkit"
import {FilterBasedAccessor} from "searchkit"
import {
  TermQuery, TermsBucket, CardinalityMetric,
  BoolShould, BoolMust, BoolMustNot, SelectedFilter,
  FilterBucket
} from "searchkit";
const assign = require("lodash/assign")
const map = require("lodash/map")
const omitBy = require("lodash/omitBy")
const isUndefined = require("lodash/isUndefined")

export class FacetAccessor extends FilterBasedAccessor {

  state = new ArrayState()
  options:any
  defaultSize:number
  size:number
  uuid:string
  loadAggregations: boolean

  static translations:any = {
    "facets.view_more":"View more",
    "facets.view_less":"View less",
    "facets.view_all":"View all"
  }
  translations = FacetAccessor.translations

  constructor(key, options:FacetAccessorOptions){
    super(key, options.id)
    this.options = options
    this.defaultSize = options.size
    this.options.facetsPerPage = this.options.facetsPerPage || 50
    this.size = this.defaultSize;
    this.loadAggregations = isUndefined(this.options.loadAggregations) ? true : this.options.loadAggregations
    if(options.translations){
      this.translations = assign({}, this.translations, options.translations)
    }
  }

  getBuckets(){
    return this.getAggregations([this.uuid, this.key, "buckets"], [])
  }
  
  getDocCount(){
    return this.getAggregations([this.uuid, "doc_count"], 0)
  }

  setViewMoreOption(option:ISizeOption) {
    this.size = option.size;
  }

  getMoreSizeOption():ISizeOption {
    var option = {size:0, label:""}
    var total = this.getCount()
    var facetsPerPage = this.options.facetsPerPage
    if (total <= this.defaultSize) return null;

    if (total <= this.size) {
      option = {size:this.defaultSize, label:this.translate("facets.view_less")}
    } else if ((this.size + facetsPerPage) > total) {
      option = {size:total, label:this.translate("facets.view_all")}
    } else if ((this.size + facetsPerPage) < total) {
      option = {size:this.size + facetsPerPage, label:this.translate("facets.view_more")}
    } else if (total ){
      option = null
    }

    return option;
  }

  getCount():number {
    return this.getAggregations([this.uuid, this.key+"_count", "value"], 0)
  }

  isOrOperator(){
    return this.options.operator === "OR"
  }

  getBoolBuilder(){
    return this.isOrOperator() ? BoolShould : BoolMust
  }

  getOnlyBoolBuilder(){
    return BoolMustNot
  }

  getOrder(){
    if(this.options.orderKey){
      let orderDirection = this.options.orderDirection || "asc"
      return {[this.options.orderKey]:orderDirection}
    }
  }

  buildSharedQuery(query){
    var filters = this.state.getValue()
    var filterTerms = map(filters, TermQuery.bind(null, this.key))
    var selectedFilters:Array<SelectedFilter> = map(filters, (filter)=> {
      return {
        name:this.options.title || this.translate(this.key),
        value:this.translate(filter),
        id:this.options.id,
        remove:()=> this.state = this.state.remove(filter)
      }
    })
    var buckets = this.getBuckets(); // Get all this filter's buckets.
    var notFilters = _.map(buckets, 'key'); // Get the key out of those.
    var notFilters = _.difference(notFilters, filters); // Remove any selected filters from the bucket keys.
    var onlyFilterTerms = map(notFilters, TermQuery.bind(null, this.key)) // Make terms of them.

    var boolBuilder = this.getBoolBuilder()
    var onlyBoolBuilder = this.getOnlyBoolBuilder()

    if(filterTerms.length > 0){
      query = query.addFilter(this.uuid, boolBuilder(filterTerms))
        .addSelectedFilters(selectedFilters)
      // Add only filters.
      query = query.addFilter(this.uuid, onlyBoolBuilder(onlyFilterTerms))
    }

    return query
  }

  buildOwnQuery(query){
    if (!this.loadAggregations){
      return query
    } else {
      var filters = this.state.getValue()
      let excludedKey = (this.isOrOperator()) ? this.uuid : undefined
      return query
        .setAggs(FilterBucket(
          this.uuid,
          query.getFiltersWithoutKeys(excludedKey),
          TermsBucket(this.key, this.key, omitBy({
            size:this.size,
            order:this.getOrder(),
            include: this.options.include,
            exclude: this.options.exclude,
            min_doc_count:this.options.min_doc_count
          }, isUndefined)),
          CardinalityMetric(this.key+"_count", this.key)
        ))
    }
  }
}
