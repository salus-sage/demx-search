

var appView = Backbone.View.extend({
	//testTemplate: _.template($("#test-route-template").html()),
  layoutTemplate: _.template($("#collection-view-template").html()),
  listItemTemplate: _.template($("#grouped-item-template").html()),
  filterItemTemplate: _.template($("#filter-item-template").html()),
  
	initialize: function(options){
		//App View to manage application state
		console.log(options, "App view initialized");
		this.apiUrl = "//campuscockpit.test.openrun.net/api/";
		this.getCollectionPath = "collections/get/";
		this.cockpitAcc = "account-4c86bd3e58d1f34bea6814b0fae916";
		this.perPage = 20;
		this.skip = 0;
    this.loadingModel = new loadingModel;
    
    this.listenTo(this.loadingModel, 'change', this.toggleLoading);
		this.listenTo(this.model, 'change', this.render);
    this.listenTo(this.model, 'change:slug', this.fetchCollection);
    
    this.fetchCollection();
	},

	fetchCollection: function(){
		var self = this;
    self.loadingModel.set({show: true});
		self.cleanup();

    console.log("Requested Collection fetch");
    if(self.model.get("slug") !== "home" && self.model.get("slug") !== "credits"){
          //build api url, and initialize backbone collection
          /*var skip = (Number(this.model.get('page'))-1) * Number(this.perPage);
          console.log(skip, "paginate param");*/
            var reqUrl = this.apiUrl+this.getCollectionPath+this.model.get('slug')+/*"?limit="+this.perPage+"&skip="+skip+*/"?sort[sortField]=-1&token="+this.cockpitAcc;
            //console.log(reqUrl, "request url");

            this.collection = M.Controller.getCollection(reqUrl);
            this.collection.fetch().then(function(data){
                self.filterCollection();
                self.render();
                self.loadingModel.set({show: false});
                console.log("finished fetching", new Date().getSeconds());
            });
          } else {
            self.render();
            self.loadingModel.set({show: false});
          } 
		
    
	},
  filterCollection: function(){
    //console.log("Requested filter by JNU || HCU || BHU", this.collection);
    // This looks like voodoo - needs re-factor
    if(this.model.get('type') == "all" ){
      if(this.collection.models.length >0){
        this.filtered = this.collection.models;
      }
      else {
        this.filtered = [];
      }
      
    } else {
      this.filtered = M.Controller.filterCollection(this.collection, this.model.get('type'));
    }
    
    //console.log("filtered collection", this.filtered)
    
    return;
  },
  paginateCollection: function() {
    //console.log("request paginated entries...", this.collection);
    var self = this;
    self.toIdx = self.perPage*Number(self.model.get('page'));
    self.fromIdx = self.toIdx - self.perPage;
    return;

  },
  setDateFilter: function(){
    var self = this;
    self.groupByMonth();
    if(self.model.get('date')){
      self.filtered = self.grouped[self.model.get('date')];
    } else {
      self.filtered = self.filtered;
    }
    console.log(self.grouped, self.filtered);
    return;
  },
  groupByMonth: function(){
    var self = this;
    self.grouped = _.groupBy(self.filtered, function(entry){
      
     if(entry.get('sortField')){
        
        return entry.get('sortField').substring(0,7);
      } else {
        return 'Undated';
      }
      
    });
    return;

  },
  groupByUniversity: function() {
    var self = this;
    var groupedByUniv = self.collection.groupBy(function(entry){
        return entry.get('collectionId');
      
    });
    
    return groupedByUniv;

  },
	render: function(data) {
		//console.log(this.model.toJSON(), data, "render appview");
    var self = this;
    self.cleanup();

    
    if(self.model.get("slug") !== "home" && self.model.get("slug") !== "credits"){
      //console.log("route is not home nor credits,");
      var hasModelChanges = self.model.hasChanged();
      var changedParams = _.keys(M.Controller.hasRouteChanged(self.model));

      var univSel = this.model.get('type');
      if(univSel == "all"){
        univSel = "";
      }
      
      self.$el.html(self.layoutTemplate({
        slug: self.model.get('slug').toUpperCase(),
        selectedUniv: univSel.toUpperCase(),
        selectedDate: self.model.get('date') || '',
        selectedPage: self.model.get('page')
         }));


      self.filterCollection();
      self.setDateFilter();
      self.paginateCollection();
      
      
        
        if(!self.filtered || self.filtered.length <= 0){
          self.filtered = [];
        }

        if(self.model.get("slug") !== "audio"){
          console.log(self.filtered.slice(self.fromIdx, self.toIdx), self.fromIdx, self.toIdx, "check filtereed");
          self.currentView = new collectionView({
                   collection: self.filtered.slice(self.fromIdx, self.toIdx)               
            });
          console.log(self.currentView.$el);
        } else if(self.model.get("slug") == "audio" && self.filtered.length > 0) {
          console.log("rendering audio view");
          var playerStateInstance = new playerState({selected: ""});
          self.currentView = new AudioPlayerView({
            data: self.filtered,
            model: playerStateInstance
          });

        }
        
        self.$el.find("#series").append(self.currentView.$el);
       
          if(self.model.get("slug") == "audio") {
            //hack: this hook to handle audio player view 
            // shud not be in appView
            _.defer(function(){
              setupPlaylist();
              self.$el.find('#paginated_songs').paginate({itemsPerPage: 8});
            });
            
          } else {
            // *incomplete - init 3rd party slider plugin
            ///self.$el.find("#series").lightGallery();
            //hack to remove th alst empty div
            _.defer(function(){
              self.$el.find("#items-grid-wrap").lightGallery({
                selector: '.item',
                hash: false,
                share: false,
                zoom: true,
                download: false,
                autoplayControls: false,
                appendSubHtmlTo: '.lg-item',
                enableDrag: true,
                enableTouch: true,
                preload: 2
              });
            });
            
          } 

        self.renderFilters();
    } else if(self.model.get("slug") == "home") {
      //console.log("Rendering home");
      self.currentView = new homeView();
      this.$el.html(self.currentView.$el);
      //call slider lib
      _.defer(function(){
        self.homeSwiper = new Swiper('#home-page .main-slider', {
                      
                        direction: 'horizontal',
                        pagination: '.swiper-pagination',
                        nextButton: '.swiper-button-next',
                        prevButton: '.swiper-button-prev',
                        paginationClickable: true,
                        centeredSlides: false,
                        // Disable preloading of all images
                        preloadImages: true,
                        lazy: true
                    });

      });
      
    } else if (self.model.get("slug") == "credits") {
      //console.log("Rendering credits");
      self.currentView = new creditsView();
      this.$el.html(self.currentView.$el);
    }
    
    return;

	},
  renderFilters: function(){
    this.filterByUniv = ["JNU", "HCU", "BHU"];
    this.filterByYear = _.keys(this.grouped);
    this.sortByDate = ["Latest", "Oldest"];
    this.paginatedLinks = _.range(Math.ceil(this.filtered.length/this.perPage));
    //console.log(this.paginatedLinks);
    var activeUnivs = _.keys(this.groupByUniversity());
    var isUnivInActive = function(univ){

      var foundOrNot = activeUnivs.indexOf(univ);
      console.log(foundOrNot, univ, activeUnivs);
      if(foundOrNot >= 0){
        return true;
      } else {
        return false;
      }
    }
    this.filterByUniv.forEach(function(univ){

      this.$el.find("#filter-by-univ").append(this.filterItemTemplate({
              key: univ,
              count: '',
              slug: isUnivInActive(univ) ? '#/items/'+M.AppView.model.get('slug')+'?univ='+univ.toLowerCase() : '#/items/'+M.AppView.model.get('slug')+"?univ=all",
              disable: isUnivInActive(univ) ? "" : "disabled"
            }));
    }, this);

    this.filterByYear.forEach(function(year){
      this.$el.find("#filter-by-year").append(this.filterItemTemplate({
            key: year, 
            count: this.grouped[year].length, 
            slug: "#/items/"+M.AppView.model.get('slug')+'?univ='+this.model.get('type')+'&date='+year,
            disable: ''
          }));
    }, this);
    
    this.sortByDate.forEach(function(sort){
      this.$el.find("#sort-by-date").append(this.filterItemTemplate({
            key: sort, slug: "#", count: '', disable: ""}));
    }, this);

    this.paginatedLinks.forEach(function(pageNo){
      var pageno = Number(pageNo)+1;
      var date = this.model.get('date') || "";

      this.$el.find("#paginated-pages").append(this.filterItemTemplate({
            key: pageno, 
            slug: "#/items/"+M.AppView.model.get('slug')+
                  '?univ='+this.model.get('type')+
                  '&date='+date+
                  '&page='+pageno, 
            count: '',
            disable: ''
          }));
    }, this)  ;

    //console.log(this.model);

  },
  toggleLoading: function(){
    //console.log("fetching data", new Date().getSeconds());
    var loadingOverlay = $('#loading-overlay');
    loadingOverlay.toggleClass('show');
  },
  cleanup: function(){
		if(this.currentView){
			this.currentView.cleanup();
			this.currentView.unbind();
			this.currentView.remove();
		} else {
			this.$el.html('');
		}
	}
});


// Home view
var homeView = Backbone.View.extend({
  template: _.template($("#home-page-template").html()),
  initialize: function() {
    this.render();
  },
  render: function() {
    this.$el.html('');
    this.$el.append(this.template());
    return;
  },
  cleanup: function() {
    this.$el.html('');
    this.$el.remove();
  }
});

// creidts page view

var creditsView = Backbone.View.extend({
  template: _.template($("#credits-page-template").html()),
  initialize: function() {
    this.render();
  },
  render: function() {
    this.$el.html('');
    this.$el.append(this.template());
    return;
  },
  cleanup: function() {
    this.$el.html('');
    this.$el.remove();
  }
});

// COllection View
var collectionView = Backbone.View.extend({
	tagName: 'div',
  id: 'items-grid-wrap',
	initialize: function(options){
	  var self = this;
	  self.options = options;
	  //console.log(options, "Collection View init -- route options a nd prams");
	  self.collection = new Backbone.Collection(options.collection);
	  self.childViews = [];

	  self.render();
	},
	render: function() {
	  //console.log("render");
	  var self = this;

	   self.collection.each(function(item, i){
	   	//console.log(item, "checking map");
	    self.childViews.push(new itemView({
	      model: item, 
	      idx: i,
	      parent:self
	    }));
	  }, self);

	},
	cleanup: function() {
	    var _childViewsDump = [].concat(this.childViews);
	    this.childViews = [];

	    while (_childViewsDump.length > 0) {
	        var currentView = _childViewsDump.shift();
	        // defer the removal as it's less important for now than rendering.
	        _.defer(currentView.remove.bind(currentView));
	    }
	}
});


// Render Items per type
var itemView = Backbone.View.extend({
    imageTemplate: _.template($("#image-item-template").html()),
    videoTemplate: _.template($("#video-item-template").html()),
    audioTemplate: _.template($("#audio-item-template").html()),
    linkTemplate: _.template($("#link-item-template").html()),
    subTemplate: _.template($("#sub-template").html()),
    initialize: function(options){
      //console.log(options, "item view options");
      var self = this;
      self.model = options.model;
      self.parent = options.parent.$el;//M.AppView.$el.find("#series");
      self.index = options.index;
      self.idx = options.idx;
      self.type = self.model.get('type');
      self.rendered = false;
      self.dataId = self.model.get('_id');
 
      self.render();
    },
    
    render: function() {
      var self = this;

      //if(self.type === "Born Digital Image" || self.type === "Born Digital Moving Image (Videos)"){
         // console.log(self.type, "passed render check type");
        var title = self.model.get('title') || "",
        description = self.model.get('description') || "",
        //creator = self.model.get('creator').text || "",
        contributor = self.model.get('contributor') || "",
        date = self.model.get('date') || "",
        source = self.model.get('source') || "",
        coverage = self.model.get('coverage') || "";
        original = self.model.get('fileUrl') || "";
        thumbnail = self.model.get('thumbnail') || "";
        
       if(description.indexOf('"') > 0){
          description = description.replace(/"/g, '&quot;');
        }
        if(description.indexOf("'") > 0){
          description = description.replace(/'/g, '&lsquo;');
        }
        if(title.indexOf("'") > 0){
          title = title.replace(/'/g, '&lsquo;');
        }
        if(title.indexOf('"') > 0){
          title = title.replace(/"/g, '&quot;');
        }
        //console.log(description.indexOf(/"/g), original, source, "double quotes");
        var metaSubhtml = self.subTemplate({
          title: title,
          description: description,
          contributor: contributor,
          date: date,
          source: source,
          original: original,
          coverage: coverage
        });
        //console.log(original, metaSubhtml, "pdf link");
        self.model.set({
                        subHTML: '<h4>'+title+'</h4>', 
                        metaHTML: metaSubhtml 
                      });

      //}
      //self.cleanup();
      switch(self.type) {
         case "Born Digital Image":         
         case "Digital Image":
         case "Scanned Manuscript":
         case "Scanned Image":
         case "Scan Image":
          self.parent.append(self.imageTemplate(self.model.toJSON()));
          break;

         
         case "Born Digital Text":
          self.parent.append(self.linkTemplate(self.model.toJSON()));
          break;

         case "Born Digital Moving Image (Videos)":
         case "Born Digital Moving Image (Video)":
         case "Video":
         case "video":
          self.parent.append(self.videoTemplate(self.model.toJSON()));
          break;
         
         case "Oral History":
           var splitTitle = self.model.get('title').text.split(" ");
           var interviewee = splitTitle.slice(0, splitTitle.indexOf('interview')).join(" ");
           var interviewer = splitTitle.slice(splitTitle.indexOf('interview'), splitTitle.length).join(" ");
           console.log(interviewee, interviewer, self.model);
           self.model.set({"interviewer": interviewer, "interviewee": interviewee})
           self.parent.$el.append(self.audioTemplate(self.model.toJSON()));
           //self.audioEvents();
          break;

          

         default: 
          console.log("Unknown type", self.type, self);

      }
     
            
      self.rendered=true;
      
   
    }

  });

