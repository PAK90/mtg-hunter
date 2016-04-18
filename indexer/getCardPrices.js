var fs = require('fs'),
	_ = require("lodash"),
	path = require('path'),
	fetch = require('node-fetch'),
	request = require('request'),
	parseString = require('xml2js').parseString,
	Indexer = require('./indexer');

let cardIndexer = new Indexer(
  "http://localhost:9200",  
  "cards", "card"
);

var failedRequests = [];

var setNamesToChange = {tuples:[["Limited Edition Alpha","Alpha Edition"],
						["Limited Edition Beta","Beta Edition"],
						["Seventh Edition","7th Edition"],
						["Eighth Edition","8th Edition"],
						["Ninth Edition","9th Edition"],
						["Ravnica: City of Guilds","Ravnica"],
						["Tenth Edition","10th Edition"],
						["Time Spiral \"Timeshifted\"", "Timeshifted"],
						["Magic 2010","Magic 2010 (M10)"],
						["Magic 2011","Magic 2011 (M11)"],
						["Magic: The Gathering-Commander","Commander"],
						["Magic 2012","Magic 2012 (M12)"],
						["Planechase 2012 Edition","Planechase 2012"],
						["Magic 2013","Magic 2013 (M13)"],
						["Magic 2014 Core Set","Magic 2014 (M14)"],
						["Commander 2013 Edition","Commander 2013"],
						["Duel Decks Anthology, Divine vs. Demonic","Duel Decks: Anthology"],
						["Duel Decks Anthology, Elves vs. Goblins","Duel Decks: Anthology"],
						["Duel Decks Anthology, Garruk vs. Liliana","Duel Decks: Anthology"],
						["Duel Decks Anthology, Jace vs. Chandra","Duel Decks: Anthology"],
						["Magic 2015 Core Set","Magic 2015 (M15)"],
						["Modern Masters 2015 Edition", "Modern Masters 2015"],
						["Magic: The Gathering—Conspiracy","Conspiracy"],
						["From the Vault: Annihilation (2014)", "From the Vault: Annihilation"],
						["Media Inserts","Media Promos"],
						["Modern Event Deck 2014","Magic Modern Event Deck"]]}; 	

function checkForSetNameReplacement(setName) {
	for (var pair = 0; pair < setNamesToChange.tuples.length; pair++) {
		if (setName == setNamesToChange.tuples[pair][0]) {
			console.log("replacing " + setName + " with " + setNamesToChange.tuples[pair][1]);
			setName = setNamesToChange.tuples[pair][1];
			break;
		}
	}
	return setName;
}

// Don't forget; From The Vault cards ONLY HAVE FOIL PRICES. Probably other promos too.

function getESData2(isSecondRun) {
	console.log("about to fetch");
	if (isSecondRun) {
		return new Promise(function(resolve, reject) {
			fetch('http://localhost:9200/cards/card/_search?from=0&size=10000')
			.then(function(res) {
		        resolve( res.json() );
		    })
		})
	}
	else {
		return new Promise(function(resolve, reject) {
			fetch('http://localhost:9200/cards/card/_search?from=10000&size=10000')
			.then(function(res) {
		        resolve( res.json() );
		    })
		})	
	}
}

function getTCGPlayerPrices(doc) {
	for (var multiId = 0; multiId < doc._source.multiverseids.length; multiId++) { // Loop over all editions in the doc.
		var setName = doc._source.multiverseids[multiId].setName; 
		setName = checkForSetNameReplacement(setName); // Ensure the set name is TCGPlayer compatible.
		var priceUrl = "http://partner.tcgplayer.com/x3/phl.asmx/p?pk=TCGTEST&s="+setName+"&p="+doc._source.name;
		requestPrices(doc._source.multiverseids[multiId], priceUrl).then(function(result) {
			doc._source.multiverseids[multiId] = result;
			console.log(doc._source.multiverseids[multiId]);
		});
	}
	//console.log('doc id: ' + doc._id);
}

function requestPrices(multiIdObject, priceUrl) {
	//console.log("requesting priceUrl " + priceUrl);
	return new Promise(function(resolve) {
		request(priceUrl, function(error, response, body) {
		  	if (!error && response.statusCode == 200 ) {
		  		parseString(body, function (err, result) {
		  			if (result.products.product !== undefined) { // Safeguard against weird results.
			  			//console.log(result);
			    		multiIdObject.lowPrice = parseFloat(result.products.product[0].lowprice[0]);
			    		//console.log("written " + result.products.product[0].lowprice[0] + ' to ' + multiIdObject.lowPrice );
			    		multiIdObject.medPrice = parseFloat(result.products.product[0].avgprice[0]);
			    		//console.log("written " + result.products.product[0].avgprice[0] + ' to ' + multiIdObject.medPrice );
			    		multiIdObject.hiPrice = parseFloat(result.products.product[0].hiprice[0]);
			    		//console.log("written " + result.products.product[0].hiprice[0] + ' to ' + multiIdObject.hiPrice );
			    		multiIdObject.foilPrice = parseFloat(result.products.product[0].foilavgprice[0]);
			    		//console.log("written " + result.products.product[0].foilavgprice[0] + ' to ' + multiIdObject.foilPrice );
			    		multiIdObject.storeLink = result.products.product[0].link[0];
			    		//console.log("written " + result.products.product[0].link[0] + ' to ' + multiIdObject.storeLink );
			    	}
				});
		  	}
		  	else {
		  		console.log(body + ' with link ' + priceUrl); // Product not found.
		  		failedRequests.push(priceUrl+'\n');
		  		//console.log(failedRequests);
		  	}
			resolve(multiIdObject);
		  	//console.log(thisMultiId);
		});
	});
}

async function printDocs(isSecondRun){
  // "await" resolution or rejection of the promise
  // use try/catch for error handling
    try {
	    var docs = await getESData2();
	    //console.log(docs);
	    var startTime = Date.now();
	    // now you can write this like syncronous code!
	    for (var hit = 0; hit < docs.hits.hits.length; hit++) {
	        //console.log('\n+++++++++++'+docs.hits.hits[hit]._id);
	        for (var edition = 0; edition < docs.hits.hits[hit]._source.multiverseids.length; edition++ ) {
		      	//console.log(docs.hits.hits[hit]._source.multiverseids[edition]);
		      	var setName = docs.hits.hits[hit]._source.multiverseids[edition].setName; 
				setName = checkForSetNameReplacement(setName); // Ensure the set name is TCGPlayer compatible.
				// Have to change fuse/split card names to reflect both prices.
				var name = docs.hits.hits[hit]._source.name;
				if (docs.hits.hits[hit]._source.layout == "split") {
					name = docs.hits.hits[hit]._source.names[0] + ' // ' + docs.hits.hits[hit]._source.names[1];
				}
				// If it's a DFC, use the original side's name.
				else if ((docs.hits.hits[hit]._source.layout == "double-faced" || docs.hits.hits[hit]._source.layout == "flip")
							&& docs.hits.hits[hit]._source.name == docs.hits.hits[hit]._source.names[1]) {
					name = docs.hits.hits[hit]._source.names[0];
				}
				// If it's a token, append "Token" to the name.
				else if (docs.hits.hits[hit]._source.layout == "token") {
					name = name + " Token";
				}
				// Remove all "" from the name (like Ach, Hans Run and Kongming, Sleeping Dragon)
				name = name.replace(/"/g,"");
				var priceUrl = "http://partner.tcgplayer.com/x3/phl.asmx/p?pk=MTGHUNTER&s="+setName+"&p="+name;
				docs.hits.hits[hit]._source.multiverseids[edition] = await requestPrices(docs.hits.hits[hit]._source.multiverseids[edition], priceUrl);
	        }
	    	//console.log('\n====='+JSON.stringify(docs.hits.hits[hit]._source));
	    	// Now send this modified data back to the ES server with an update push.
	    	cardIndexer.updateSingleDocument(docs.hits.hits[hit]);
	    	console.log("---done " + docs.hits.hits[hit]._source.name + ". elapsed time: " + (Date.now() - startTime) / 1000);
    	}
		//console.log(JSON.stringify(docs));
    } catch (e) {
	    // promise was rejected and we can handle errors with try/catch!
    }
}

async function main2() {
	await printDocs(false); // False means first run.
	console.log("FINISHED RUN 1.");
	//await printDocs(true); // True means second run.
	//console.log("FINISHED RUN 2. writing errors to " + __dirname);
	fs.writeFile(path.join(__dirname, 'failedRequests.json'), JSON.stringify(failedRequests, null, '  '), 'utf8', this);
}

function launcher() {
	main2();
}

launcher();

//);