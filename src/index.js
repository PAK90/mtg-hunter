import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import "searchkit/theming/theme.scss";
import "./styles/customisations.scss";

import {
  SearchBox,
  Hits,
  HitsStats,
  RefinementListFilter,
  Pagination,
  ResetFilters,
  MenuFilter,
  SelectedFilters,
  HierarchicalMenuFilter,
  NumericRefinementListFilter,
  SortingSelector,
  SearchkitComponent,
  SearchkitProvider,
  SearchkitManager,
  NoHits,
  RangeFilter,
  InitialLoader
} from "searchkit";

const CardHitsItem = (props)=> {
  const {bemBlocks, result} = props;
  let url = "http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=" + result._source.multiverseids[result._source.multiverseids.length - 1].multiverseid;
  let imgUrl = 'https://image.deckbrew.com/mtg/multiverseid/' + result._source.multiverseids[result._source.multiverseids.length - 1].multiverseid + '.jpg';
  return (
    <div className={bemBlocks.item().mix(bemBlocks.container("item"))} data-qa="hit">
      <a href={url} target="_blank">
        <img data-qa="name" className={bemBlocks.item("name")} src={imgUrl} width="223" /*height="310"*//>
      </a>
      <a href={url} target="_blank">
        <div data-qa="name" className={bemBlocks.item("name")} dangerouslySetInnerHTML={{__html:_.get(result,"highlight.name",false) || result._source.name}}>
        </div>
      </a>
    </div>
  )
}

const SymbolRefineList = (props)=> {
  const {bemBlocks} = props;
  return (
    <div data-qa="option" className={props.bemBlocks.option().state({selected:props.selected}).mix(bemBlocks.container("item"))} onClick={props.toggleFilter}>
      <div data-qa="checkbox" className={props.bemBlocks.option("checkbox").state({selected:props.selected})}>{props.selected}</div>
      <img src = {'./src/img/' + props.label.toUpperCase() + '.png'} height="15px" style={{paddingLeft:'20px'}}/>
      <div className={props.bemBlocks.option("count")}>{props.count}</div>
    </div>
  )
}

export class App extends React.Component<any, any> {

  constructor() {
    super()
    const host = "http://localhost:9200/cards/card"
    this.searchkit = new SearchkitManager(host)   
  }

  render(){

    return (
      <div>
      <SearchkitProvider searchkit={this.searchkit}>
      <div>
        <div className="layout">

          <div className="layout__top-bar top-bar">
            <div className="top-bar__content">
              <div className="my-logo">Gatherer V2</div>
              <SearchBox
                translations={{"searchbox.placeholder":"search card names"}}
                queryOptions={{"minimum_should_match":"70%"}}
                autofocus={true}
                searchOnChange={true}
                queryFields={["type","name"]}/>
            </div>
          </div>

          <div className="layout__body">

            <div className="layout__filters">
              <RangeFilter id="cmc" min={0} max={15} title="Converted Cost" field="cmc" showHistogram={true}/>
              <RefinementListFilter id="colours" title="Colours" field="colors.raw" size={6} operator="AND"/>
              <RefinementListFilter id="symbols" title="Symbols" field="symbols" size={5} operator="AND" itemComponent={SymbolRefineList}/>
              <RefinementListFilter id="colourCount" title="Colour Count" field="colourCount" size={6} operator="AND"/>
              <RefinementListFilter id="rarity" title="Rarity" field="rarity.raw" size={5} operator="AND"/>
              <RefinementListFilter id="type" title="Type" field="types.raw" size={5} operator="AND"/>
              <RefinementListFilter id="subtype" title="Subtype" field="subtypes.raw" size={5} operator="AND"/>
              <RefinementListFilter id="codes" title="Set" field="codes.raw" size={5} operator="AND"/>
            </div>

            <div className="layout__results results-list">
              <div className="results-list__action-bar action-bar">
                <div className="action-bar__info">
                  <HitsStats />
                  <SortingSelector options={[
                    {label:"Name", field: "name.raw", order: "asc", defaultOption:true},
                    {label:"Relevance", field:"_score", order:"desc"},
                    {label:"Colour", field:"colors", order:"desc"},
                    {label:"Converted Cost", field:"cmc", order:"asc"}
                  ]}/>
                </div>

                <div className="action-bar__filters">
                  <SelectedFilters/>
                  <ResetFilters/>
                </div>

              </div>
              <Hits hitsPerPage={12} highlightFields={["name"]}
                itemComponent={CardHitsItem}
                scrollTo="body" />
              <NoHits suggestionsField={"name"}/>
              <InitialLoader/>
              <Pagination showNumbers={true}/>
            </div>
          </div>
        </div>
      </div>
      </SearchkitProvider>
      </div>
    )}
}

ReactDOM.render(<App />, document.getElementById('app'));
