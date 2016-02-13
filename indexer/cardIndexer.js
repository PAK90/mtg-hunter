"use strict"
let cards = require("./data/allCardsWithSetsExt.js");
let indexer = require("./indexer");
let _ = require("lodash");
function symbolize(manaCost) {
  var symbolArray = [];
  var regEx = /{([^}(0-9)]+)}/g; // Match all curly braces without numbers in them.
  var symbol;
  // Iterate through the mana cost regex matches, put them in the array.
  while (symbol = regEx.exec(manaCost)) {
    symbolArray.push(symbol[1].replace("/","")); // Remove / from R/W and others like it.
  }
  return symbolArray;
};
let cardDocs = _.map(cards, (card)=> {
	card.codes = _.map(card.multiverseids, "setCode");
  card.colors = card.colors || "Colourless";
  card.symbols = _.uniq(symbolize(card.manaCost)); // Extract all symbols from {} that aren't numeric. Remove duplicates with _.uniq.
	return card;
});

let stringWithRaw = {
  type:"string",
  fields:{
    "raw":{type:"string", index:"not_analyzed"}
  }
};

let mapping = {
  artist:stringWithRaw,
  cmc:{type:"integer"},
  colorIdentify:stringWithRaw,
  colors:stringWithRaw,
  flavor:{type:"string"},
  imageName:stringWithRaw,
  layout:stringWithRaw,
  manaCost:stringWithRaw,
  name:stringWithRaw,  
  power:stringWithRaw,
  rarity:stringWithRaw,
  subtypes:stringWithRaw,
  text:{type:"string"},
  toughness:stringWithRaw,
  type:stringWithRaw,
  supertype:stringWithRaw,
  types:stringWithRaw,
  codes:stringWithRaw  
};

let cardIndexer = new indexer(
  "http://localhost:9200",  
  "cards", "card"
);

cardIndexer.setMapping(mapping);
cardIndexer.createMappingAndIndex().then(()=> {
	cardIndexer.bulkInsertDocuments(cardDocs);
});