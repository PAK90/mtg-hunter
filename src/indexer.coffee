elasticsearch = require "elasticsearch"
promise       = require "bluebird"
movies        = require "./data/allCardsWithSets"
moment        = require "moment"
_             = require "lodash"

client = new elasticsearch.Client({
  "localhost:9200"
})

compact = (ob)->
	for k,v of ob
	    delete ob[k] unless v and v isnt "N/A"
	return ob

processedMovies = cards.map (card)->
	//years = getYears(card.Year)
	return compact({
		artist: card.artist
		name: card.name
		cmc: card.cmc
		flavor: card.flavor
		id: card.id
		layout: card.layout
		manaCost: card.manaCost
		power: card.power
		toughness: card.toughness
		rarity: card.rarity
		text: card.text
		type: card.type
	    /*title:card.Title
	    year:years.year
	    yearEnded:years.yearEnded
	    rated:card.Rated
	    released:moment(card.Released, "DD MMM YYYY").format("YYYY-MM-DD") if notNA(card.Released)
	    runtimeMinutes:toNumber(card.Runtime)
	    genres:splitComma(card.Genre)
	    directors:splitComma(card.Director)
	    writers:splitWriter(card.Writer)
	    actors:splitComma(card.Actors)
	    plot:card.Plot
	    languages:splitComma(card.Language)
	    countries:splitComma(card.Country)
	    awards:card.Awards if notNA(card.Awards)
	    poster:card.PosterS3
	    metaScore:Number(card.Metascore) if notNA(card.Metascore)
	    imdbRating:Number(card.imdbRating)
	    imdbVotes:toNumber(card.imdbVotes)
	    imdbId:card.imdbID
	    type:_.capitalize(card.Type)
	    suggest:{
	        input:card.Title?.split?(" ") or []
	        output: card.Title
	        payload: {id:card.imdbID}
	    }*/
	})