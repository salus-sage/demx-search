// require es connection
var client= require ('./connection.js');
var functions= require ('./functions.js');
//require Express
const express = require( 'express' );
// instanciate an instance of express and hold the value in a constant called app
const app     = express();
//require the body-parser library. will be used for parsing body requests
const bodyParser = require('body-parser')
//require the path library
const path    = require( 'path' );

// ping the client to be sure Elasticsearch is up
client.ping({
     requestTimeout: 30000,
 }, function(error) {
 // at this point, eastic search is down, please check your Elasticsearch service
     if (error) {
         console.error('elasticsearch cluster is down!');
     } else {
         console.log('Everything is ok');
     }
 });


// use the bodyparser as a middleware
app.use(bodyParser.json())
// set port for the app to listen on
app.set( 'port', process.env.NODE_PORT || 3005 );
// set path to serve static files
app.use( express.static( path.join( __dirname, 'public' )));
// enable CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// defined the base route and return with an HTML file called tempate.html
app.get('/', function(req, res){
  res.sendFile('campus.html', {
     root: path.join( __dirname, 'views' )
   });
})

// define the /search route that should return elastic search results
app.get('/search', function (req, res){
  console.log("searching...")
  // declare the query object to search elastic search and return only 200 results from the first result found.
  // also match any data where the name is like the query string sent in
  //let searchInTitle = functions.inTitle(0, 20, req.query['q']);
  var size = 20;
  var from = parseInt((Number(req.query['page']) - 1) * size);
  //console.log(req.query['page'], from, size, "request");

  let searchInAllFields = functions.inAll(from, size, req.query['q'], "multi_match");
  
  // perform the actual search passing in the index, the search query and the type
  client.search({index:'campus-collection',  body:searchInAllFields})
  .then(results => {
    res.send(results.body);
  })
  .catch(err=>{
    console.log(err)
    res.send([]);
  });

})
// listen on the specified port
app.listen( app.get( 'port' ), function(){
  console.log( 'Express server listening on port ' + app.get( 'port' ));
} );