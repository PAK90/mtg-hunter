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
var Tabs = require("./Tabs");
var TabList = ReactTabs.TabList;
var TabPanel = ReactTabs.TabPanel;
var Rating = require('react-rating');
import ReactStars from './modReactStars.js';
var ReactDisqusThread = require('react-disqus-thread');
var Firebase = require('firebase');
/*var Disqus = require('disqus');

var disqus = new Disqus({
    api_secret : 'var',
    api_key : 'var',
    access_token : 'var'
});*/
//var cards = require('./multiIdName.json');
//var modCards = cards;
// Turn cards object keys into the format returned by the python script.
// Just go in and create a new key, and replace each object's key with the new key.
/*for (var key in modCards) {
    var keyLower = key.toLowerCase();
    var keyLowerDash = keyLower.replace("-", "~").replace("æ","ae").replace('û','u').replace('!','').replace('ú','u').replace('â','a').replace('ö','o').replace("-", "~").replace("-", "~").replace("-", "~").replace("á","a").replace("é","e");
    if (keyLowerDash !== key) {
        var temp = modCards[key];
        delete modCards[key];
        modCards[keyLowerDash] = temp;
    }
}*/

class PatchedTagFilter extends TagFilter {

  constructor(){
    super()
    this.handleClick = (evt) => {
      evt.stopPropagation()
      evt.preventDefault()
      super.handleClick()
    }
  }

  render() {
    const { value, children } = this.props

    var className = "sk-tag-filter"
    if (this.isActive()) className += " is-active"

    if (children){
      return (
        <span key={value} onClick={this.handleClick} className={className}>{this.props.children}</span>
      )
    } else {
      // No children, use the value instead
      return (
        <span key={value} onClick={this.handleClick} className={className}>{value}</span>
      )
    }
  }
}

var CardHitsListItem = React.createClass({
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
            currentLowPrice: source.multiverseids[result._source.multiverseids.length - 1].lowPrice,
            currentMedPrice: source.multiverseids[result._source.multiverseids.length - 1].medPrice,
            currentHiPrice: source.multiverseids[result._source.multiverseids.length - 1].hiPrice,
            currentFoilPrice: source.multiverseids[result._source.multiverseids.length - 1].foilPrice,
            currentStoreLink: source.multiverseids[result._source.multiverseids.length - 1].storeLink,
            currentMtgoPrice: source.multiverseids[result._source.multiverseids.length - 1].mtgoPrice,
            currentFoilMtgoPrice: source.multiverseids[result._source.multiverseids.length - 1].mtgoFoilPrice,
            currentMtgoStoreLink: source.multiverseids[result._source.multiverseids.length - 1].mtgoStoreLink,
            currentSelectedTab: 0,
            currentImageLayout: ''
        };
    },

    componentDidMount() {
    	if (typeof DISQUSWIDGETS !== 'undefined') {
    		DISQUSWIDGETS.getCount({reset:true});
    	}
	    // test: listeners on comment text to display images.
	    var commentDivs = document.getElementsByClassName('disqus-comment-count');
	    for (var comment = 0; comment < commentDivs.length; comment++) {
	    	if (commentDivs[comment].getAttribute('data-disqus-identifier') == this.state.currentMultiId) {
	    		this.setState({commentCount:commentDivs[comment].innerHTML[0]})
	    	}
	    }
    },

    componentDidUpdate() {
    	if (typeof DISQUSWIDGETS !== 'undefined') {
    		DISQUSWIDGETS.getCount({reset:true});
    	}
    	
    },

    // Deprecated in favour of universal click handler in the parent.
    /*handleClick(source) {
	    // If clicked on a different card, change the name.
	    if (this.state.clickedCard != source.name)
	    {
	    	ga('send','event','List details','open'); // Record this momentous occasion.
	      	this.setState({clickedCard: source.name});
	    }
	    // Else, we clicked on the same card, so shrink.
	    // The enlarging/shrinking happens via a css style which turns on/off based on whether clickedCard matches current card name.
	    else {
	      	this.setState({clickedCard: ''});
	    }
	},*/
	
	handleTabSelect(index, last) {
		// Record which tab was clicked.
		switch(index) {
			case 0:
				ga('send','event','Tabs','details', this.props.currentCard);
				break;
			case 1:
				ga('send','event','Tabs','rulings', this.props.currentCard);
				break;
			case 2:
				ga('send','event','Tabs','languages', this.props.currentCard);
				break;
			case 3:
				ga('send','event','Tabs','10closest', this.props.currentCard);
				break;
			case 4:
				ga('send','event','Tabs','comments', this.props.currentCard);
				break;
		}
		this.setState({currentSelectedTab: index});
	},

	handleSetIconClick(evt, multi) {
		// Set the new multiId. Eventually this will work for flavour and original text too.
		evt.stopPropagation();
		this.setState({currentMultiId: multi.multiverseid,
			currentImageMultiId: multi.multiverseid,
			currentArtist: multi.artist,
			currentFlavor: multi.flavor,
			currentOriginalText: multi.originalText,
			currentSetName: multi.setName,
			currentNumber: multi.number,
			currentLowPrice: multi.lowPrice,
            currentMedPrice: multi.medPrice,
            currentHiPrice: multi.hiPrice,
            currentFoilPrice: multi.foilPrice,
            currentStoreLink: multi.storeLink,
            currentMtgoPrice: multi.mtgoPrice,
			currentFoilMtgoPrice: multi.mtgoFoilPrice,
			currentMtgoStoreLink: multi.mtgoStoreLink
        });
	},

	onCardNameHover(card) {
		console.log("hovered card is " + card);
		//this.setState({currentImageMultiId: language.multiverseid});
	},

	onLanguageHover(language) {
		this.setState({currentImageMultiId: language.multiverseid});
	},

	onLanguageHoverOut(language) {
		this.setState({currentImageMultiId: this.state.currentMultiId});
	},

	onLayoutHover(source, tag) {
		this.setState({currentImageLayout: source.layout});
		if (source.layout == 'double-faced' || (source.layout == 'meld' && source.number.indexOf("a") != -1)) {
			//var targetName = source.name == source.names[0] ? source.names[1] : source.names[0];
			this.setState({currentImageMultiId: source.flipSideMultiId});
		}
		else if (source.layout == 'meld' && source.number.indexOf("b") != -1) {
			this.setState({currentImageMultiId: source.flipSideMultiId[tag]});	
		}
	},

	onLayoutHoverOut() {
		this.setState({currentImageLayout: '', currentImageMultiId: this.state.currentMultiId});
	},

    getSetIcons: function(source) {
    	// Loop through all multiverseIds, which have their own set code and rarity.
    	var setIcons = source.multiverseids.map(function(multis, i) {
      		let rarity = multis.rarity.charAt(0) == "B" ? "C" : multis.rarity.charAt(0); // Replace 'basic' rarity with common.
      		/*let rarity = multis.rarity.toLowerCase();
      		if (rarity == "basic") {
      			rarity = "common";
      		}
      		else if (rarity == "special") {
      			rarity = "rare";
      		}*/
      		return (
            	<img key={i} className={(this.state.currentMultiId == multis.multiverseid ? "clicked " : "") + "setIcon " + rarity } src={'./src/img/sets/' + multis.setName.replace(/\s+/g,'').replace(":","").replace('"','').replace('"','').toLowerCase() + '-' + rarity + '.jpg'} 
	                title={multis.setName}
	                onClick={(evt) => this.handleSetIconClick(evt, multis)}/>
	            )
				          		
	    	}.bind(this))
	    	/*return (
	    		<span className={"ss setIcon ss-"+multis.setCode.toLowerCase()+" ss-"+rarity+" ss-2x ss-grad"} 
	    			title={multis.setName}
	                onClick={(evt) => this.handleSetIconClick(evt, multis)}/>
	                <i className="ss ss-pFNM ss-2x ss-mythic ss-grad"/>
	    		)
	    }.bind(this));*/
    	return setIcons;
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

	suppressClick: function(evt) {
		evt.stopPropagation();
	},

	handleNewComment: function(comment) {
		//var newComment = comment.text.replace(/\[(.*?)\]/g, '<a href="http://mtg-hunter.com/?q=$1" target="_blank">$1</a>');
		//console.log(newComment);
		//disqus.request('posts/update', {post: comment.id, message: newComment}, function(data) {
		//	if (data.error) {
		//		console.log(error)
		//	}
		ga('send','event','Comments','post', this.props.currentCard);
		//})
	},

	addCardTags: function(comment) {
		var re = new RegExp(/\[\[(.*?)\|(.*?)\]\]/g); // the two question marks make both matches lazy, ensuring it doesn't match between ALL [[ ]].
		var matches = re.exec(comment);
		// matches[1] is the card name, matches[2] is the mID.

		/*return comment.replace(re, function(m1, m2, m3) {
			return (<b>{m2}</b>)
		});*/
		//return comment;
		return <div dangerouslySetInnerHTML={{__html: ent.encode(comment).replace(/&#10;/g, '<br/>').replace(re, (fullMatch, m1, m2) =>
			`<a class="tooltipLink2" href="http://mtg-hunter.com/?q=${m1}"><span>${m1}</span>
	        <img src='https://image.deckbrew.com/mtg/multiverseid/${m2}.jpg' /></a>`
	    )}}></div>
	},

	checkForExistingVotes: function(mid) {
    	if (!this.props.existingRatings) return true; // the case of the fresh user.
    	else {
    		for (var votes of this.props.existingRatings.votedCards) {
    			if (_.includes(votes, mid)) {
    				alert("You have already voted on this card; you cannot vote again.");
    				return false;
    			}
    		}
    		// If it makes it out of the loop, all good.
    		return true;
    	}
    },
    checkForLogin: function(evt) {
    	this.suppressClick(evt);
    	if (!this.props.loggedIn) {
    		alert("Please log in before voting.");
    	}
    },

    getMidIndex: function(source, mid) {
    	var value;
    	source.multiverseids.map(function(multiID, i) {
    		if (multiID.multiverseid == mid) value = i;
    	}.bind(this));
    	return value;
    },

	render: function() {
	    var {bemBlocks, result} = this.props;
	    var source = result._source;
	    let url = "http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=" + this.state.currentMultiId;
	    let imgUrl = 'https://image.deckbrew.com/mtg/multiverseid/' + this.state.currentImageMultiId + '.jpg';
	    /*if (this.state.currentImageMultiId.indexOf('_') != -1) { // UNCOMMENT FOR PROMO SUPPORT.
	    	imgUrl = './src/img/promo/'+this.state.currentImageMultiId+'.jpg';
	    }*/
	    // Generate the mana symbols in both cost and the card text.	    
	    source.tagCost = this.generateTitleCostSymbols(source.manaCost);
	    source.taggedText = this.generateTextCostSymbols(source.text);

	    // Listener for the tooltip position calculator.
	    document.addEventListener('mousemove', function(e) {
	    	var tooltipImages = document.querySelectorAll('.tooltipImage');
	    	for (var i=tooltipImages.length; i--;) {
		        tooltipImages[i].style.left = e.clientX - 150 + 'px';
		        tooltipImages[i].style.top = e.clientY - 331 + 'px';
		        //console.log(tooltipImages[i].style.left + ' ' + tooltipImages[i].style.top);
		    }
	    },false);

	    // Define 'details' tab information here.
	    var extraInfo, flavour, pt, legalities, otherSide, price, foilPrice, mtgoPrice, mtgoFoilPrice, cycleInfo, allCycles, oldComments;

	    // Start with a separate div for all 4 potential prices.
	    if (this.state.currentMedPrice) {
	    	price = ( <a href={this.state.currentStoreLink} target="_blank" onClick={(evt) => {this.suppressClick(evt); ga('send','event','Store','medPrice', source.name);}}>
	    		<div className="priceContainer">
    				<span className={bemBlocks.item("subtitle") + " price"}>{'$'+this.state.currentMedPrice.toFixed(2)}</span>
    				<br/>
    				<span className={bemBlocks.item("subtitle") + " price priceDescriptor"} style={{fontSize: "inherit"}}><b>{'Paper'}</b></span>
    			</div>
    		</a> )
	    }
	    else { price = <div/>}
	    if (this.state.currentFoilPrice) {
	    	foilPrice = ( <a href={this.state.currentStoreLink} target="_blank" onClick={(evt) => {this.suppressClick(evt); ga('send','event','Store','foilPrice', source.name);}}>
    			<div className="priceContainer">
					<span className={bemBlocks.item("subtitle") + " price"}>{'$'+this.state.currentFoilPrice.toFixed(2)}</span>
					<br/>
					<span className={bemBlocks.item("subtitle") + " price priceDescriptor"} style={{fontSize: "inherit"}}><b>{'Foil'}</b></span>
				</div>
			</a> )
	    }
	    else { foilPrice = <div/>}
	    if (this.state.currentMtgoPrice) {
	    	mtgoPrice = ( <a href={this.state.currentMtgoStoreLink} target="_blank" onClick={(evt) => {this.suppressClick(evt); ga('send','event','Store','mtgoPrice', source.name);}}>
    			<div className="priceContainer">
    				<span className={bemBlocks.item("subtitle") + " price"}>{this.state.currentMtgoPrice.toFixed(2)}</span><span> TIX</span>
    				<br/>
    				<span className={bemBlocks.item("subtitle") + " price priceDescriptor"} style={{fontSize: "inherit"}}><b>{'MTGO'}</b></span>
    			</div>
    		</a>)
	    }
	    else { mtgoPrice = <div/> }
	    if (this.state.currentFoilMtgoPrice) {	
	    	mtgoFoilPrice = ( <a href={this.state.currentMtgoStoreLink.replace(/\d+/, function(mtgoId) { // Increment the url id by 1 to get foil url.
    				return Number(mtgoId) + 1;
    			})} target="_blank" onClick={(evt) => {this.suppressClick(evt); ga('send','event','Store','mtgoFoilPrice', source.name);}}>
    				<div className="priceContainer">
    				<span className={bemBlocks.item("subtitle") + " price"}>{this.state.currentFoilMtgoPrice.toFixed(2)}</span><span> TIX</span>
    				<br/>
    				<span className={bemBlocks.item("subtitle") + " price priceDescriptor"} style={{fontSize: "inherit"}}><b>{'MTGO Foil'}</b></span>
    			</div>
    		</a> )
	    }
	    else { mtgoFoilPrice = <div/> }

    	if (source.power) {
    		pt = ( <div className={bemBlocks.item("subtitle") + " tagFiltered"} style={{display:"inline-flex"}}>		
		        <span style={{color: "#ddd"}}><b>{'P/T:'}</b></span>
		        <span>&nbsp;</span>
		        <TagFilterConfig field="power.raw" id="powerField" title="Power" operator="AND" searchkit={this.searchkit} onClick={(evt) => this.suppressClick(evt)}/>
		        <PatchedTagFilter field="power.raw" value={source.power}/>
		        <span>/</span>
		        <TagFilterConfig field="toughness.raw" id="toughnessField" title="Toughness" operator="AND" searchkit={this.searchkit} onClick={(evt) => this.suppressClick(evt)}/>
		        <PatchedTagFilter field="toughness.raw" value={source.toughness}/>
		        <br/>
	        </div> )
    	}
    	else { pt = <div/>}
    	if (this.state.currentFlavor) {
    		flavour = ( <div>		
		        <span className={bemBlocks.item("subtitle")}><b>{'Flavour: '}</b></span><span className={bemBlocks.item("subtitle")}>{nl2br(this.state.currentFlavor)}</span>
		        <br/>
	        </div> )
    	}
    	else { flavour = <div/> }
    	extraInfo = (
    		<div>	
		        <span className={bemBlocks.item("subtitle")}><b>{'Set: '}</b></span>
		        <div className={bemBlocks.item("subtitle")} style={{display:"inline-flex"}} onClick={(evt) => this.suppressClick(evt)}>
			        <TagFilterConfig field="multiverseids.setName.raw" id="codeNames" title="Set name" operator="AND" searchkit={this.searchkit}/>
			        <PatchedTagFilter field="multiverseids.setName.raw" value={this.state.currentSetName} />
		        </div>
		        <span className={bemBlocks.item("subtitle")}>{(this.state.currentNumber ? ' (#' + this.state.currentNumber + ')' : '')}</span>
		        <br/>
		        <span className={bemBlocks.item("subtitle")}><b>{'Artist: '}</b></span>
		        <div className={bemBlocks.item("subtitle")} style={{display:"inline-flex"}} onClick={(evt) => this.suppressClick(evt)}>
			        <TagFilterConfig field="multiverseids.artist.raw" id="artistNames" title="Artist name" operator="AND" searchkit={this.searchkit}/>
			        <PatchedTagFilter field="multiverseids.artist.raw" value={this.state.currentArtist} />
		        </div>
		        <br/>
	        </div>
    	)
    	if (source.legalities) {
	    	legalities = (<div>
		        <span className={bemBlocks.item("subtitle")}><b>{'Legalities: '}</b></span>
		        { source.legalities.map(function(legality, i) {
		        	return (<div key={i} onClick={(evt) => this.suppressClick(evt)}>
				        	<div className={bemBlocks.item("subtitle")} style={{display:"inline-flex"}}>
					        <TagFilterConfig field="formats.raw" id="artistNames" title="Format name" operator="AND" searchkit={this.searchkit}/>
					        <PatchedTagFilter field="formats.raw" value={legality.format} />
				        </div>
		        		<span className={legality.legality == "Banned" ? bemBlocks.item("subtitle") + ' banned' : bemBlocks.item("subtitle") + ' legal'}>{': '+legality.legality}</span><br/>
		        	</div>)
		        }.bind(this))}
		        </div>
	    	)
	    }
    	else { legalities = <div/> }
    	if (source.layout == "flip" || source.layout == "double-faced" || source.layout == "split" || (source.layout == "meld" && source.number.indexOf("a") != -1)) {
    		var otherSideName = source.name == source.names[0] ? source.names[1] : source.names[0];
    		// Override if it's a melded card.
    		if (source.layout == "meld") {
    			otherSideName = source.names[2];
    		}
    		otherSide = (
    			<span onMouseOver={this.onLayoutHover.bind(this, source)}
    				onMouseOut={this.onLayoutHoverOut}
    				className={bemBlocks.item("subtitle")}><b><a href={"http://mtg-hunter.com/?q="+otherSideName} 
    															target="_blank" onClick={(evt) => this.suppressClick(evt)}>{otherSideName}</a></b>
    			</span>
    		)
    	}
    	else if ( source.layout == 'meld' && source.number.indexOf("b") != -1 ) { // If it's the resulting meld card, need to list both components.
    		var otherSideName1 = source.names[0];
    		var otherSideName2 = source.names[1];
    		otherSide = (<div>
    			<span onMouseOver={this.onLayoutHover.bind(this, source, 0)}
    				onMouseOut={this.onLayoutHoverOut}
    				className={bemBlocks.item("subtitle")}><b><a href={"http://mtg-hunter.com/?q="+otherSideName1} 
    															target="_blank" onClick={(evt) => this.suppressClick(evt)}>{otherSideName1}</a></b>
    			</span>
    			<span className={bemBlocks.item("subtitle")}> melded with </span>
    			<span onMouseOver={this.onLayoutHover.bind(this, source, 1)}
    				onMouseOut={this.onLayoutHoverOut}
    				className={bemBlocks.item("subtitle")}><b><a href={"http://mtg-hunter.com/?q="+otherSideName2} 
    															target="_blank" onClick={(evt) => this.suppressClick(evt)}>{otherSideName2}</a></b>
    			</span></div>
    		)
    	}
    	else {
    		otherSide = <span/>
    	}

    	// Define rulings here.
    	var rulings;
    	if (source.rulings) {
    		rulings = (<div>
    			{ source.rulings.map(function(ruling, i) {
    				return <div key={i}><span className={bemBlocks.item("subtitle")}><b>{ruling.date + ": "}</b></span>
    							<span className={bemBlocks.item("subtitle")}>{this.generateTextCostSymbols(ruling.text)}</span></div>
    			}.bind(this))}
    			</div>
    		)
    	}
    	else {
    		rulings = <div><span className={bemBlocks.item("subtitle")}>No rulings!</span></div>;
    	}

    	// Define languages here.
    	var whichMultiIndex = source.multiverseids.length - 1;
    	for (var i = 0; i <= whichMultiIndex; i++) {
    		if (_.includes(source.multiverseids[i], this.state.currentMultiId)) {
    			whichMultiIndex = i;
    			break;
    		}
    	}
    	var languages;
    	if (source.multiverseids[whichMultiIndex].foreignNames) {
    		languages = (<div>
    			{ source.multiverseids[whichMultiIndex].foreignNames.map(function(language, i) {
    				return <div key={i}><span onMouseOver={this.onLanguageHover.bind(this, language)} className={bemBlocks.item("subtitle")}><b>{language.language + ": "}</b></span>
    							<span onMouseOver={this.onLanguageHover.bind(this, language)} 
    							onMouseOut={this.onLanguageHoverOut.bind(this, language)} 
    							className={bemBlocks.item("subtitle")}>{language.name}</span></div>
    			}.bind(this))}
    			</div>
    		)
    	}
    	else {
    		languages = <div><span className={bemBlocks.item("subtitle")}>No other languages!</span></div>;
    	}
    	if (source.cycles) {
    		allCycles = (<div> {source.cycles.map(function(cycle, k) {
		        <TagFilterConfig field="cycles.cycleName.raw" id="cycles" title="Cycles" operator="AND" searchkit={this.searchkit}/>
		        var pair = cycle.cycleCards.length == 1 ? true : false;
		        // If it's a pair, stick a 'true' in there for the scope to see.
		        if (pair) {cycle.pair = true;}
	    		cycleInfo = (<div><span className={bemBlocks.item("subtitle")}><b>{"Cycle: "}</b>{source.name + " is part of " + (pair ? "a " : "the \"")}<PatchedTagFilter field="cycles.cycleName.raw" value={cycle.cycleName} />{(pair ? "" : "\" cycle") + ", along with "}</span>
	    			{ cycle.cycleCards.map(function(cycleCard, i) {
	    				var j = i + 1;
	    				let imgUrl = 'https://image.deckbrew.com/mtg/multiverseid/'+cycleCard.multiId+'.jpg';
	    				if (cycle.cycleCards.length != j) {
	    					return <a className="tooltipLink" href={"http://mtg-hunter.com/?q="+cycleCard.name} target="_blank">
	    						<img className="tooltipImage" src={imgUrl} />
	    						<span key={i} id={cycleCard.multiId} className={bemBlocks.item("subtitle")}>{cycleCard.name + ", "}</span>
	    					</a>
	    				}
	    				else {
	    					return <a className="tooltipLink" href={"http://mtg-hunter.com/?q="+cycleCard.name} target="_blank">
	    						<img className="tooltipImage" src={imgUrl} />
	    						<span key={i} id={cycleCard.multiId} className={bemBlocks.item("subtitle")}>{(cycle.pair ? " " : " and ") + cycleCard.name + "."}</span>
	    					</a>
	    				}
	    			}.bind(this))}
	    		</div>)
	    		return cycleInfo;
    		}.bind(this))}</div>)
    	}
    	else {allCycles = <div/>}

    	if (source.comments) {
    		oldComments = (<div style={{'height':'500px','overflowY':'scroll','overflowX':'hidden'}}>
    			{source.comments.map(function(comment, i) {
    				return <div style={{'padding':'5px'}}><span className={bemBlocks.item("subtitle")}>{this.addCardTags(comment.comment)}<br/><b>{comment.name}</b> ({comment.date})<br/></span></div>
    			}.bind(this))}
    		</div>)
    	}
		else {oldComments = <div/>}    	

    	// Define comments!

    	// Define prices!

    	// Define 10 closest cards!
    	var closest10;
  		var elemInlineBlock = {
			display: 'inline-block',
			textAlign: 'left',
			padding: '3px'
		};
		var spanStyle = {
			position: 'relative',
			color: '#F8F8F8',
		    backgroundColor: '#000000',
		    borderColor: '#000000',
		    padding: '2px 2px 0px 2px',
		    borderTopRightRadius: '5px',
		    borderTopLeftRadius: '5px',
		    left: '12px'
		};
    	if (source.closestCards) {
    		closest10 = (<div>
    			{source.closestCards.map(function(card, i) {
    				return <div key={i} style={elemInlineBlock}>
    					<span style={spanStyle}>{Math.round(card.deviation * 10000)/10000}</span>
    					<img className="closestImg" src={'https://image.deckbrew.com/mtg/multiverseid/'+card.multiId+'.jpg'}/>
	                	</div>
    			})}
    			</div>
    		)
    	}
    	else {
    		closest10 = <div><span className={bemBlocks.item("subtitle")}>No closest cards!</span></div>;
    	}


		        /*<TabPanel>
		          <h2>Hello from expensive card!</h2>
		          <script type='text/javascript' src='http://www.intensedebate.com/js/genericCommentWrapperV2.js'></script>
		        </TabPanel>*/

    	// Define the tab stuff here.
    	var selectedInfo;
	    if (this.props.currentCard == source.name) {
        	selectedInfo = (<Tabs selectedIndex={this.state.currentSelectedTab} onSelect={this.handleTabSelect}>
        		<TabList onClick={(evt) => this.suppressClick(evt)}>
	        		<Tab>Details</Tab>
	            	<Tab>Rulings</Tab>
	            	<Tab>Languages</Tab>
	            	<Tab>10 closest cards</Tab>
	            	<Tab>Comments</Tab>
	            	<Tab>Gatherer comments</Tab>
	        	</TabList>
            	<TabPanel>
					<div className='extraDetails'>{flavour}{extraInfo}{legalities}{allCycles}</div> 
		        </TabPanel>
		        <TabPanel>
		          <div className='extraDetails'>{rulings}</div>
		        </TabPanel>
		        <TabPanel>
		          <div className='extraDetails'>{languages}</div> 
		        </TabPanel>
		        <TabPanel>
		          {closest10}
		        </TabPanel>
		        <TabPanel>
		        	<ReactDisqusThread
		        		key={source.multiverseids[result._source.multiverseids.length - 1].multiverseid}
 		                shortname="mtg-hunter"
 		                identifier={(source.multiverseids[result._source.multiverseids.length - 1].multiverseid).toString()}
 		                title={source.name}
 		                url={"http://mtg-hunter.com/?q="+source.name}
 		                category_id="4523863"/>
		        </TabPanel>
		        <TabPanel>
		          {oldComments}
		        </TabPanel>
        	</Tabs>)
	    }
	    else {
	    	selectedInfo = <span style={{paddingBottom: '5px', color:'#ccc', fontVariant:'small-caps', cursor:'pointer'}}>Details ▼</span>
	    }
	    // In the style for the set icons, 'relative' enables cards like Forest to grow the div around them to fit all the symbols.
	    // In the future, might want an 'open/close' <p> tag for that, since it's pretty useless seeing all those symbols anyway.
	    // The <p> tag helps to align the symbols in the centre, and probably other important css-y stuff.
	    // this.props.currentCard is '' when unclicked, which is apparently false-y enough to use for a bool.

						        /*<h3 className={bemBlocks.item("subtitle")}><b>{source.type}</b></h3>
						        
		            	<Rating start={0} stop={5} initialRate={4} />*/

		var commentCount = <span className="disqus-comment-count" onClick={function() {
				if (this.props.currentCard != source.name) {
					ga('send','event','Comments','viewComment', source.name);
				}
				this.setState({currentSelectedTab: 4});
			}.bind(this)
			} 
			data-disqus-identifier={(source.multiverseids[result._source.multiverseids.length - 1].multiverseid).toString()} 
			style={{fontVariant:"small-caps", float:"right", cursor:"pointer", paddingRight:8, fontSize:"smaller"}}>0 Comments</span>

		var currentMidIndex = this.getMidIndex(source, this.state.currentMultiId);

		var ratingSettings = {
		  size: 18,
		  value: source.multiverseids[currentMidIndex].rating,
		  edit: this.props.loggedIn, // If yes, edit! If not, no.
	      onChange: newValue => {
	      	if (this.checkForExistingVotes(this.state.currentMultiId)) {
	      		// Writes the rating to the user's data. If the user is new, pass an empty array as the existing votes.
	      		this.props.handleRatingWrite(this.state.currentMultiId, newValue, this.props.existingRatings ? this.props.existingRatings.votedCards : []); 
		        var cardRef = Firebase.database().ref('cards/'+source.name);
		        cardRef.once('value').then(function(snapshot) {
		          var data = snapshot.val()
		          console.log(data);
		          console.log('edition votes + rating: ' + data.multiverseids[currentMidIndex].rating + ' (' + data.multiverseids[currentMidIndex].votes + ')');
		          console.log('overall votes + rating: ' + data.rating + ' (' + data.votes + ')');
		          console.log('new vote: ' + newValue);
		          // write new votes. Since this is grid view, it always writes to the last mID.
		          var editionVotes = Firebase.database().ref('cards/'+source.name+'/multiverseids/'+(currentMidIndex)+'/votes');
		          editionVotes.transaction(function(votes) {
		            return votes + 1;
		          });

		          var editionRating = Firebase.database().ref('cards/'+source.name+'/multiverseids/'+(currentMidIndex)+'/rating');
		          editionRating.transaction(function(rating) {
		            // ((oldRating * oldVotes) + newRating)/newVotes. Treat old votes*rating as one solid block, add new rating to it, then divide again.
		            return ((data.multiverseids[currentMidIndex].rating * data.multiverseids[currentMidIndex].votes) + newValue)/(data.multiverseids[currentMidIndex].votes+1)
		          }.bind(this));

		          var totalVotes = Firebase.database().ref('cards/'+source.name+'/votes');
		          totalVotes.transaction(function(votes) {
		            return votes + 1;
		          });

		          var totalRating = Firebase.database().ref('cards/'+source.name+'/rating');
		          totalRating.transaction(function(rating) {
		            // ((oldRating * oldVotes) + newRating)/newVotes. Treat old votes*rating as one solid block, add new rating to it, then divide again.
		            return ((data.rating * data.votes) + newValue)/(data.votes+1)
		          }.bind(this));

		        }.bind(this));
		    }
	      }
		}
	    return (
	    	<div className={bemBlocks.item().mix(bemBlocks.container("item"))} style={{display: 'block'}} onClick={() => this.props.updateCardName(source)}>
	    		<div style={{display: 'flex'}}>
	    			{/* Block 1; the card image. */}
		    		<div className={"listImgDiv "} >
		          		<img className={(this.props.currentCard == source.name ? "clicked " : "") + "listImg "+ this.state.currentImageLayout }
		            		src={imgUrl} 
		            		style={{borderRadius: this.props.currentCard == source.name ? "10" : "6", cursor:"pointer"}} 
		            		width="100"
		            		/>
		            	<div style={{'margin':'0 auto', 'display':'table'}} onClick={this.checkForLogin}><ReactStars {...ratingSettings}/></div>
		            	<div style={{'textAlign':'center'}}className={bemBlocks.item("subtitle")}>{source.multiverseids[currentMidIndex].rating.toFixed(2)} ({source.multiverseids[currentMidIndex].votes})</div>
		        	</div>
	    			{/* Block 2; the title + text, details tabs, and set icons. Width = 100% to stretch it out and 'align right' the set icons. */}
		        	<div style={{width:'100%'}}>
	    				{/* Block 3; the title + text, prices and set icons. */}
		        		<div style={{display:'flex'}}>
				        	<div className={bemBlocks.item("details")} style={{display:'inline-block'}}>
				         		<h2 className={bemBlocks.item("title")}><a href={"http://mtg-hunter.com/?q="+source.name} target="_blank" onClick={(evt) => this.suppressClick(evt)}>{source.name}</a> {source.tagCost} ({source.cmc ? source.cmc : 0}) {otherSide} {commentCount}</h2>
				         		{/* The type line is special since it's made of TagFilters. */}
						        <div style={{display:"inline-flex"}} className={bemBlocks.item("subtitle") + " typeLine"} onClick={(evt) => this.suppressClick(evt)}>
						        	<TagFilterConfig field="supertypes.raw" id="supertypeField" title="Supertype" operator="AND" searchkit={this.searchkit}/>
						        	{_.map(source.supertypes,supertype => 
						        		<div key={supertype} style={{display:"inline-flex"}}>
						        			<PatchedTagFilter field="supertypes.raw" value={supertype} /><span>&nbsp;</span>
						        		</div>)}
						        	<TagFilterConfig field="types.raw" id="typeField" title="Type" operator="AND" searchkit={this.searchkit}/>
						        	{_.map(source.types,type => 
						        		<div key={type} style={{display:"inline-flex"}}>
						        			<PatchedTagFilter field="types.raw" value={type} /><span>&nbsp;</span>
						        		</div>)}
						        	{source.subtypes ? <span>—&nbsp;</span> : <span/>}
						        	<TagFilterConfig field="subtypes.raw" id="subtypeField" title="Subtype" operator="AND" searchkit={this.searchkit}/>
						        	{_.map(source.subtypes,subtype => 
						        		<div key={subtype} style={{display:"inline-flex"}}>
						        			<PatchedTagFilter field="subtypes.raw" value={subtype} /><span>&nbsp;</span>
						        		</div>)}
						        </div>
						        <h3 className={bemBlocks.item("subtitle")}>{source.taggedText}{pt}</h3>
						    </div>
						    <div style={{width: '80', position: 'relative', right: '10px', textAlign:"center", paddingLeft:"5"}}>
						    	{price}{foilPrice}{mtgoPrice}{mtgoFoilPrice}
						    </div>
				        	<div style={{width: '150px', position: 'relative', right: '10px', display:'inline-block'}}>
				          		<p style={{textAlign:'center', maxHeight: '200px', overflowY: 'scroll'}}>{this.getSetIcons(source)}</p>
				        	</div>	
				        </div>
	    				{/* The tab panel is by itself under block 3. */}
	        			<div className={bemBlocks.item("details")}>{selectedInfo}</div>
		        	</div>			        
	        	</div>
	      	</div>
	    )
	}
});

export default CardHitsListItem;