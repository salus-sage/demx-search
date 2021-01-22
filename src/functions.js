var client=require ('./connection.js');

function queryTitle (from, size, query, action) {
	// declare the query object to search elastic search and return only 200 results from the first result found.
	// also match any data where the name is like the query string sent in
	let queryBuilder = new Object();
	queryBuilder[action] = {
		"title": query
	}
	let body = {
	  "from": from,
	  "size": size,
	  "query": queryBuilder
	}

	return body;
}

function queryAll (from, size, query, action) {
	let queryBuilder = new Object();
	queryBuilder[action] = {
		"query": query
	}
	let body = {
	  "from": from,
	  "size": size,
	  "query": queryBuilder,
	  "sort": [
	  	{ "title": "asc"}]
	}

	return body;
}

function search (index, body) {
	client.search({index:index,  body:body})
	.then(results => {
		return results.body;
	})
	.catch(err=>{
	  console.log(err)
	  //res.send([]);
	  return err;
	});

}

module.exports = {
	inTitle: queryTitle,
	inAll: queryAll
}