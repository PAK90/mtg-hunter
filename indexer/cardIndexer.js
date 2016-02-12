"use strict"
let cards = require("./data/allCardsWithSets.js")
let indexer = require("./indexer")
let _ = require("lodash")
let cardDocs = _.map(cards, (card)=> {
	card.codes = _.map(card.multiverseids, "setCode")
	return card;
})

let stringWithRaw = {
  type:"string",
  fields:{
    "raw":{type:"string", index:"not_analyzed"}
  }
}

let mapping = {
  artist:stringWithRaw,
  cmc:{type:"integer"},
  colorIdentify:stringWithRaw,
  flavor:{type:"string"},
  imageName:stringWithRaw,
  layout:stringWithRaw,
  manaCost:stringWithRaw,
  name:stringWithRaw,
  power:stringWithRaw,
  power:stringWithRaw,
  rarity:stringWithRaw,
  subtypes:stringWithRaw,
  text:{type:"string"},
  toughness:stringWithRaw,
  type:stringWithRaw,
  types:stringWithRaw,
  codes:stringWithRaw  
}


let cardIndexer = new indexer(
  "http://localhost:9200",  
  "cards", "card"
)


cardIndexer.setMapping(mapping)
cardIndexer.createMappingAndIndex().then(()=> {
	cardIndexer.bulkInsertDocuments(cardDocs)
})