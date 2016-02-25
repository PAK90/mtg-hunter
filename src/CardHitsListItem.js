import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import "searchkit/theming/theme.scss";
import "./styles/customisations.scss";
var ent = require('ent');
const nl2br = require('react-nl2br');

var CardHitsListItem = React.createClass({
	getInitialState: function() {  	
	    var {bemBlocks, result} = this.props;
	    var source = result._source;
	    // At some point, have all multiverse-specific stuff (id, flavour text, original text) as states.
	    // Then, when you click the symbol, all we have to do is load that multi's data into the states which are already in the renderer.
        return {
            currentMultiId: result._source.multiverseids[result._source.multiverseids.length - 1].multiverseid,
            clickedCard: ''
        };
    },

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
	},

	handleSetIconClick(multi) {
		// Set the new multiId. Eventually this will work for flavour and original text too.
		this.setState({currentMultiId: multi.multiverseid});
	},

    getSetIcons: function(source) {
    	// Loop through all multiverseIds, which have their own set code and rarity.
    	var setImages = source.multiverseids.map(function(multis, i) {
      		let rarity = multis.rarity.charAt(0) == "B" ? "C" : multis.rarity.charAt(0); // Replace 'basic' rarity with common.
      		let url = "http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=" + multis.multiverseid;
      		return (
            	<img className={(this.state.currentMultiId == multis.multiverseid ? "clicked " : "") + "setIcon"} src={'./src/img/sets/' + multis.setName.replace(/\s+/g,'').replace(":","").replace('"','').replace('"','').toLowerCase() + '-' + rarity + '.jpg'} 
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
		    source = source.replace(/(\/)(?=\w\})/g,'');
		    // Then generate the tags through setting the innerHtml. This is the only way to preserve the text around the img tags.
		    // Encode the source in html, to prevent XSS nastiness. Then replace the newlines with <br/>. Then insert the <img> tags.
		    tagged = <div dangerouslySetInnerHTML={{__html: ent.encode(source).replace(/&#10;/g, '<br/>').replace(/\{([0-z,½,∞]+)\}/g, (fullMatch, firstMatch) =>
		        `<img src=./src/img/${firstMatch.toLowerCase()}.png height=12px/>`
		    )}}></div>
		}
		return tagged;
	},

	render: function() {
	    var {bemBlocks, result} = this.props;
	    var source = result._source;
	    // Set the multiverseId state to the latest card.
	    // Add onHover for the image to enlarge with Velocity.
	    let url = "http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=" + this.state.currentMultiId;
	    let imgUrl = 'https://image.deckbrew.com/mtg/multiverseid/' + this.state.currentMultiId + '.jpg';
	    // Generate the mana symbols in both cost and the card text.	    
	    source.tagCost = this.generateTitleCostSymbols(source.manaCost);
	    source.taggedText = this.generateTextCostSymbols(source.text);
	    // In the style for the set icons, 'relative' enables cards like Forest to grow the div around them to fit all the symbols.
	/*
	            onMouseOver={this.handleHoverIn.bind(this, source)}
	            onMouseOut={this.handleHoverOut.bind(this, source)}*/
	    // In the future, might want an 'open/close' <p> tag for that, since it's pretty useless seeing all those symbols anyway.
	    // The <p> tag helps to align the symbols in the centre, and probably other important css-y stuff.
	    return (
	    	<div className={bemBlocks.item().mix(bemBlocks.container("item"))} data-qa="hit">
	        	<div className='listImg'>
	          		<img className={(this.state.clickedCard == source.name ? "clicked " : "") + "listImg"}
	            		src={imgUrl} 
	            		style={{borderRadius: this.state.hoveredId == source.id ? "10" : "3"}} 
	            		width="100"
	            		onClick={this.handleClick.bind(this, source)} />
	        	</div>
	        	<div className={bemBlocks.item("details")}>
	         		<h2 className={bemBlocks.item("title")}>{source.name} {source.tagCost} ({source.cmc ? source.cmc : 0})</h2>
			        <h3 className={bemBlocks.item("subtitle")}><b>{source.type}</b></h3>
			        <h3 className={bemBlocks.item("subtitle")}>{source.taggedText}</h3>
	        	</div>
	        	<div style={{width: '150px', position: 'relative', right:'10px'}}>
	          		<p style={{textAlign:'center'}}>{this.getSetIcons(source)}</p>
	        	</div>
	      	</div>
	    )
	}
});

export default CardHitsListItem;