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
import ReactStars from './modReactStars.js';
var Firebase = require('firebase');

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

    checkForLogin: function() {
    	if (!this.props.loggedIn) {
    		alert("Please log in before voting.");
    	}
    },

	render: function() {
	    const {bemBlocks, result} = this.props;
	    const source = result._source;
	    var ratingSettings = {
	      size: 18,
	      value: source.rating,
	      edit: this.props.loggedIn, // If yes, edit! If not, no.
	      //edit: true,
	      onChange: newValue => {
	      	if (this.checkForExistingVotes(source.multiverseids[source.multiverseids.length-1].multiverseid)) {
	      		// Writes the rating to the user's data. If the user is new, pass an empty array as the existing votes.
	      		this.props.handleRatingWrite(source.multiverseids[source.multiverseids.length-1].multiverseid, newValue, this.props.existingRatings ? this.props.existingRatings.votedCards : []); 
		        var cardRef = Firebase.database().ref('cards/'+source.name);
		        cardRef.once('value').then(function(snapshot) {
		          var data = snapshot.val();
		          console.log(data);
		          console.log('edition votes + rating: ' + data.multiverseids[data.multiverseids.length-1].rating + ' (' + data.multiverseids[data.multiverseids.length-1].votes + ')');
		          console.log('overall votes + rating: ' + data.rating + ' (' + data.votes + ')');
		          console.log('new vote: ' + newValue);
		          // write new votes. Since this is grid view, it always writes to the last mID.
		          var editionVotes = Firebase.database().ref('cards/'+source.name+'/multiverseids/'+(data.multiverseids.length-1)+'/votes');
		          editionVotes.transaction(function(votes) {
		            return votes + 1;
		          });

		          var editionRating = Firebase.database().ref('cards/'+source.name+'/multiverseids/'+(data.multiverseids.length-1)+'/rating');
		          editionRating.transaction(function(rating) {
		            // ((oldRating * oldVotes) + newRating)/newVotes. Treat old votes*rating as one solid block, add new rating to it, then divide again.
		            return ((data.multiverseids[data.multiverseids.length-1].rating * data.multiverseids[data.multiverseids.length-1].votes) + newValue)/(data.multiverseids[data.multiverseids.length-1].votes+1)
		          }.bind(this));

		          var totalVotes = Firebase.database().ref('cards/'+source.name+'/votes');
		          totalVotes.transaction(function(votes) {
		            return votes + 1;
		          });

		          var totalRating = Firebase.database().ref('cards/'+source.name+'/rating');
		          totalRating.transaction(function(rating) {
		            // ((oldRating * oldVotes) + newRating)/newVotes. Treat old votes*rating as one solid block, add new rating to it, then divide again.
		            return ((data.rating * data.votes) + newValue)/(data.votes+1);
		          }.bind(this));

		        }.bind(this));
		    }
	      }
	    }
	    let imgUrl = 'https://image.deckbrew.com/mtg/multiverseid/' + result._source.multiverseids[result._source.multiverseids.length - 1].multiverseid + '.jpg';
	    return (
	      <div className={bemBlocks.item().mix(bemBlocks.container("item"))}>
	        <a href={"http://mtg-hunter.com/?q="+source.name+"&sort=_score_desc"}>
	          <img className='gridImg'
	            style={{height: 311}}
	            src={imgUrl}/>

	        </a>
	        <div style={{'margin':'0 auto', 'display':'table'}} onClick={this.checkForLogin}><ReactStars {...ratingSettings} /></div>
	        <div style={{'textAlign':'center'}}className={bemBlocks.item("subtitle")}>{source.rating.toFixed(2)} ({source.votes})</div>  
	      </div>
	    )
	}
});

export default CardHitsGridItem;