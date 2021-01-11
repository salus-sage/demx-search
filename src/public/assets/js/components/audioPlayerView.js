




// Player setup

function setupPlaylist(){
  plyr.setup(document.querySelector('.plyr'));
  var radio = document.querySelector('.plyr').plyr;

  var player = document.querySelector('.playlist');
  var songs = player.querySelectorAll('.playlist--list li');
  var i;
  var active = null;

  for(i = 0; i < songs.length; i++) {
    songs[i].onclick = changeChannel;
  }
  console.log(songs, "cojsn")
  setSource( getId(songs[0]), buildSource(songs[0]) );

  document.querySelector('.plyr').addEventListener('ended', nextSong);

  function changeChannel(e) { 
    console.log(e.currentTarget, "click target");
    M.AppView.currentView.model.set({selected: getId(e.currentTarget)});
    //playerStateInstance.set({selected: getId(e.currentTarget)});
    setSource( getId(e.currentTarget), buildSource(e.currentTarget), true );
  }

  function getId(el) {

    if(el){
      return el.getAttribute('data-id');
    }
    
  }

  function buildSource(el) {
    //console.log(el.getAttribute('data-format'));
    if(el){
      var obj = [{
        src: el.getAttribute('data-audio'),
        type: el.getAttribute('data-format')
      }];

      return obj;
    }
    else return []; 
    
  }

  function setSource(selected, sourceAudio, play) {
  
    if(active !== selected) {
      active = selected;
      radio.source({
        type: 'audio',
        title: 'Campus Uprisings',
        sources: sourceAudio
      });

      for(var i = 0; i < songs.length; i++) {
        if(Number(songs[i].getAttribute('data-id')) === selected) {
          songs[i].className = 'active';
        } else {
          songs[i].className = '';
        }
      }

      if(play) {
        radio.play();
      }
    } else {
      radio.togglePlay();
    }
  }

  function nextSong(e) {
    var next = active + 1;

    if(next < songs.length) {
      setSource( getId(songs[next]), buildSource(songs[next]), true );
    }
  }

  return;
}


AudioPlayerView = Backbone.View.extend({
  songTemplate: _.template($("#plyr-song-template").html()),
  playerShell: _.template($("#plyr-player-template").html()),
  metaTemplate: _.template($("#oh-meta-template").html()),
  initialize: function(options){
    console.log(this.$el, options);
    var self = this;
    self.model = options.model;
    self.remoteData = new Backbone.Collection(options.data);
    self.render();
    self.listenTo(self.model, 'change', self.trackChanged);
    /*this.remoteData = new Backbone.Collection();
    self.listenTo(playerStateInstance, 'change:selected', self.trackChanged);
    this.remoteData.fetch({
            url: 'http://campuscockpit.test.openrun.net/api/collections/get/interviews?token=account-691964ea72e57bcfac72e411664ee6'
          }).then(function(response){
              console.log(response, "Backbone collecion router");
              //  Sort collection by title
              self.remoteData.comparator = function(model){
                return model.get('title');
              }
              // Add models of OH
              self.remoteData.set(response.entries);
              // call render 
              self.render();
            });  
            */        

  },
  render: function() {
    var self = this;

    // render player shell
    self.$el.html(self.playerShell());

    //prepare and render playlist
    var $songs = self.remoteData.map(function(item){
      //  console.log(item);
      var splitTitle = item.get('title').split(" ");
      var interviewee = splitTitle.slice(0, splitTitle.indexOf('interview')).join(" ");
      var interviewer = splitTitle.slice(splitTitle.indexOf('interview'), splitTitle.length).join(" ");
      var description = item.get('description') || "";
    
      item.set({"interviewer": interviewer, 
        "interviewee": interviewee, 
        "more": description
      });
      if(item.toJSON().fileUrl){
        item.set({"format": "audio/mpeg"});
        //var modifiedAudioUrl = 'assets/audio/'+item.get('files').original_filename.split('.')[0]+'.webm';
        //console.log(item.get('title').text);
       // var modifiedAudioUrl = 'assets/audio-new/'+item.get('title').text+'.mp3';
        //console.log(modifiedAudioUrl);
        //console.log(item.toJSON().fileUrl, "check fileUrl");
        item.set({convertedAudio: item.get('fileUrl')});
        //return self.songTemplate(item.toJSON());
      } else {
        
       item.set({"convertedAudio":  "https://www.free-stock-music.com/music/mixaund-inspire-and-motivate.mp3",
                  "format": "audio/mpeg"
                });
       // console.log(item.toJSON(), "items without files");
      
      }
      //console.log(item.toJSON(), "check var format");
      return self.songTemplate(item.toJSON());
    });
    self.$el.find('.playlist--list').html(_.compact($songs));
    console.log($songs);

    // remove css grid class for OH view along
    self.$el.css("display", "block");

    //call thirdparty jquery paginate
    console.log(self.$el.find('#paginated_songs'), "audio player");
      //self.$el.find('#paginated_songs').paginate({itemsPerPage: 8});

    if(self.remoteData.models[0]){
      self.$el.find("#audio-meta").html(self.metaTemplate(self.remoteData.models[0].toJSON()));
    }
    
    //call thirdparty player
    //setupPlaylist();

    var overlayEl = $('.load-overlay');
    overlayEl.removeClass('fadeIn');
    overlayEl.addClass('fadeOut delay-5s');
    //$('body').addClass('fadeIn delay-5s');
    _.defer(function(){
      overlayEl.css('display', 'none');
    });
    

    
  },
  trackChanged: function(){
    var self = this;
    var selectedModel = self.remoteData.find({
                          _id: self.model.get('selected')
                        });
    console.log(selectedModel, self.model.get('selected'), "selected audio");
   /* if(selectedModel.get('more')){
      self.$el.find("#audio-meta").html(self.metaTemplate(selectedModel.toJSON()));
    } else {
      self.$el.find("#audio-meta").html('');
    }*/
    self.$el.find("#audio-meta").html(self.metaTemplate(selectedModel.toJSON()));
   // console.log(selectedModel.toJSON(), selectedModel);
    //self.sendAnalyticsHit(selectedModel);
    return;
    
  },
  sendAnalyticsHit: function(model){
    var path = '/'+model.get('interviewee');
    console.log(path);
    const tracker = window.ga.getAll()[0]; 
    if (tracker && tracker.set && tracker.send) { 
      console.log("in tracker", window.location.hash.split('#')[1]);
      tracker.set('page', path) 
      tracker.send('pageview') 
    }
    return;
  },
  cleanup: function() {
      
          var currentView = this;

          // defer the removal as it's less important for now than rendering.
          _.defer(currentView.remove.bind(currentView));
      }
});


