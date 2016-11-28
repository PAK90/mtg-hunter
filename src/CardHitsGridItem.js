import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import "searchkit/theming/theme.scss";
import "./styles/customisations.scss";
import {TagFilter, TagFilterConfig, TagFilterList} from 'searchkit';
var ent = require('ent');
const nl2br = require('react-nl2br');
import "./styles/keyrune.css";

var CardHitsGridItem = React.createClass({
	getInitialState: function() {  	
	    var {bemBlocks, result} = this.props;
	    var source = result._source;
	    if (result.inner_hits) {
    		var multiverses = result.inner_hits.multiverseids.hits.hits.map(function(multis, i) {
    			return multis._source;
    		})
    	}
    	else {
    		var multiverses = result._source.multiverseids;
    	}
	    // At some point, have all multiverse-specific stuff (id, flavour text, original text) as states.
	    // Then, when you click the symbol, all we have to do is load that multi's data into the states which are already in the renderer.
        return {
            clickedCard: '',
            currentMultiId: multiverses[multiverses.length-1].multiverseid,
            currentImageMultiId: multiverses[multiverses.length-1].multiverseid,
            currentArtist: multiverses[multiverses.length-1].artist,
            currentFlavor: multiverses[multiverses.length-1].flavor,
            currentOriginalText: multiverses[multiverses.length-1].originalText,
            currentSetName: multiverses[multiverses.length-1].setName,
            currentNumber: multiverses[multiverses.length-1].number,
            currentLowPrice: multiverses[multiverses.length-1].lowPrice,
            currentMedPrice: multiverses[multiverses.length-1].medPrice,
            currentHiPrice: multiverses[multiverses.length-1].hiPrice,
            currentFoilPrice: multiverses[multiverses.length-1].foilPrice,
            currentStoreLink: multiverses[multiverses.length-1].storeLink,
            currentMtgoPrice: multiverses[multiverses.length-1].mtgoPrice,
            currentFoilMtgoPrice: multiverses[multiverses.length-1].mtgoFoilPrice,
            currentMtgoStoreLink: multiverses[multiverses.length-1].mtgoStoreLink,
        };
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

    getSetIcons: function(result) {
    	var multiverses = result._source.multiverseids;
    	// Loop through all multiverseIds, which have their own set code and rarity.
    	var setIcons = multiverses.map(function(multis, i) {
      		//let rarity = multis.rarity.charAt(0) == "B" ? "C" : multis.rarity.charAt(0); // Replace 'basic' rarity with common.
      		let rarity = multis.rarity.toLowerCase();
      		if (rarity == "basic") {
      			rarity = "common";
      		}
      		else if (rarity == "special") {
      			rarity = "mythic rare";
      		}
      		// Some set codes are different in Keyrune.
      		if (multis.setCode == "MPS") {multis.setCode = "mp1";}
      		if (multis.setCode == "DD3_EVG") {multis.setCode = "evg";}
      		if (multis.setCode == "DD3_GVL") {multis.setCode = "ddd";}
      		if (multis.setCode == "DD3_JVC") {multis.setCode = "dd2";}
      		/*return (<div style={{"height":"39px"}}>
            	<img key={i} className={(this.state.currentMultiId == multis.multiverseid ? "clicked " : "") + "setIcon " + rarity } 
            		src={'./src/img/sets/' + multis.setName.replace(/\s+/g,'').replace(":","").replace('"','').replace('"','').toLowerCase() + '-' + rarity + '.jpg'} 
	                title={multis.setName}
	                onClick={(evt) => this.handleSetIconClick(evt, multis)}/>
	                </div>
	            )
				          		
	    	}.bind(this))*/
	    	return (<div>
	    		<i className={"ss setIcon ss-"+multis.setCode.toLowerCase()+" ss-"+rarity+" ss-2x ss-grad ss-fw ss-no-border"} 
	    			title={multis.setName}
	                onClick={(evt) => this.handleSetIconClick(evt, multis)}/>
	                </div>
	    		)
	    }.bind(this));
    	return setIcons;
  	},

  	countRarity: function(rarity) {
  		var {bemBlocks, result} = this.props;
  		var source = result._source;
  		var count = source.multiverseids.reduce(function(n, card) { 
  			return n + (card.rarity == rarity)
  		},0);
  		return count;
  	},

  	getEditionCircle: function(canvas) {
  		var {bemBlocks, result} = this.props;
  		var source = result._source;
  		if (canvas) {
			var ctx = canvas.getContext("2d");
			var lastend = 0;
			var data = [this.countRarity("Common") + this.countRarity("Basic Land"), this.countRarity("Uncommon"), this.countRarity("Rare"), this.countRarity("Mythic Rare") + this.countRarity("Special")];
			var total = source.printingCount;
			//var total = source.multiverseids.length;
			var myColor = ['#4e4e4e','#d5d5d5','#EAC66B', '#ed8f2a'];

			for (var i = 0; i < data.length; i++) {
				ctx.fillStyle = myColor[i];
				ctx.beginPath();
				ctx.moveTo(canvas.width/2,canvas.height/2);
				ctx.arc(canvas.width/2,canvas.height/2,canvas.height/2,lastend,lastend+(Math.PI*2*(data[i]/total)),false);
				ctx.lineTo(canvas.width/2,canvas.height/2);
				ctx.fill();
				lastend += Math.PI*2*(data[i]/total);
			}

			ctx.fillStyle = 'rgba(255,255,255,0.80)';
			ctx.beginPath();
			//ctx.moveTo(canvas.width/2, canvas.height/2);
			ctx.arc(canvas.width/2, canvas.height/2, 15, 0, 360, false);
			ctx.fill();
			//ctx.stroke();
			ctx.fillStyle = '#333'
			ctx.font = "20px sans-serif";
			ctx.textAlign="center"; 
			ctx.textBaseline = "middle";
			ctx.fillText(total, canvas.width/2, canvas.height/2, canvas.width-11);
		}
  	},

  	/* Area to paste test code.

		        <canvas id="can" width="37" height="37">{this.getEditionCircle(result)}</canvas>
		        <span className='counterBadge'>{result._source.multiverseids.length}</span>
  	*/

	render: function() {
	    var {bemBlocks, result} = this.props;
	    var source = result._source;
	    let url = "http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=" + result._source.multiverseids[result._source.multiverseids.length - 1].multiverseid;
	    let imgUrl = 'https://image.deckbrew.com/mtg/multiverseid/' + this.state.currentImageMultiId + '.jpg';
	    //var circle = <canvas id="can" width="37" height="37" /> 
	    //this.getEditionCircle(result);

	    return (
		     <div className={bemBlocks.item().mix(bemBlocks.container("item"))}>
		        <div style={{textAlign:'center', maxHeight: '200px', overflow: 'auto', maxWidth:'210px', display:"inline-flex"}}>{this.getSetIcons(result)}</div>
		        <canvas style={{position: "relative", top: "17px", right: "110px", marginTop: "-35px"}} width="37" height="37" ref={this.getEditionCircle}/>
		        <a href={"http://mtg-hunter.com/?q="+source.name+"&sort=_score_desc"}>
		          	<img className='gridImg'
			            style={{height: 311}}
			            src={imgUrl}/>
		        </a>
		    </div>
		)
	}
});

export default CardHitsGridItem;