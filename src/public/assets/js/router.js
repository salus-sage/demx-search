M = window.M || {};

M.mainRouter = Backbone.Router.extend({
	  routes: {
	  	//"items/:type(/:univ/:page)": "showCollection",
	  	"filter/:type(/:date)(/:univ)": "showGrouped",
	  	'items/:type?*querystring': 'routeQuery',
	  	'credits': "showCredits",
	  	"home": "defaultAction",
	  	"": "routeToHome"
	  },
	  initialize: function(){
	  	console.log("Router Initialized");
	  	this.model = new M.models.navModel(
	  						{
	  							type: "",
	  							page: 1,
	  							slug: ""
	  						});
	  },
	  routeToHome: function(){
	  	this.navigate('#/home', {trigger: true});
	  },
	  routeQuery: function(type, querystring){
	  	console.log(type, parseQueryString(querystring), "route query");
	  	var queryParams = parseQueryString(querystring);

	  	this.model.set({
	  		slug: type, 
	  		type: queryParams.univ || 'jnu', 
	  		date: queryParams.date || null, 
	  		page: queryParams.page || 1,
	  		action: 'filter'
	  	});

	  },
	  defaultAction: function(action){
	  	console.log("Home page", action);
	  	//M.AppView.cleanup();
	  	this.model.set({slug: "home"});
	  	
	  },
	  showCredits: function(){
	  	console.log("router matched credits page");
	  	this.model.set({slug: "credits"});
	  },
	  showCollection: function(action, type, page){
	  	console.log("COllections page", action, type, page);
	  	//M.AppView.cleanup();
	  	this.model.set({slug: action, type: type, page: Number(page), action: 'items'});
	  },
	  showGrouped: function(action, date, univ){
	  	console.log(action, date, univ);

	  	this.model.set({slug: action, type: univ, date: date, action: 'filter'});

	  }
	});


//function to parse query params
function parseQueryString(queryString)
{
    if (!_.isString(queryString))
        return
    queryString = queryString.substring( queryString.indexOf('?') + 1 )
    var params = {}
    var queryParts = decodeURI(queryString).split(/&/g)
    _.each(queryParts, function(val)
        {
            var parts = val.split('=')
            if (parts.length >= 1)
            {
                var val = undefined
                if (parts.length == 2)
                    val = parts[1]
                params[parts[0]] = val
            }
        })
    return params
}

