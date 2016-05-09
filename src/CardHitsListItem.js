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
var ReactDisqusThread = require('react-disqus-thread');
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
        <div key={value} onClick={this.handleClick} className={className}>{this.props.children}</div>
      )
    } else {
      // No children, use the value instead
      return (
        <div key={value} onClick={this.handleClick} className={className}>{value}</div>
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
    	DISQUSWIDGETS.getCount({reset:true});
    },

    componentDidUpdate() {
    	DISQUSWIDGETS.getCount({reset:true});
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
	
	handleTabSelect(index, last) {
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
            	<img key={i} className={(this.state.currentMultiId == multis.multiverseid ? "clicked " : "") + "setIcon " + rarity } src={'./src/img/sets/' + multis.setName.replace(/\s+/g,'').replace(":","").replace('"','').replace('"','').toLowerCase() + '-' + rarity + '.jpg'} 
	                title={multis.setName}
	                onClick={(evt) => this.handleSetIconClick(evt, multis)}/>
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

	suppressClick: function(evt) {
		evt.stopPropagation();
	},

	/*handleNewComment: function(comment) {
		var newComment = comment.text.replace(/\[(.*?)\]/g, '<a href="http://mtg-hunter.com/?q=$1" target="_blank">$1</a>');
		console.log(newComment);
		disqus.request('posts/update', {post: comment.id, message: newComment}, function(data) {
			if (data.error) {
				console.log(error)
			}
		})
	},*/

	render: function() {
	    var {bemBlocks, result} = this.props;
	    var source = result._source;
	    let url = "http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=" + this.state.currentMultiId;
	    let imgUrl = 'https://image.deckbrew.com/mtg/multiverseid/' + this.state.currentImageMultiId + '.jpg';
	    // Generate the mana symbols in both cost and the card text.	    
	    source.tagCost = this.generateTitleCostSymbols(source.manaCost);
	    source.taggedText = this.generateTextCostSymbols(source.text);

	    // Define 'details' tab information here.
	    var extraInfo, flavour, pt, legalities, otherSide, price, foilPrice, mtgoPrice, mtgoFoilPrice;

	    // Start with a separate div for all 4 potential prices.
	    if (this.state.currentMedPrice) {
	    	price = ( <a href={this.state.currentStoreLink} target="_blank" onClick={(evt) => this.suppressClick(evt)}>
	    		<div className="priceContainer">
    				<span className={bemBlocks.item("subtitle") + " price"}>{'$'+this.state.currentMedPrice.toFixed(2)}</span>
    				<br/>
    				<span className={bemBlocks.item("subtitle") + " price priceDescriptor"} style={{fontSize: "inherit"}}><b>{'Paper'}</b></span>
    			</div>
    		</a> )
	    }
	    else { price = <div/>}
	    if (this.state.currentFoilPrice) {
	    	foilPrice = ( <a href={this.state.currentStoreLink} target="_blank" onClick={(evt) => this.suppressClick(evt)}>
    			<div className="priceContainer">
					<span className={bemBlocks.item("subtitle") + " price"}>{'$'+this.state.currentFoilPrice.toFixed(2)}</span>
					<br/>
					<span className={bemBlocks.item("subtitle") + " price priceDescriptor"} style={{fontSize: "inherit"}}><b>{'Foil'}</b></span>
				</div>
			</a> )
	    }
	    else { foilPrice = <div/>}
	    if (this.state.currentMtgoPrice) {
	    	mtgoPrice = ( <a href={this.state.currentMtgoStoreLink} target="_blank" onClick={(evt) => this.suppressClick(evt)}>
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
    			})} target="_blank" onClick={(evt) => this.suppressClick(evt)}>
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
    	if (source.layout == "flip" || source.layout == "double-faced" || source.layout == "split") {
    		var otherSideName = source.name == source.names[0] ? source.names[1] : source.names[0];
    		otherSide = (
    			<span onMouseOver={this.onLayoutHover.bind(this, source)}
    				onMouseOut={this.onLayoutHoverOut}
    				className={bemBlocks.item("subtitle")}><b><a href={"http://mtg-hunter.com/?q="+otherSideName} 
    															target="_blank" onClick={(evt) => this.suppressClick(evt)}>{otherSideName}</a></b></span>
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
    							<span className={bemBlocks.item("subtitle")}>{this.generateCardHoverSpan(ruling.text)}</span></div>
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
	        	</TabList>
            	<TabPanel>
					<div className='extraDetails'>{flavour}{extraInfo}{legalities}</div> 
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
        	</Tabs>)
	    }
	    else {
	    	selectedInfo = <div/>
	    }
	    // In the style for the set icons, 'relative' enables cards like Forest to grow the div around them to fit all the symbols.
	    // In the future, might want an 'open/close' <p> tag for that, since it's pretty useless seeing all those symbols anyway.
	    // The <p> tag helps to align the symbols in the centre, and probably other important css-y stuff.
	    // this.props.currentCard is '' when unclicked, which is apparently false-y enough to use for a bool.

						        /*<h3 className={bemBlocks.item("subtitle")}><b>{source.type}</b></h3>
						        
		            	<Rating start={0} stop={5} initialRate={4} />*/

		var commentCount = <span className="disqus-comment-count" onClick={function() {this.setState({currentSelectedTab: 4})}.bind(this)} 
			data-disqus-identifier={(source.multiverseids[result._source.multiverseids.length - 1].multiverseid).toString()} 
			style={{fontVariant:"small-caps", float:"right", cursor:"hand", paddingRight:8, fontSize:"smaller"}}>0 Comments</span>

	    return (
	    	<div className={bemBlocks.item().mix(bemBlocks.container("item"))} style={{display: 'block'}} onClick={() => this.props.updateCardName(source)}>
	    		<div style={{display: 'flex'}}>
	    			{/* Block 1; the card image. */}
		    		<div className={"listImgDiv "} >
		          		<img className={(this.props.currentCard == source.name ? "clicked " : "") + "listImg "+ this.state.currentImageLayout }
		            		src={imgUrl} 
		            		style={{borderRadius: this.props.currentCard == source.name ? "10" : "6", cursor:"hand"}} 
		            		width="100"
		            		/>
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