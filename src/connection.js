//require the Elasticsearch librra
const { Client } = require('@elastic/elasticsearch')
const client = new Client({ node:'http://localhost:9200', 
                            log:"trace", 
                            sniffOnStart: true,
                            maxRetries: 5,
                            requestTimeout: 60000
                            })

module.exports = client;