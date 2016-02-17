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
  FastClick,
  NoHits,
  RangeFilter,
  InitialLoader,
  ViewSwitcherHits,
  ViewSwitcherToggle
} from "searchkit";

String.prototype.replaceAll = function(s,r){return this.split(s).join(r)};

const CardHitsGridItem = (props)=> {
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



//"Enchant creature↵Enchanted creature gets +1/+1 for each creature you control.↵Cycling {G/W} ({G/W}, Discard this card: Draw a card.)"

function generateCostSymbols(source) {
  // Take the manacost and return a bunch of img divs.
  var tagged;
  if (source !== undefined) {
    source = source.replace(/\//g,''); // Get rid of / in any costs first.
    // Check that match returns anything.
    if (source.match(/\{([0-z,½,∞]+)\}/g)) {
      tagged = source.match(/\{([0-z,½,∞]+)\}/g)
      .map(function (basename, i) {
          var src = './src/img/' + basename.substring(1, basename.length - 1).toLowerCase() + '.png';
          return <img key={i} src={src} height='15px'/>;
      });
    }
    /*tagged = source.replace(/\{([0-z,½,∞]+)\}/g, function(basename) {
      var src = './src/img/' + basename.substring(1, basename.length - 1).toLowerCase() + '.png';
      return <img src="$1" height='15px'/>});*/
  }
  return tagged;
}


const SymbolRefineList = (props:FilterItemComponentProps, showCheckbox)=> {
  const {bemBlocks, toggleFilter, translate, selected, label, count} = props;
  const block = bemBlocks.option;
  const className = block()
                    .state({selected})
                    .mix(bemBlocks.container("item"));
  return (
    <FastClick handler={toggleFilter}>
      <div className={className} data-qa="option">
        {showCheckbox ? <input type="checkbox" data-qa="checkbox" checked={selected} readOnly className={block("checkbox").state({ selected }) } ></input> : undefined}
        <img src = {'./src/img/' + props.label.toUpperCase() + '.png'}  height="15px"/>
        <div data-qa="count" className={block("count")} style={{flex:'1'}}>{count}</div>
      </div>
    </FastClick>
  )
}

export class App extends React.Component<any, any> {

  constructor() {
    super();
    const host = "http://localhost:9200/cards/card";
    this.searchkit = new SearchkitManager(host);
    var hoveredId = '';
  }

  handleHoverIn(source) {
    this.hoveredId = source.id;
    console.log(this.hoveredId);
  }
  handleHoverOut(source) {
    this.hoveredId = '';
    console.log(this.hoveredId);
  }

  CardHitsListItem = (props)=> {
    const {bemBlocks, result} = props
    const source = result._source
    // Add onHover for the image to enlarge with Velocity.
    let url = "http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=" + result._source.multiverseids[result._source.multiverseids.length - 1].multiverseid;
    let imgUrl = 'https://image.deckbrew.com/mtg/multiverseid/' + result._source.multiverseids[result._source.multiverseids.length - 1].multiverseid + '.jpg';
    // Generate the mana symbols in both cost and the card text.
    source.tagCost = generateCostSymbols(source.manaCost);
    //source.taggedText = generateCostSymbols(source.text);
    return (
      <div className={bemBlocks.item().mix(bemBlocks.container("item"))} data-qa="hit">
        <div className={bemBlocks.item("name")}>
        <a href={url} target="_blank">
          <img data-qa="name" src={imgUrl} width={this.hoveredId == source.id ? "223" : "100"} onMouseOver={this.handleHoverIn.bind(this, source)}
                          onMouseOut={this.handleHoverOut.bind(this, source)}/>
        </a>
        </div>
        <div className={bemBlocks.item("details")}>
          <h2 className={bemBlocks.item("title")}>{source.name} {source.tagCost} ({source.cmc ? source.cmc : 0})</h2>
          <h3 className={bemBlocks.item("subtitle")}>{source.text.split("\n").map(function(item) {
            return (
              <span>
                {item}
                <br/>
              </span>
            )
          })}</h3>
        </div>
      </div>
    )
  };

  render(){

    return (
      <div>
      <SearchkitProvider searchkit={this.searchkit}>
      <div>
        <div className="sk-layout sk-layout__size-l">

          <div className="sk-layout__top-bar sk-top-bar">
            <div className="sk-top-bar__content">
              <div className="my-logo">Gatherer V2</div>
              <SearchBox
                translations={{"searchbox.placeholder":"search card names"}}
                queryOptions={{"minimum_should_match":"70%"}}
                autofocus={true}
                searchOnChange={true}
                queryFields={["type","name"]}/>
            </div>
          </div>

          <div className="sk-layout__body">

            <div className="sk-layout__filters">
              <RangeFilter id="cmc" min={0} max={15} title="Converted Cost" field="cmc" showHistogram={true}/>
              <RefinementListFilter id="colours" title="Colours" field="colors.raw" size={6} operator="AND"/>
              <RefinementListFilter id="symbols" title="Symbols" field="symbols" size={5} operator="AND" itemComponent={SymbolRefineList}/>
              <RefinementListFilter id="colourCount" title="Colour Count" field="colourCount" size={6} operator="AND"/>
              <RefinementListFilter id="rarity" title="Rarity" field="rarity.raw" size={5} operator="AND"/>
              <RefinementListFilter id="type" title="Type" field="types.raw" size={5} operator="AND"/>
              <RefinementListFilter id="subtype" title="Subtype" field="subtypes.raw" size={5} operator="AND"/>
              <RefinementListFilter id="setcodes" title="Set" field="codeNames.raw" size={5} operator="AND"/>
            </div>

            <div className="sk-layout__results sk-results-list">
              <div className="sk-results-list__action-bar sk-action-bar">
                <div className="sk-action-bar__info">
                  <HitsStats />
                  <ViewSwitcherToggle/>
                  <SortingSelector options={[
                    {label:"Name", field: "name.raw", order: "asc", defaultOption:true},
                    {label:"Relevance", field:"_score", order:"desc"},
                    {label:"Colour", field:"colors", order:"desc"},
                    {label:"Converted Cost", field:"cmc", order:"asc"}
                  ]}/>
                </div>

                <div className="sk-action-bar__filters">
                  <SelectedFilters/>
                  <ResetFilters/>
                </div>

              </div>
              <ViewSwitcherHits
                  hitsPerPage={12}
                  hitComponents = {[
                    {key:"grid", title:"Grid", itemComponent:CardHitsGridItem, defaultOption:true},
                    {key:"list", title:"List", itemComponent:this.CardHitsListItem}
                  ]}
                  scrollTo="body"
              />
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
/*<Hits hitsPerPage={12} highlightFields={["name"]}
                mod="sk-hits-grid"
                itemComponent={CardHitsGridItem}
                scrollTo="body" />*/

ReactDOM.render(<App />, document.getElementById('app'));
