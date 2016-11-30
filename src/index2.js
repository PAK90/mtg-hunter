import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import "searchkit/theming/theme.scss";
const omit = require("lodash/omit");
const map = require("lodash/map");
//import "./styles/customisations.scss";

var firebase = require('firebase');
var firebaseui = require('firebaseui');
import {Navbar, Nav, NavItem, NavDropdown, Button, Jumbotron, MenuItem, Grid, Row, Col} from 'react-bootstrap';
import {
  SearchBox,
  Hits,
  HitsStats,
  Pagination,
  ResetFilters,
  MenuFilter,
  SelectedFilters,
  GroupedSelectedFilters,
  HierarchicalMenuFilter,
  NumericRefinementListFilter,
  RangeSliderHistogramInput,
  RangeSliderInput,
  SortingSelector,
  Tabs,
  SearchkitComponent,
  SearchkitProvider,
  SearchkitManager,
  FastClick,
  Panel,
  NoHits,
  TagFilter,
  PageSizeSelector,
  Select, Toggle,
  RangeFilter,
  ItemList,
  ItemHistogramList,
  InitialLoader,
  ViewSwitcherHits,
  ViewSwitcherToggle,
  DynamicRangeFilter,
  FilterGroup, FilterGroupItem,
  TagFilterConfig, TagFilterList
} from "searchkit";


class FilterGroupImg extends FilterGroup {

  renderFilter(filter, bemBlocks) {
    const { translate, removeFilter, title } = this.props
    const id = filter.id
    if ((id == "symbols") || (id == "colours") || (id == "colourIdentity")) {
      return (
        <FilterGroupItemImg key={filter.value}
                    itemKey={filter.value}
                    bemBlocks={bemBlocks}
                    filter={filter}
                    label={translate(filter.value)}
                    removeFilter={removeFilter} />
      )
    }
    else if (id == "manaCost") {
      return (
        <FilterGroupItemCost key={filter.value}
                    itemKey={filter.value}
                    bemBlocks={bemBlocks}
                    filter={filter}
                    label={translate(filter.value)}
                    removeFilter={removeFilter} />
      )
    }
    else if ((id == "setcodes")) {
      return (
        <FilterGroupItemSet key={filter.value}
                    itemKey={filter.value}
                    bemBlocks={bemBlocks}
                    filter={filter}
                    label={translate(filter.value)}
                    removeFilter={removeFilter} />
      )
    }
    else if ((id == "cycles")) {
      return (
        <FilterGroupItemCycleSet key={filter.value}
                    itemKey={filter.value}
                    bemBlocks={bemBlocks}
                    filter={filter}
                    label={translate(filter.value)}
                    removeFilter={removeFilter} />
      )
    }
    else {
      return super.renderFilter(filter, bemBlocks)
    }
  }
}

// Make a view switcher that accepts props.
class NewViewSwitcher extends ViewSwitcherHits {
  componentWillReceiveProps(nextProps){
        this.accessor.options = nextProps.hitComponents;
    }
}

const InitialLoaderComponent = (props) => {
  /*const {bemBlocks} = props;
  const block = bemBlocks.option;
  const className = block()
                    .mix(bemBlocks.container("item"));*/
  return <div >
    Loading, please wait...
  </div>
}

export class App extends React.Component<any, any> {


  CardHitsTable = (props)=> {
    const { hits } = props;

    function getSetIcons(source, scope) {
      // Loop through all multiverseIds, which have their own set code and rarity.
      var setImages = source.multiverseids.map(function(multis, i) {
        let rarity = multis.rarity.charAt(0) == "B" ? "C" : multis.rarity.charAt(0); // Replace 'basic' rarity with common.
        let url = "http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=" + multis.multiverseid;
        return (<div>
                <TagFilterConfig field="multiverseids.setName.raw" id="setNameIconTag" title="Set icon" operator={scope.state.setcodesOperator} searchkit={scope.searchkit}/>
                <TagFilter field="multiverseids.setName.raw" value={multis.setName}>
                <img className='setIcon' src={'./src/img/sets/' + multis.setName.replace(/\s+/g,'').replace(":","").replace('"','').replace('"','').toLowerCase() + '-' + rarity + '.jpg'}
                  title={multis.setName}
                  style={{padding: '2px'}}
                  />
                </TagFilter>
                </div>
                 )
      }.bind(this))
      return setImages;
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
    return (
      <div style={{width: '100%', boxSizing: 'border-box', padding: 8}}>
        <table className="sk-table sk-table-striped" style={{width: '100%', boxSizing: 'border-box'}}>
          <thead>
            <tr>
              <th></th> <th>Name</th> <th>Mana cost</th> <th>Type</th> <th>Paper price</th> <th>Sets</th>
            </tr>
          </thead>
          <tbody>
          {map(hits, hit=> (
            <tr key={hit._id}>
              <td style={{margin: 0, padding: 0, width: 40}}>
                <img data-qa="poster" src={
    'https://image.deckbrew.com/mtg/multiverseid/' + hit._source.multiverseids[hit._source.multiverseids.length - 1].multiverseid + '.jpg'} style={{width: 40}}/>
              </td>
              <td>{hit._source.name}</td>
              <td>{generateTitleCostSymbols(hit._source.manaCost)}</td>
              <td>
                <div style={{display:"inline-flex"}} className={"subtitle typeLine"} >
                  <TagFilterConfig field="supertypes.raw" id="supertypeField" title="Supertype" operator={this.state.supertypeOperator} searchkit={this.searchkit}/>
                  {_.map(hit._source.supertypes,supertype =>
                    <div key={supertype} style={{display:"inline-flex"}}>
                      <TagFilter field="supertypes.raw" value={supertype} /><span>&nbsp;</span>
                    </div>)}
                  <TagFilterConfig field="types.raw" id="typeField" title="Type" operator={this.state.typeOperator} searchkit={this.searchkit}/>
                  {_.map(hit._source.types,type =>
                    <div key={type} style={{display:"inline-flex"}}>
                      <TagFilter field="types.raw" value={type} /><span>&nbsp;</span>
                    </div>)}
                  {hit._source.subtypes ? <span>—&nbsp;</span> : <span/>}
                  <TagFilterConfig field="subtypes.raw" id="subtypeField" title="Subtype" operator={this.state.subtypeOperator} searchkit={this.searchkit}/>
                  {_.map(hit._source.subtypes,subtype =>
                    <div key={subtype} style={{display:"inline-flex"}}>
                      <TagFilter field="subtypes.raw" value={subtype} /><span>&nbsp;</span>
                    </div>)}
                </div>
              </td>
              <td>{hit._source.multiverseids[0].medPrice ?
                  "$" + parseFloat(hit._source.multiverseids[0].medPrice).toFixed(2) : (hit._source.multiverseids[1] ? "$" + parseFloat(hit._source.multiverseids[1].medPrice).toFixed(2) : "")
                  }</td>
              <td style={{maxWidth:'160px'}}>
                <div style={{textAlign:'center', maxHeight: '200px', overflow: 'auto', maxWidth:'130px', display:"inline-flex"}}>{getSetIcons(hit._source,this)}</div>
              </td>
            </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  	constructor() {
	    super();
	    const host = "http://192.168.1.119:9200/testcards/card";
	    this.searchkit = new SearchkitManager(host);
	    this.state = {hoveredId: '',
		    showModal: false,
		    clickedCard: '',
		    matchPercent: '100%',
		    all: 'collapse',
		    powerOperator: "AND",
		    toughnessOperator: "AND",
		    symbolsOperator: "AND",
		    manaCostOperator: "AND",
		    coloursOperator: "AND",
		    colourIdentityOperator: "AND",
		    colourCountOperator: "AND",
		    rarityOperator: "AND",
		    supertypeOperator: "AND",
		    typeOperator: "AND",
		    subtypeOperator: "AND",
		    artistsOperator: "AND",
		    setcodesOperator: "AND",
		    formatsOperator: "AND",
		    functiontagsOperator: "AND",
		    cyclesOperator: "AND",
		    rulesTextOperator: "AND",
		    coloursOnly: false,
		    colourIdentityOnly: false};
	    // Bind the prop function to this scope.
	    //this.handleClick = this.handleClick.bind(this);
	}

	render() {
		/*var config = {
	    	apiKey: "AIzaSyDd_EVNjL7-FnSW5XsYbUtVSWWh93DJBw4",
	    	authDomain: "mtg-hunter.firebaseapp.com",
	    	databaseURL: "https://mtg-hunter.firebaseio.com",
	    	storageBucket: "mtg-hunter.appspot.com",
	    	messagingSenderId: "699608148386"
	    };
	    firebase.initializeApp(config);

	    // Initialize the FirebaseUI Widget using Firebase.
	    var ui = new firebaseui.auth.AuthUI(firebase.auth());

	    var uiConfig = {
	      	'signInSuccessUrl': '/',
	      	'signInOptions': [
	        // Leave the lines as is for the providers you want to offer your users.
		        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
		        firebase.auth.FacebookAuthProvider.PROVIDER_ID,
		        firebase.auth.TwitterAuthProvider.PROVIDER_ID,
		        firebase.auth.GithubAuthProvider.PROVIDER_ID,
		        firebase.auth.EmailAuthProvider.PROVIDER_ID
		    ],
		    'signInFlow': 'popup'
	    };*/
	    /*ui.start('#firebaseui-auth-container', uiConfig);

	    firebase.auth().onAuthStateChanged(function(user) {
	        if (user) {
	            // User is signed in.
	            var displayName = user.displayName;
	            var email = user.email;
	            var emailVerified = user.emailVerified;
	            var photoURL = user.photoURL;
	            var uid = user.uid;
	            var providerData = user.providerData;
	            user.getToken().then(function(accessToken) {
	        	    document.getElementById('sign-in-status').textContent = 'Signed in';
	            	document.getElementById('sign-in').textContent = 'Sign out';
	              	document.getElementById('account-details').textContent = JSON.stringify({
		                displayName: displayName,
		                email: email,
		                emailVerified: emailVerified,
		                photoURL: photoURL,
		                uid: uid,
		                accessToken: accessToken,
		                providerData: providerData
	              	}, null, '  ');
	            });
	        } else {
	            // User is signed out.
	            document.getElementById('sign-in-status').textContent = 'Signed out';
	            document.getElementById('sign-in').textContent = 'Sign in';
	            document.getElementById('account-details').textContent = 'null';
	        }
	    }, function(error) {
	        console.log(error);
	    });*/

	    return (

      <SearchkitProvider searchkit={this.searchkit}>
      	<div>
              
	    	<Navbar collapseOnSelect={true}>
		    <Navbar.Header>
		      <Navbar.Brand>
		        <a href="#">MtG-Hunter</a>
		      </Navbar.Brand>
		      <Navbar.Toggle />
		    </Navbar.Header>
		    <Navbar.Collapse>
		      <Nav>
		      <li style={{"padding":"13px"}}>
		    <SearchBox
                translations={{"searchbox.placeholder": "Search card names. Use AND, OR and NOT e.g. (fire OR ice) AND a* NOT \"sword of\""}}
                queryOptions={{"minimum_should_match": 100}}
                prefixQueryFields={["name"]}
                autofocus={true}
                searchOnChange={true}
                searchThrottleTime={1000}
                queryFields={["name"]}
              /></li>
		        <NavItem eventKey={1} href="#">Link</NavItem>
		        <NavItem eventKey={2} href="#">Link</NavItem>
		      </Nav>
		      <Nav pullRight>
		        <NavDropdown eventKey={3} title="Dropdown" id="basic-nav-dropdown">
		          <MenuItem eventKey={3.1}>Action</MenuItem>
		          <MenuItem eventKey={3.2}>Another action</MenuItem>
		          <MenuItem eventKey={3.3}>Something else here</MenuItem>
		          <MenuItem divider />
		          <MenuItem eventKey={3.3}>Separated link</MenuItem>
		        </NavDropdown>
		      </Nav>
		    </Navbar.Collapse>
		  </Navbar>


      <Grid>
	    <Row className="show-grid">
	      <Col md={3} xsHidden smHidden style={{}}><p><b>Hello filter container column!</b></p></Col>
	      <Col md={9}><div className="sk-layout__body">
				<div className="sk-layout__result sk-results-list">
	              <div className="sk-results-list__action-bar sk-action-bar">
	                <div className="sk-action-bar-row">
	                  <HitsStats />
	                  <ViewSwitcherToggle/>
	                  <SortingSelector options={[
	                    {label:"Name (ascending)", field: "name.raw", order: "asc", defaultOption:true},
	                    {label:"Name (descending)", field: "name.raw", order: "desc"},
	                    {label:"Relevance (ascending)", field:"_score", order:"asc"},
	                    {label:"Relevance (descending)", field:"_score", order:"desc"},
	                    {label:"Colour (ascending)", field:"colors", order:"asc"},
	                    {label:"Colour (descending)", field:"colors", order:"desc"},
	                    {label:"CMC (ascending)", field:"cmc", order:"asc"},
	                    {label:"CMC (descending)", field:"cmc", order:"desc"},
	                    {label:"Card number (ascending)", field:"multiverseids.number", order:"asc"},
	                    {label:"Card number (descending)", field:"multiverseids.number", order:"desc"},
	                    {label:"Paper price (ascending)", field:"multiverseids.medPrice", order:"asc"},
	                    {label:"Paper price (descending)", field:"multiverseids.medPrice", order:"desc"},
	                    {label:"MTGO price (ascending)",  field:"multiverseids.mtgoPrice", order:"asc"},
	                    {label:"MTGO price (descending)",  field:"multiverseids.mtgoPrice", order:"desc"},
	                    {label:"Word count (ascending)",  field:"reminderlessWordCount", order:"asc"},
	                    {label:"Word count (descending)",  field:"reminderlessWordCount", order:"desc"},
	                    {label:"Release date (ascending)",  field:"releaseDate", order:"asc"},
	                    {label:"Release date (descending)",  field:"releaseDate", order:"desc"},
	                    {label:"# of printings (ascending)",  field:"printingCount", order:"asc"},
	                    {label:"# of printings (descending)",  field:"printingCount", order:"desc"}
	                  ]} />
	                  <PageSizeSelector options={[12,24, 48, 96]} listComponent={Toggle}/>
	                </div>

	                <div className="sk-action-bar__filters">
	                  <GroupedSelectedFilters groupComponent={FilterGroupImg} />
	                  <ResetFilters/>
	                </div>

	              </div>
	                <NewViewSwitcher
	                    hitsPerPage={12}
	                    hitComponents = {[
	                      {key:"table", title:"Table", listComponent:this.CardHitsTable}
	                    ]}
	                    scrollTo="body"
	                />
	              <NoHits suggestionsField={"name"}/>
	              <InitialLoader component={InitialLoaderComponent}/>
	              <Pagination showNumbers={true}/>
	            </div>
	          </div></Col>
	    </Row>
	  </Grid>

          </div>
		  </SearchkitProvider>
	    );
	}
}

ReactDOM.render(<App />, document.getElementById('app'));