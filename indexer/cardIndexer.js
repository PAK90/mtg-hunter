"use strict"
let cards = require("./data/allCardsWithSetsExt.js");
let indexer = require("./indexer");
let _ = require("lodash");
var cardMultis = require('../src/multiIdName.json');

var cardArray = Object.keys(cardMultis).map(function(cardName) {
  return (cardMultis[cardName].cardName = cardName) && cardMultis[cardName];
});

// Remove basic lands.
var cardArray = cardArray.filter(function(card) {
  return (card.name != "Swamp" && card.name != "Forest" && card.name != "Plains" && card.name != "Island"  && card.name != "Mountain" && card.name != "Where" && card.name != "When" );
})

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

function anonymizeRulesText(name, text) {
  if (!text) return;
  var forbiddenWords = ["Skulk","Madness","Investigate","Delirium","Flying","Warrior","Soldier","Wizard","The","Defender","Enchanted","Double","First","Flash","Enchanted","Indestructible","Enchanted","Prowess","Reach","Enchanted","Vigilance","Exile","Enchanted","Fight","Regenerate","Sacrifice","Absorb","Enchanted","Battle","Cascade","Champion","Changeling","Clash","Dash","Devour","Dredge","Echo","Epic","Evoke","Exalted","Flanking","Fortify","Frenzy","Enchanted","Graft","Gravestorm","Haunt","Infect","Living","Madness","Manifest","Miracle","Modular","Monstrosity","Offering","Overload","Persist","Poisonous","Populate","Provoke","Prowl","Rampage","Rebound","Recover","Reinforce","Renown","Replicate","Ripple","Scavenge","Shadow","Soulbond","Split","Storm","Sunburst","Suspend","Totem","Transfigure","Transmute","Transform","Undying","Unleash","Unearth","Vanishing","Wither","Battalion","Bloodrush","Channel","Domain","Fateful","Ferocious","Grandeour","Hellbent","Heroic","Join","Kinship","Morbid","Radiance","Raid","Sweep","Threshold","Bury","Fear","Intimidate","Protection","Shroud","Substance"]
  // First do a pass with the name as normal. Use regex so that it repeats beyond the first occurrence.
  text = text.replace(new RegExp(name, 'g'), '~');
  // Now with a first name. Since 'flying' occurs in names and is a keyword, don't do that. Duplicate for other keywords.
  let firstName = name.split(' ')[0];
  if (!_.includes(forbiddenWords, firstName) && name != "Erase (Not the Urza's Legacy One)") {
    //console.log('Finding and replacing '+firstName);
    text = text.replace(new RegExp(firstName, 'g'), '~');
  }
  let beforeComma = name.split(' ,')[0];
  if (!_.includes(forbiddenWords, beforeComma) && name != "Erase (Not the Urza's Legacy One)") {
    //console.log('Finding and replacing '+beforeComma);
    text = text.replace(new RegExp(beforeComma, 'g'), '~');
  }
  let beforeThe = name.split(' the')[0];
  if (!_.includes(forbiddenWords, beforeThe) && name != "Erase (Not the Urza's Legacy One)") {
    //console.log('Finding and replacing '+beforeThe);
    text = text.replace(new RegExp(beforeThe, 'g'), '~');
  }
  return text;
}

function bracketRulings(ruling, currentCard) {
  let oldRuling = ruling.text;
  // Loop through all card names.
  for (var i = 0; i < cardArray.length; i++) {
    // Only go in if current card isn't named. Also not if the current name (e.g. Goblin) is included in the main name (Goblin Grenadier). Not working at the moment for some reason...
    if (cardArray[i].name != currentCard.name && cardArray[i] && !_.includes(currentCard.name, cardArray[i].name)) {
      // If you find the name in the text, get in there and replace it.
      // TURNS OUT YOU NEED TO ESCAPE THE STUFF IN THE "" PAIRS TOO, like \b. Annoying.
      var reg = new RegExp("(?:^|\\b)("+cardArray[i].name+")(?=\\b|$)", 'g');
      if (ruling.text.search(reg) != -1) {
        let bracketedName = '[' + cardArray[i].name + ']';
        //console.log('found ' + cardArray[i].name + ' in ' + ruling.text + '\n');
        ruling.text = ruling.text.replace(reg, bracketedName );
      }
    }
  }
  //if (oldRuling != ruling.text) {console.log(ruling.text + '!!!!!!\n');}

  return ruling;
}

let stringWithRaw = {
  type:"string",
  fields:{
    "raw":{type:"string", index:"not_analyzed"}
  }
};

let mapping = {
  multiverseids: {
    properties: {
      artist:stringWithRaw,
      rarity:stringWithRaw,
      flavor:stringWithRaw,
      setCode:stringWithRaw,
      setName:stringWithRaw
    }
  },
  cmc:{type:"integer"},
  colorIdentify:stringWithRaw,
  colors:stringWithRaw,
  flavor:{type:"string"},
  imageName:stringWithRaw,
  layout:stringWithRaw,
  manaCost:stringWithRaw,
  prettyCost:stringWithRaw,
  name:stringWithRaw,  
  power:stringWithRaw,
  rarity:stringWithRaw,
  subtypes:stringWithRaw,
  text:{type:"string"},
  namelessText:stringWithRaw,
  toughness:stringWithRaw,
  type:stringWithRaw,
  supertypes:stringWithRaw,
  types:stringWithRaw,
  formats:stringWithRaw
};

let cardIndexer = new indexer(
  "http://localhost:9200",  
  "cards", "card"
);

// Strips out cards banned in certain formats.
function banCards(legalities) {
  var setCode = card.multiverseids[card.multiverseids.length-1].setCode;
  console.log(legalities.format + ' ' + setCode);
  if (legalities.legality == "Legal") {
    if ((setCode == "FRF" || setCode == "KTK") && (legalities.format == "Standard")) {
      console.log("overriding faulty KTK and FRF standard info.");
      return false;
    }
    return legalities.format;
  }
}

let cardLength = cards.length;
var i = 0;

function bulkLoop() {
  setTimeout(function() {
    console.log(i + ' to ' + (i + 999) + ' (' + cards.slice(i,i+1000).length + ')');
    let cardDocs = _.map(cards.slice(i, i+1000), (card)=> {
      //card.codes = _.map(card.multiverseids, "setCode");
      card.cmc = card.cmc ? card.cmc : 0; // If there's no cmc, set it to 0. This is to fix lands.
      //card.formats = _.map(card.legalities, banCards().bind(this));
      card.formats = _.map(card.legalities, function(legalities, i) {
        var setCode = card.multiverseids[card.multiverseids.length-1].setCode;
        //console.log(legalities.format + ' ' + setCode);
        if (legalities.legality == "Legal") {
          if ((setCode == "FRF" || setCode == "KTK") && (legalities.format == "Standard")) {
            console.log("overriding faulty KTK and FRF standard info.");
            return false;
          }
          return legalities.format;
        }
      }.bind(this));
      //card.codeNames = _.map(card.multiverseids, "setName");
      card.colourCount = card.colors ? card.colors.length : 0; // If it doesn't have colours it won't exist so hopefully it's false-y and will go to 0.
      card.colors = card.colors || "Colourless";
      card.prettyCost = card.manaCost ? card.manaCost.replace(/[{}]/g, '') : null;
      card.symbols = _.uniq(symbolize(card.manaCost)); // Extract all symbols from {} that aren't numeric. Not Remove duplicates with _.uniq, as a devotion test.
      //card.artists = _.uniq(_.map(card.multiverseids, "artist"));
      //card.flavors = _.uniq(_.map(card.multiverseids, "flavor"));
      //card.rarities = _.uniq(_.map(card.multiverseids, "rarity"));
      // Generate new rules text to search on that anonymizes names. Keep original intact for display purposes.
      // Tuktuk is a special case, because of 'Tuktuk the Reborn' appearing in the text.
      card.namelessText = card.name == "Tuktuk the Explorer" ? card.text.replace(card.name, '~') : anonymizeRulesText(card.name, card.text);
      //card.colourCount = countColours(card.symbols); // Count unique colours. ['w','ug'] = 3, ['r','u','w'] = 3, ['c'] = 0 since colourless isn't a colour. Replaced by line 30.
      //card.rulings = card.rulings ? card.rulings.map(function(ruling) { return bracketRulings(ruling, card); }.bind(this)) : null;
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