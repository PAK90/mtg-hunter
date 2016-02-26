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
}
function countColours(symbols) {
  var colours = ['w','u','r','b','g'];
  var count = 0;
  for (var i = 0; i < symbols.length; i++) {
    for (var j = 0; j < colours.length; j++) {
      if (_.includes(symbols[i],colours[j])) {
        count++;
      }
    }    
  }
  return count;
}

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
  codes:stringWithRaw,
  codeNames:stringWithRaw,
  formats:stringWithRaw
};

let cardIndexer = new indexer(
  "http://localhost:9200",  
  "cards", "card"
);

let cardLength = cards.length;
var i = 0;

function bulkLoop() {
  setTimeout(function() {
    console.log(i + ' to ' + (i + 999) + ' (' + cards.slice(i,i+1000).length + ')');
    let cardDocs = _.map(cards.slice(i, i+1000), (card)=> {
      card.codes = _.map(card.multiverseids, "setCode");
      card.formats = _.map(card.legalities, "format");
      card.codeNames = _.map(card.multiverseids, "setName");
      card.colourCount = card.colors ? card.colors.length : 0; // If it doesn't have colours it won't exist so hopefully it's false-y and will go to 0.
      card.colors = card.colors || "Colourless";
      card.symbols = _.uniq(symbolize(card.manaCost)); // Extract all symbols from {} that aren't numeric. Remove duplicates with _.uniq.
      //card.colourCount = countColours(card.symbols); // Count unique colours. ['w','ug'] = 3, ['r','u','w'] = 3, ['c'] = 0 since colourless isn't a colour. Replaced by line 30.
      return card;
    });
    i += 1000;
    cardIndexer.bulkInsertDocuments(cardDocs);
    if (i < cardLength) {
      bulkLoop();
    }
  }, 5000);
}

cardIndexer.setMapping(mapping);
cardIndexer.createMappingAndIndex().then(()=> {
  bulkLoop();
});