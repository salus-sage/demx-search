
var controller = {
	getCollection: function(reqUrl){
		console.log(reqUrl);
		var collection = Backbone.Collection.extend({
			url: reqUrl,
			parse: function(data){
				return data['entries']
			}
		});
		
		return new collection;
	},
	hasRouteChanged: function(model){
		if(model.hasChanged()){
			return model.changedAttributes();
		} else return false;
	},
	filterCollection: function(collection, filter){
			var byFilter = filter.toUpperCase();
			console.log(byFilter, "controller filter");
			var filtered =  collection.filter(function(entry){
				if(entry.get('collectionId') == byFilter){
					return entry;
				}
			});
			return filtered;
		
	}
}

M = window.M || {};
M.Controller = controller;