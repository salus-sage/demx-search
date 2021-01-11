M = window.M || {};


var configModel = Backbone.Model.extend({
	apiUrl: "//campuscockpit.test.openrun.net/api/",
	apiPaths: {
		getCollection: "collections/get/"
	},
	apiKey: "account-4c86bd3e58d1f34bea6814b0fae916"
});

var routeModel = Backbone.Model.extend({
	type: "",
	page: 1,
	slug: "",
	action: ""
});

var filterModel = Backbone.Model.extend({
	univ: "JNU",
	year: "2013",
	month: "01"
});

var paginationModel = Backbone.Model.extend({
	perPage: 20,
	skip: 0,
	next: "",
	prev: ""
});

var loadingModel = Backbone.Model.extend({
	show: false
});

// Player global state

var playerState = Backbone.Model.extend({
  selected: 630
});

M.models = {};
M.models.navModel = routeModel;
