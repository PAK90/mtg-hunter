import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import "searchkit/theming/theme.scss";
import "./styles/customisations.scss";
var VelocityTransitionGroup = require('velocity-react/velocity-transition-group.js');
var VelocityComponent = require('velocity-react/velocity-component.js');
var VelocityHelpers = require('velocity-react/velocity-helpers.js');
require('velocity-animate/');
require('velocity-animate/velocity.js');
require('velocity-animate/velocity.ui.js');
var ent = require('ent');
const nl2br = require('react-nl2br');
const omit = require("lodash/omit");
const map = require("lodash/map");

import {
  SearchBox,
  Hits,
  HitsStats,
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
import {RefinementListFilter} from './modRefineListFilter.js';
import CardDetailPanel from './CardDetailPanel';
import CardHitsListItem from './CardHitsListItem';

String.prototype.replaceAll = function(s,r){return this.split(s).join(r)};

// Register animations here so that 'stagger' property can be used with them.
var Animations = {
    In: VelocityHelpers.registerEffect({
        calls: [
            [{
                transformPerspective: [ 800, 800 ],
                transformOriginX: [ '50%', '50%' ],
                transformOriginY: [ '100%', '100%' ],
                marginBottom: 10,
                opacity: 1,
                rotateX: [0, 130],
            }, 1, {
                easing: 'ease-out',
                display: 'block',
            }]
        ],
    }),
    Out: VelocityHelpers.registerEffect({
        calls: [
            [{
                transformPerspective: [ 800, 800 ],
                transformOriginX: [ '50%', '50%' ],
                transformOriginY: [ '0%', '0%' ],
                marginBottom: -30,
                opacity: 0,
                rotateX: [-70],
            }, 1, {
                easing: 'ease-out',
                display: 'block',
            }]
        ],
    })
};

export class AnimatedHits extends Hits<HitsProps, any> {
  render() {
    var animationEnter = {
      duration: 100,
      animation: Animations.In,
      stagger: 50
    };
    var animationLeave = {
      duration: 100,
      animation: Animations.Out,
      stagger: 50,
      backwards: true
    };

    let hits:Array<Object> = this.getHits()
    let hasHits = hits.length > 0

    if (!this.isInitialLoading() && hasHits) {
      return (
        <div data-qa="hits" className={this.bemBlocks.container()}>
        <VelocityTransitionGroup enter={animationEnter} leave={animationLeave}>
          {map(hits, this.renderResult.bind(this))}
        </VelocityTransitionGroup>
        </div>
      );
    }
    return null
  }
}

export class ViewSwitcherHitsExt extends ViewSwitcherHits<ViewSwitcherHitsProps, any> {
  render(){
    let hitComponents = this.props.hitComponents
    let props = omit(this.props, "hitComponents")
    let selectedOption = this.accessor.getSelectedOption()
    props.itemComponent = selectedOption.itemComponent
    props.mod = 'sk-hits-'+selectedOption.key
    return (
      <AnimatedHits {...props} />
    )
  }
}

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
        <img src = {'./src/img/' + props.label.toLowerCase() + '.png'}  height="15px"/>
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
  // objectFit: contain is to preserve the shape of the set icons; otherwise they got distorted.
  return (
    <FastClick handler={toggleFilter}>
      <div className={className} data-qa="option">
        {showCheckbox ? <input type="checkbox" data-qa="checkbox" checked={selected} readOnly className={block("checkbox").state({ selected }) } ></input> : undefined}
        <img src = {'./src/img/sets/' + props.label.replace(/\s+/g,'').replace(":","").replace('"','').replace('"','').toLowerCase() + '-R.jpg'}
          style={{objectFit: 'contain', padding: '2px'}} />
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
      clickedCard: '',
      matchPercent: '100%',
      operator: "AND"};
  }

  hide() {
    this.setState({clickedCard: ''});
  }

  handleClick(source) {
    // If clicked on a different card, change the name.
    if (this.state.clickedCard != source.name)
    {
      this.setState({clickedCard: source.name});
    }
    // Else, we clicked on the same card, so shrink.
    else {
      this.setState({clickedCard: ''});
    }
    //document.addEventListener("click", this.hide.bind(this));
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

  handleOperatorChange(e){
    this.setState({operator: e.target.value})
  }

  getSetIcons(source) {
    // Loop through all multiverseIds, which have their own set code and rarity.
    var setImages = source.multiverseids.map(function(multis, i) {
      let rarity = multis.rarity.charAt(0) == "B" ? "C" : multis.rarity.charAt(0); // Replace 'basic' rarity with common.
      let url = "http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=" + multis.multiverseid;
      return (
              <img className='setIcon' src={'./src/img/sets/' + multis.setName.replace(/\s+/g,'').replace(":","").replace('"','').replace('"','').toLowerCase() + '-' + rarity + '.jpg'} 
                title={multis.setName}
                style={{padding: '2px'}}
                onClick={this.handleClick.bind(this, source)}/>
               )
    }.bind(this))
    return setImages;
  }

  CardHitsGridItem = (props)=> {
    const {bemBlocks, result} = props;
    const source = result._source;
    let url = "http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=" + result._source.multiverseids[result._source.multiverseids.length - 1].multiverseid;
    let imgUrl = 'https://image.deckbrew.com/mtg/multiverseid/' + result._source.multiverseids[result._source.multiverseids.length - 1].multiverseid + '.jpg';
    return (
      <div className={bemBlocks.item().mix(bemBlocks.container("item"))}>
          <img className='gridImg'  
            src={imgUrl} 
            onClick={this.handleClick.bind(this, source)}
            onMouseOver={this.handleHoverIn.bind(this, source)}
            onMouseOut={this.handleHoverOut.bind(this, source)}/>
      </div>
    )
  }

  Details = (source)=> {
    if (this.state.clickedCard != '') {
      return <div><p>Look! More stuff about {this.state.clickedCard}</p></div>
    }
    else {
      return <div/>
    }
  }

  render() {
    return (
      <div>
      <SearchkitProvider searchkit={this.searchkit}>
      <div>
        <div className="sk-layout sk-layout__size-l">

          <div className="sk-layout__top-bar sk-top-bar">
            <div className="sk-top-bar__content">
              <div className="my-logo">MtG:Hunter</div>
              <SearchBox
                translations={{"searchbox.placeholder": "search card names"}}
                queryOptions={{"minimum_should_match": this.state.matchPercent}}
                autofocus={true}
                searchOnChange={true}
                queryFields={["name"]}/>
                <select name="searchField" onChange={this.handleSearchChange.bind(this)}>
                  <option value="name">Name</option>
                  <option value="namelessText">Body text</option>
                  <option value="flavors">Flavour text</option>
                  <option value="type">Type</option>
                  <option value="artists">Artist</option>
                </select>
            </div>
          </div>

          <div className="sk-layout__body">

            <div className="sk-layout__filters">
              <RangeFilter id="cmc" min={0} max={15} title="Converted Cost" field="cmc" showHistogram={true}/>
              <select value={this.state.operator} onChange={this.handleOperatorChange.bind(this) }>
                <option value="AND">AND</option>
                <option value="OR">OR</option>
              </select>
              <RefinementListFilter id="colours" title="Colours" field="colors.raw" size={6} operator={this.state.operator}/>
              <RefinementListFilter id="symbols" title="Symbols" field="symbols" size={5} operator={this.state.operator} itemComponent={SymbolRefineList}/>
              <RefinementListFilter id="colourCount" title="Colour Count" field="colourCount" size={6} operator={this.state.operator} orderKey="_term"/>
              <RefinementListFilter id="rarity" title="Rarity" field="rarities.raw" size={5} operator={this.state.operator}/>
              <RefinementListFilter id="supertype" title="Supertype" field="supertypes.raw" size={5} operator={this.state.operator}/>
              <RefinementListFilter id="type" title="Type" field="types.raw" size={5} operator={this.state.operator}/>
              <RefinementListFilter id="subtype" title="Subtype" field="subtypes.raw" size={5} operator={this.state.operator}/>
              <RefinementListFilter id="setcodes" title="Set" field="codeNames.raw" size={5} operator={this.state.operator} itemComponent={SetRefineList}/>
              <RefinementListFilter id="formats" title="Formats" field="formats.raw" size={5} operator={this.state.operator}/>
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
                    hitsPerPage={20}
                    hitComponents = {[
                      {key:"grid", title:"Grid", itemComponent:this.CardHitsGridItem},
                      {key:"list", title:"List", itemComponent:CardHitsListItem, defaultOption:true}
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
