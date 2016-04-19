"use strict"
const elasticsearch = require("elasticsearch")
const _ = require("lodash")
const args = process.argv.slice(2)
const log = console.log.bind(console)

module.exports = class Indexer {
  constructor(host, index, type){
    this.client = new elasticsearch.Client({
      host:host
    })
    this.index = index
    this.type = type
  }
  setMapping(mapping){
    this.mapping = mapping
  }

  queue(fns){
    let queue2 = Promise.resolve(true)
    for (let f of fns) {
      queue2 = queue2.then(f.bind(this))
    }
    return queue2
  }
  deleteIndex(){
    console.log("DELETE Index")
    return this.client.indices.delete({index:this.index})
      .catch(log)
  }

  createIndex(){
    console.log("POST Index")
    let settings = {
      "index": {
          "max_result_window" : 20000
      },
      "analysis": {
        "char_filter": {
           "replace": {
            "type": "mapping",
            "mappings": [
              "&=> and "
            ]
          }
        },
        "filter": {
          "word_delimiter" : {
            "type" : "word_delimiter",
            "split_on_numerics" : false,
            "split_on_case_change" : true,
            "generate_word_parts" : true,
            "generate_number_parts" : true,
            "catenate_all" : true,
            "preserve_original":true,
            "catenate_numbers":true,
            "type_table": [
              "/ => ALPHANUM",
              "+ => ALPHANUM",
              "- => ALPHANUM"
            ]
          }
        },
        "analyzer": {
          "default": {
            "type": "custom",
            "char_filter": [
              "html_strip",
              "replace"
            ],
            "tokenizer": "whitespace",
            "filter": [
                "lowercase",
                "word_delimiter"
            ]
          }
        }
      }
    }
    console.log(settings)
    return this.client.indices.create(
      {index:this.index, body:settings})
  }

  putMapping(){
    console.log("PUT Mapping")
    let mappingBody = {
      index:this.index,
      type:this.type,
      body:{
        [this.type]:{
          properties:this.mapping
        }
      }
    }
    return this.client.indices.putMapping(mappingBody)
  }

  bulkInsertDocuments(documents){
    let commands = []
    for (let doc of documents) {
      commands.push({index:{_index:this.index, _type:this.type, _id:doc.id }})
      commands.push(doc)
    }
    console.log('Sending commands...')
    return this.client.bulk({requestTimeout: Infinity, body:commands}).then((res)=> {
      console.log(`indexed ${res.items.length} items in ${res.took}ms`)
    }).catch((e)=> {
      console.log(e)
    })
  }

  updateSingleDocument(doc) {
    //console.log("giving: "+this.index + ' ' + this.type + ' ' + doc._id);
    //console.log(command[1]);
    return this.client.update({requestTimeout: Infinity, 
                               body: {doc: doc._source}, index: this.index, type: this.type, id: doc._id}).then((res)=> {
      //console.log(`updated in ${res.took}ms`)
    }).catch((e)=> {
      console.log(e)
    })
  }

  createMappingAndIndex(){
    return this.queue([
      this.deleteIndex,
      this.createIndex,
      this.putMapping
    ]).catch((e)=> {
      console.log(e)
    })
  }
}
