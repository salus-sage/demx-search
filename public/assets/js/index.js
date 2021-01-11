$(document).ready(function(){
	console.log("App initialize");
	M = window.M || {};

	M.Navigator = new M.mainRouter;
	Backbone.history.start();

	M.AppView = new appView({
				el: "#m-app",
				model: M.Navigator.model
			});

});