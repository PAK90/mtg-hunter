import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import "searchkit/theming/theme.scss";
import "./styles/customisations.scss";
var ent = require('ent');
const nl2br = require('react-nl2br');

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
    </div>
  )
}

//"Enchant creature↵Enchanted creature gets +1/+1 for each creature you control.↵Cycling {G/W} ({G/W}, Discard this card: Draw a card.)"

function generateTitleCostSymbols(source) {
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
  }
  return tagged;
}

function generateTextCostSymbols(source) {
  var tagged;
  if (source !== undefined) {
    // Get rid of / in any costs first, but only if inside {} brackets (so as not to affect +1/+1).
    source = source.replace(/(\/)(?=\w\})/g,'');
    // Then generate the tags through setting the innerHtml. This is the only way to preserve the text around the img tags.
    // Encode the source in html, to prevent XSS nastiness. Then replace the newlines with <br/>. Then insert the <img> tags.
    tagged = <div dangerouslySetInnerHTML={{__html: ent.encode(source).replace(/&#10;/g, '<br/>').replace(/\{([0-z,½,∞]+)\}/g, (fullMatch, firstMatch) =>
        `<img src=./src/img/${firstMatch.toLowerCase()}.png height=12px/>`
      )}}></div>
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

const SetRefineList = (props:FilterItemComponentProps, showCheckbox)=> {
  const {bemBlocks, toggleFilter, translate, selected, label, count} = props;
  const block = bemBlocks.option;
  const className = block()
                    .state({selected})
                    .mix(bemBlocks.container("item"));
  return (
    <FastClick handler={toggleFilter}>
      <div className={className} data-qa="option">
        {showCheckbox ? <input type="checkbox" data-qa="checkbox" checked={selected} readOnly className={block("checkbox").state({ selected }) } ></input> : undefined}
        <img src = {'./src/img/sets/' + props.label.replace(/\s+/g,'').replace(":","").replace('"','').replace('"','').toLowerCase() + '-R.jpg'} />
        <div data-qa="label" className={block("text")}>{label}</div>
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
    this.state = {hoveredId: '',
      matchPercent: '95%'};
  }

  handleHoverIn(source) {
    this.setState({hoveredId: source.id});
  }

  handleHoverOut(source) {
    this.setState({hoveredId: ''});
  }

  handleSearchChange(e) {
    this.searchkit.getQueryAccessor().options.queryFields = [e.target.value];
    this.searchkit.getQueryAccessor().options.prefixQueryFields = [e.target.value];
    this.searchkit.performSearch();
  }

  getSetIcons(source) {
    // Loop through all multiverseIds, which have their own set code and rarity.
    var setImages = source.multiverseids.map(function(multis, i) {
      let rarity = multis.rarity.charAt(0) == "B" ? "C" : multis.rarity.charAt(0)
      let url = "http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=" + multis.multiverseid;
      return (<a href={url} target="_blank">
              <img src={'./src/img/sets/' + multis.setName.replace(/\s+/g,'').replace(":","").replace('"','').replace('"','').toLowerCase() + '-' + rarity + '.jpg'} title={multis.setName}/>
              </a> )
    })
    return setImages;
  }

  CardHitsListItem = (props)=> {
    const {bemBlocks, result} = props
    const source = result._source
    // Add onHover for the image to enlarge with Velocity.
    let url = "http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=" + result._source.multiverseids[result._source.multiverseids.length - 1].multiverseid;
    let imgUrl = 'https://image.deckbrew.com/mtg/multiverseid/' + result._source.multiverseids[result._source.multiverseids.length - 1].multiverseid + '.jpg';
    // Generate the mana symbols in both cost and the card text.
    source.tagCost = generateTitleCostSymbols(source.manaCost);
    source.taggedText = generateTextCostSymbols(source.text);
    // For some reason, hovering over the image scrolls the page back up...
    return (
      <div className={bemBlocks.item().mix(bemBlocks.container("item"))} data-qa="hit">
        <div className={bemBlocks.item("name")}>
        <a href={url} target="_blank">
          <img src={imgUrl} width={this.state.hoveredId == source.id ? "223" : "100"} onMouseOver={this.handleHoverIn.bind(this, source)}
                          onMouseOut={this.handleHoverOut.bind(this, source)}/>
        </a>
        </div>
        <div className={bemBlocks.item("details")}>
          <h2 className={bemBlocks.item("title")}>{source.name} {source.tagCost} ({source.cmc ? source.cmc : 0})</h2>
          <h3 className={bemBlocks.item("subtitle")}><b>{source.type}</b></h3>
          <h3 className={bemBlocks.item("subtitle")}>{source.taggedText}</h3>
        </div>
        <div>
          <p style={{textAlign:'right'}}>{this.getSetIcons(source)}</p>
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
                queryOptions={{"minimum_should_match":this.state.matchPercent}}
                autofocus={true}
                searchOnChange={true}
                queryFields={["name"]}/>
                <select name="searchField" onChange={this.handleSearchChange.bind(this)}>
                  <option value="name">Name</option>
                  <option value="text">Body text</option>
                  <option value="flavor">Flavour text</option>
                  <option value="type">Type</option>
                  <option value="artist">Artist</option>
                </select>
            </div>
          </div>

          <div className="sk-layout__body">

            <div className="sk-layout__filters">
              <RangeFilter id="cmc" min={0} max={15} title="Converted Cost" field="cmc" showHistogram={true}/>
              <RefinementListFilter id="colours" title="Colours" field="colors.raw" size={6} operator="AND"/>
              <RefinementListFilter id="symbols" title="Symbols" field="symbols" size={5} operator="AND" itemComponent={SymbolRefineList}/>
              <RefinementListFilter id="colourCount" title="Colour Count" field="colourCount" size={6} operator="AND" orderKey="_term"/>
              <RefinementListFilter id="rarity" title="Rarity" field="rarity.raw" size={5} operator="AND"/>
              <RefinementListFilter id="type" title="Type" field="types.raw" size={5} operator="AND"/>
              <RefinementListFilter id="subtype" title="Subtype" field="subtypes.raw" size={5} operator="AND"/>
              <RefinementListFilter id="setcodes" title="Set" field="codeNames.raw" size={5} operator="AND" itemComponent={SetRefineList}/>
            </div>

            <div className="sk-layout__results sk-results-list">
              <div className="sk-results-list__action-bar sk-action-bar">
                <div className="sk-action-bar__info">
                  <HitsStats />
                  <ViewSwitcherToggle/>
                  <SortingSelector options={[
                    {label:"Name", field: "name.raw", order: "asc", defaultOption:true},
                    {label:"Relevance", field:"_score", order:"desc"},
                    {label:"Colour", field:"colors", order:"asc"},
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
                  scrollTo={false}
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

ReactDOM.render(<App />, document.getElementById('app'));
