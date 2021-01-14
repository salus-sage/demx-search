'use strict'

require('array.prototype.flatmap').shim()
/*const { Client } = require('@elastic/elasticsearch')
const client = new Client({
  node: 'http://localhost:9200',
  log: "trace"
})*/
var client= require ('./connection.js');


async function run () {
  try {
    console.log("trying")
    await client.indices.exists({
      index: 'campus-collection'
     }).then(function (exists) {
      if (!exists) {
        client.indices.create({
          index: 'campus-collection',
          body: {
            mappings: {
              properties: {
                id: {"type": "string"},
                title: {"type": "string"},
                description: {"type": "string"},
                identifier: {"type": "string"},
                source: {"type": "string"},
                creator: {"type": "string"},
                date: {"type": "string"},
                collectionId: {"type": "string"},
                 collectionTitle: {"type": "string"},
                 seriesId: {"type": "string"},
                 seriesTitle: {"type": "string"},
                 tags: {"type": "keyword"},
                 rights: {"type": "string"},
                 rightsHolder: {"type": "string"},
                 publisher: {"type": "string"},
                 format: {"type": "string"},
                 type: {"type": "string"},
                 filename: {"type": "string"},
                 featured: {"type": "string"},
                 fileUrl: {"type": "string"},
                 thumbnail: {"type": "string"},
                 language: {"type": "string"},
                 sortField: {"type": "string"},
                 fileExt: {"type": "string"},
                 _by: {"type": "string"},
                 _mby: {"type": "string"}
              }
            }
          }
        }, { ignore: [400] })
      } else {
        console.log("Index already exists");
      }})
} catch (err) {
  console.log(err, "error creating");
}
  

const campusItems = require('./public/assets/cartoons.collection.json');

const body = campusItems.flatMap(doc => [{ index: { _index: 'campus-collection' } }, doc])
const { body: bulkResponse } = await client.bulk({ refresh: true, body })

if (bulkResponse.errors) {
    const erroredDocuments = []
    // The items array has the same order of the dataset we just indexed.
    // The presence of the `error` key indicates that the operation
    // that we did for the document has failed.
    bulkResponse.items.forEach((action, i) => {
      const operation = Object.keys(action)[0]
      if (action[operation].error) {
        erroredDocuments.push({
          // If the status is 429 it means that you can retry the document,
          // otherwise it's very likely a mapping error, and you should
          // fix the document before to try it again.
          status: action[operation].status,
          error: action[operation].error,
          operation: body[i * 2],
          document: body[i * 2 + 1]
        })
      }
    })
    console.log(erroredDocuments)
  }

  const { body: count } = await client.count({ index: 'campus-collection' })
  console.log(count)
}

run().catch(console.log)