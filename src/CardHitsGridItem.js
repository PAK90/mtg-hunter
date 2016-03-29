import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import "searchkit/theming/theme.scss";
import "./styles/customisations.scss";
import {TagFilter, TagFilterConfig, TagFilterList} from 'searchkit';
var ent = require('ent');
const nl2br = require('react-nl2br');
var ReactTabs = require('react-tabs');
var Tab = ReactTabs.Tab;
var Tabs = ReactTabs.Tabs;
var TabList = ReactTabs.TabList;
var TabPanel = ReactTabs.TabPanel;

var CardHitsGridItem = React.createClass({
	getInitialState: function() {  	
	    var {bemBlocks, result} = this.props;
	    var source = result._source;
	    // At some point, have all multiverse-specific stuff (id, flavour text, original text) as states.
	    // Then, when you click the symbol, all we have to do is load that multi's data into the states which are already in the renderer.
        return {
            clickedCard: '',
            currentMultiId: source.multiverseids[result._source.multiverseids.length - 1].multiverseid,
            currentImageMultiId: source.multiverseids[result._source.multiverseids.length - 1].multiverseid,
            currentArtist: source.multiverseids[result._source.multiverseids.length - 1].artist,
            currentFlavor: source.multiverseids[result._source.multiverseids.length - 1].flavor,
            currentOriginalText: source.multiverseids[result._source.multiverseids.length - 1].originalText,
            currentSetName: source.multiverseids[result._source.multiverseids.length - 1].setName,
            currentNumber: source.multiverseids[result._source.multiverseids.length - 1].number,
            currentSelectedTab: 0,
            currentImageLayout: '',
        };
    },

    handleClick(source) {
	    // If clicked on a different card, change the name.
	    if (this.state.clickedCard != source.name)
	    {
	      this.setState({clickedCard: source.name});
	    }
	    // Else, we clicked on the same card, so shrink.
	    // The enlarging/shrinking happens via a css style which turns on/off based on whether clickedCard matches current card name.
	    else {
	      this.setState({clickedCard: ''});
	    }
	},

	handleSetIconClick(multi) {
		// Set the new multiId. Eventually this will work for flavour and original text too.
		this.setState({currentMultiId: multi.multiverseid,
			currentImageMultiId: multi.multiverseid,
			currentArtist: multi.artist,
			currentFlavor: multi.flavor,
			currentOriginalText: multi.originalText,
			currentSetName: multi.setName,
			currentNumber: multi.number});
	},

	onLayoutHover(source) {
		this.setState({currentImageLayout: source.layout});
		if (source.layout == 'double-faced') {
			//var targetName = source.name == source.names[0] ? source.names[1] : source.names[0];
			this.setState({currentImageMultiId: source.flipSideMultiId});
		}
	},

	onLayoutHoverOut() {
		this.setState({currentImageLayout: '', currentImageMultiId: this.state.currentMultiId});
	},

    getSetIcons: function(source) {
    	// Loop through all multiverseIds, which have their own set code and rarity.
    	var setImages = source.multiverseids.map(function(multis, i) {
      		let rarity = multis.rarity.charAt(0) == "B" ? "C" : multis.rarity.charAt(0); // Replace 'basic' rarity with common.
      		let url = "http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=" + multis.multiverseid;
      		return (
            	<img className={(this.state.currentMultiId == multis.multiverseid ? "clicked " : "") + "setIcon " + rarity } src={'./src/img/sets/' + multis.setName.replace(/\s+/g,'').replace(":","").replace('"','').replace('"','').toLowerCase() + '-' + rarity + '.jpg'} 
	                title={multis.setName}
	                onClick={this.handleSetIconClick.bind(this, multis)}/>
	            )
	    	}.bind(this))
    	return setImages;
  	},

  	generateTitleCostSymbols: function(source) {
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
	},

	generateTextCostSymbols: function(source) {
		var tagged;
		if (source !== undefined) {
		    // Get rid of / in any costs first, but only if inside {} brackets (so as not to affect +1/+1).
		    //source = this.generateCardHoverSpan(source);
		    source = source.replace(/(\/)(?=\w\})/g,'');
		    // Then generate the tags through setting the innerHtml. This is the only way to preserve the text around the img tags.
		    // Encode the source in html, to prevent XSS nastiness. Then replace the newlines with <br/>. Then insert the <img> tags.
		    tagged = <div dangerouslySetInnerHTML={{__html: ent.encode(source).replace(/&#10;/g, '<br/>').replace(/\{([0-z,½,∞]+)\}/g, (fullMatch, firstMatch) =>
		        `<img src=./src/img/${firstMatch.toLowerCase()}.png height=12px/>`
		    )}}></div>
		}
		return tagged;
	},

	generateCardHoverSpan: function(source) {
		var tagged;
		if (source !== undefined) {
		    // Then generate the tags through setting the innerHtml. This is the only way to preserve the text around the img tags.
		    // Encode the source in html, to prevent XSS nastiness. Then replace the newlines with <br/>. Then insert the <img> tags.
		    tagged = <div dangerouslySetInnerHTML={{__html: ent.encode(source).replace(/&#10;/g, '<br/>').replace(/\[(.*?)\]/g, (fullMatch, firstMatch) =>
		        `<span onMouseOver={this.onCardNameHover(${firstMatch})}><b>${firstMatch}</b></span>`
		    )}}></div>
		}
		return tagged;
	},

	render: function() {
	    var {bemBlocks, result} = this.props;
	    var source = result._source;
	    let url = "http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=" + result._source.multiverseids[result._source.multiverseids.length - 1].multiverseid;
	    //let imgUrl = 'https://image.deckbrew.com/mtg/multiverseid/' + result._source.multiverseids[result._source.multiverseids.length - 1].multiverseid + '.jpg';
	    let imgUrl = '../cropped2/crops' + this.state.currentImageMultiId + '.jpg';

	    source.tagCost = this.generateTitleCostSymbols(source.manaCost);
	    source.taggedText = this.generateTextCostSymbols(source.text);

	    var otherSide, pt;
	    if (source.layout == "flip" || source.layout == "double-faced" || source.layout == "split") {
    		otherSide = (
    			<span onMouseOver={this.onLayoutHover.bind(this, source)}
    				onMouseOut={this.onLayoutHoverOut}
    				className={bemBlocks.item("subtitle")}><b>{source.name == source.names[0] ? source.names[1] : source.names[0]}</b></span>
    		)
    	}
    	else {
    		otherSide = <div/>
    	}
    	if (source.power) {
    		pt = ( <div className={bemBlocks.item("subtitle") + " tagFiltered"} style={{display:"inline-flex"}}>		
		        <span style={{color: "#666"}}><b>{'P/T:'}</b></span>
		        <span>&nbsp;</span>
		        <TagFilterConfig field="power.raw" id="powerField" title="Power" operator="AND" searchkit={this.searchkit} />
		        <TagFilter field="power.raw" value={source.power} />
		        <span>/</span>
		        <TagFilterConfig field="toughness.raw" id="toughnessField" title="Toughness" operator="AND" searchkit={this.searchkit} />
		        <TagFilter field="toughness.raw" value={source.toughness} />
		        <br/>
	        </div> )
    	}
    	else { pt = <div/>}

    	var itemWidth = document.body.clientWidth/4;

	    return (
	    	<div className={bemBlocks.item().mix(bemBlocks.container("item"))} style={{width: itemWidth}}>
	    		<div style={{display:'flex', width: itemWidth}}>
		    		<div className="imageAndSetColumn" style={{width: 223*0.8}}>
				      	<div >
				          	<img className='gridImg'
				            	src={imgUrl} 
				            	onClick={this.handleClick.bind(this, source)}/>
				      	</div>
				      	<div style={{width: 223*0.8, display:'inline-block'}}>
			          		<p style={{textAlign:'center'}}>{this.getSetIcons(source)}</p>
			        	</div>
			        	<div style={{textAlign: 'center', marginBottom: 3}}>
			        		<TagFilterConfig field="codeNames.raw" id="codeNames" title="Set name" operator="AND" searchkit={this.searchkit} />
			        		<TagFilter field="codeNames.raw" value={this.state.currentSetName} />
			        	</div>
				    </div>
				    <div className="titleAndTextColumn">
				    	<a href={'http://shop.tcgplayer.com/magic/' + this.state.currentSetName.replace(/[^\w\s]/gi, '') + '/' + source.name} target="_blank">
		         			<h2 className={bemBlocks.item("title")}>{source.name} {source.tagCost} ({source.cmc ? source.cmc : 0}) {otherSide}</h2>
		         		</a>
		         		{/* The type line is special since it's made of TagFilters. */}
				        <div style={{display:"inline"}} className={bemBlocks.item("subtitle") + " typeLine"}>
				        	<TagFilterConfig field="supertypes.raw" id="supertypeField" title="Supertype" operator="AND" searchkit={this.searchkit} />
				        	{_.map(source.supertypes,supertype => 
				        		<div style={{display:"inline-flex"}}>
				        			<TagFilter field="supertypes.raw" value={supertype} /><span>&nbsp;</span>
				        		</div>)}
				        	<TagFilterConfig field="types.raw" id="typeField" title="Type" operator="AND" searchkit={this.searchkit} />
				        	{_.map(source.types,type => 
				        		<div style={{display:"inline-flex"}}>
				        			<TagFilter field="types.raw" value={type} /><span>&nbsp;</span>
				        		</div>)}
				        	{source.subtypes ? <span>—&nbsp;</span> : <span/>}
				        	<TagFilterConfig field="subtypes.raw" id="subtypeField" title="Subtype" operator="AND" searchkit={this.searchkit} />
				        	{_.map(source.subtypes,subtype => 
				        		<div style={{display:"inline-flex"}}>
				        			<TagFilter field="subtypes.raw" value={subtype} /><span>&nbsp;</span>
				        		</div>)}
				        </div>
				        <span className={bemBlocks.item("subtitle")}>{source.taggedText}{pt}</span>
				    </div>
			    </div>
			</div>
	    )
	}
});

export default CardHitsGridItem;