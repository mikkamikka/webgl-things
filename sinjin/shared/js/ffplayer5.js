//FFPlayer 2.0 by Ezra Miller & Sinjin Hawke

/* Soundcloud API */
(function(){var requirejs,require,define,__inflate;(function(e){function a(e,t){var n=t&&t.split("/"),i=r.map,s=i&&i["*"]||{},o,u,a,f,l,c,h;if(e&&e.charAt(0)==="."&&t){n=n.slice(0,n.length-1),e=n.concat(e.split("/"));for(l=0;h=e[l];l++)if(h===".")e.splice(l,1),l-=1;else if(h===".."){if(l===1&&(e[2]===".."||e[0]===".."))return!0;l>0&&(e.splice(l-1,2),l-=2)}e=e.join("/")}if((n||s)&&i){o=e.split("/");for(l=o.length;l>0;l-=1){u=o.slice(0,l).join("/");if(n)for(c=n.length;c>0;c-=1){a=i[n.slice(0,c).join("/")];if(a){a=a[u];if(a){f=a;break}}}f=f||s[u];if(f){o.splice(0,l,f),e=o.join("/");break}}}return e}function f(t,n){return function(){return u.apply(e,s.call(arguments,0).concat([t,n]))}}function l(e){return function(t){return a(t,e)}}function c(e){return function(n){t[e]=n}}function h(r){if(n.hasOwnProperty(r)){var s=n[r];delete n[r],i[r]=!0,o.apply(e,s)}if(!t.hasOwnProperty(r))throw new Error("No "+r);return t[r]}function p(e,t){var n,r,i=e.indexOf("!");return i!==-1?(n=a(e.slice(0,i),t),e=e.slice(i+1),r=h(n),r&&r.normalize?e=r.normalize(e,l(t)):e=a(e,t)):e=a(e,t),{f:n?n+"!"+e:e,n:e,p:r}}function d(e){return function(){return r&&r.config&&r.config[e]||{}}}var t={},n={},r={},i={},s=[].slice,o,u;o=function(r,s,o,u){var a=[],l,v,m,g,y,b;u=u||r,typeof o=="string"&&(o=__inflate(r,o));if(typeof o=="function"){s=!s.length&&o.length?["require","exports","module"]:s;for(b=0;b<s.length;b++){y=p(s[b],u),m=y.f;if(m==="require")a[b]=f(r);else if(m==="exports")a[b]=t[r]={},l=!0;else if(m==="module")v=a[b]={id:r,uri:"",exports:t[r],config:d(r)};else if(t.hasOwnProperty(m)||n.hasOwnProperty(m))a[b]=h(m);else if(y.p)y.p.load(y.n,f(u,!0),c(m),{}),a[b]=t[m];else if(!i[m])throw new Error(r+" missing "+m)}g=o.apply(t[r],a);if(r)if(v&&v.exports!==e&&v.exports!==t[r])t[r]=v.exports;else if(g!==e||!l)t[r]=g}else r&&(t[r]=o)},requirejs=require=u=function(t,n,i,s){return typeof t=="string"?h(p(t,n).f):(t.splice||(r=t,n.splice?(t=n,n=i,i=null):t=e),n=n||function(){},s?o(e,t,n,i):setTimeout(function(){o(e,t,n,i)},15),u)},u.config=function(e){return r=e,u},define=function(e,t,r){t.splice||(r=t,t=[]),n[e]=[e,t,r]},define.amd={jQuery:!0}})(),__inflate=function(name,src){var r;return eval(["r = function(a,b,c){","\n};\n//@ sourceURL="+name+"\n"].join(src)),r},define("lib/api/events",["require","exports","module"],function(e,t,n){t.api={LOAD_PROGRESS:"loadProgress",PLAY_PROGRESS:"playProgress",PLAY:"play",PAUSE:"pause",FINISH:"finish",SEEK:"seek",READY:"ready",OPEN_SHARE_PANEL:"sharePanelOpened",CLICK_DOWNLOAD:"downloadClicked",CLICK_BUY:"buyClicked",ERROR:"error"},t.bridge={REMOVE_LISTENER:"removeEventListener",ADD_LISTENER:"addEventListener"}}),define("lib/api/getters",["require","exports","module"],function(e,t,n){n.exports={GET_VOLUME:"getVolume",GET_DURATION:"getDuration",GET_POSITION:"getPosition",GET_SOUNDS:"getSounds",GET_CURRENT_SOUND:"getCurrentSound",GET_CURRENT_SOUND_INDEX:"getCurrentSoundIndex",IS_PAUSED:"isPaused"}}),define("lib/api/setters",["require","exports","module"],function(e,t,n){n.exports={PLAY:"play",PAUSE:"pause",TOGGLE:"toggle",SEEK_TO:"seekTo",SET_VOLUME:"setVolume",NEXT:"next",PREV:"prev",SKIP:"skip"}}),define("lib/api/api",["require","exports","module","lib/api/events","lib/api/getters","lib/api/setters"],function(e,t,n){function m(e){return!!(e===""||e&&e.charCodeAt&&e.substr)}function g(e){return!!(e&&e.constructor&&e.call&&e.apply)}function y(e){return!!e&&e.nodeType===1&&e.nodeName.toUpperCase()==="IFRAME"}function b(e){var t=!1,n;for(n in i)if(i.hasOwnProperty(n)&&i[n]===e){t=!0;break}return t}function w(e){var t,n,r;for(t=0,n=f.length;t<n;t++){r=e(f[t]);if(r===!1)break}}function E(e){var t="",n,r,i;e.substr(0,2)==="//"&&(e=window.location.protocol+e),i=e.split("/");for(n=0,r=i.length;n<r;n++){if(!(n<3))break;t+=i[n],n<2&&(t+="/")}return t}function S(e){return e.contentWindow?e.contentWindow:e.contentDocument&&"parentWindow"in e.contentDocument?e.contentDocument.parentWindow:null}function x(e){var t=[],n;for(n in e)e.hasOwnProperty(n)&&t.push(e[n]);return t}function T(e,t,n){n.callbacks[e]=n.callbacks[e]||[],n.callbacks[e].push(t)}function N(e,t){var n=!0,r;return t.callbacks[e]=[],w(function(t){r=t.callbacks[e]||[];if(r.length)return n=!1,!1}),n}function C(e,t,n){var r=S(n),i,s;if(!r.postMessage)return!1;i=n.getAttribute("src").split("?")[0],s=JSON.stringify({method:e,value:t}),i.substr(0,2)==="//"&&(i=window.location.protocol+i),i=i.replace(/http:\/\/(w|wt).soundcloud.com/,"https://$1.soundcloud.com"),r.postMessage(s,i)}function k(e){var t;return w(function(n){if(n.instance===e)return t=n,!1}),t}function L(e){var t;return w(function(n){if(S(n.element)===e)return t=n,!1}),t}function A(e,t){return function(n){var r=g(n),i=k(this),s=!r&&t?n:null,o=r&&!t?n:null;return o&&T(e,o,i),C(e,s,i.element),this}}function O(e,t,n){var r,i,s;for(r=0,i=t.length;r<i;r++)s=t[r],e[s]=A(s,n)}function M(e,t,n){return e+"?url="+t+"&"+_(n)}function _(e){var t,n,r=[];for(t in e)e.hasOwnProperty(t)&&(n=e[t],r.push(t+"="+(t==="start_track"?parseInt(n,10):n?"true":"false")));return r.join("&")}function D(e,t,n){var r=e.callbacks[t]||[],i,s;for(i=0,s=r.length;i<s;i++)r[i].apply(e.instance,n);if(b(t)||t===o.READY)e.callbacks[t]=[]}function P(e){var t,n,r,i,s;try{n=JSON.parse(e.data)}catch(u){return!1}t=L(e.source),r=n.method,i=n.value;if(t&&H(e.origin)!==H(t.domain))return!1;if(!t)return r===o.READY&&a.push(e.source),!1;r===o.READY&&(t.isReady=!0,D(t,l),N(l,t)),r===o.PLAY&&!t.playEventFired&&(t.playEventFired=!0),r===o.PLAY_PROGRESS&&!t.playEventFired&&(t.playEventFired=!0,D(t,o.PLAY,[i])),s=[],i!==undefined&&s.push(i),D(t,r,s)}function H(e){return e.replace(h,"")}var r=e("lib/api/events"),i=e("lib/api/getters"),s=e("lib/api/setters"),o=r.api,u=r.bridge,a=[],f=[],l="__LATE_BINDING__",c="http://wt.soundcloud.dev:9200/",h=/^http(?:s?)/,p,d,v;window.addEventListener?window.addEventListener("message",P,!1):window.attachEvent("onmessage",P),n.exports=v=function(e,t,n){m(e)&&(e=document.getElementById(e));if(!y(e))throw new Error("SC.Widget function should be given either iframe element or a string specifying id attribute of iframe element.");t&&(n=n||{},e.src=M(c,t,n));var r=L(S(e)),i,s;return r&&r.instance?r.instance:(i=a.indexOf(S(e))>-1,s=new p(e),f.push(new d(s,e,i)),s)},v.Events=o,window.SC=window.SC||{},window.SC.Widget=v,d=function(e,t,n){this.instance=e,this.element=t,this.domain=E(t.getAttribute("src")),this.isReady=!!n,this.callbacks={}},p=function(){},p.prototype={constructor:p,load:function(e,t){if(!e)return;t=t||{};var n=this,r=k(this),i=r.element,s=i.src,a=s.substr(0,s.indexOf("?"));r.isReady=!1,r.playEventFired=!1,i.onload=function(){n.bind(o.READY,function(){var e,n=r.callbacks;for(e in n)n.hasOwnProperty(e)&&e!==o.READY&&C(u.ADD_LISTENER,e,r.element);t.callback&&t.callback()})},i.src=M(a,e,t)},bind:function(e,t){var n=this,r=k(this);return r&&r.element&&(e===o.READY&&r.isReady?setTimeout(t,1):r.isReady?(T(e,t,r),C(u.ADD_LISTENER,e,r.element)):T(l,function(){n.bind(e,t)},r)),this},unbind:function(e){var t=k(this),n;t&&t.element&&(n=N(e,t),e!==o.READY&&n&&C(u.REMOVE_LISTENER,e,t.element))}},O(p.prototype,x(i)),O(p.prototype,x(s),!0)}),window.SC=window.SC||{},window.SC.Widget=require("lib/api/api")})()


/* Mobile Detect */
var isMobile = false;

(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))isMobile = true})(navigator.userAgent||navigator.vendor||window.opera);

/*! PLAYER CODE */

// ffplayer.init();

function FFPlayer( OPTIONS ) {

    /**
     options
     -------
     mode:
     'credits' 		-- just credits
     'audio'	  		-- plays an mp3 from server
     'audio playlist'-- plays groups of mp3s (next button)
     'sc'			-- plays track using soundcloud api
     'sc playlist'   -- plays playlist off sc api (next button)
     src:
     audio, audio playlist mode -- path/audio.mp3
     sc, sc playlist mode 	   -- soundcloud track id
     volume:
     true/false -- allows user to have volume control
     download:
     true/false -- allows user to download mp3 file/soundcloud link
     share:
     true/false -- allows user to share track
     */

    this.imgRoot = OPTIONS.imgRoot || 'img/';
    this.loop = OPTIONS.loop || false;

    this.mode = OPTIONS.mode || 'audio';
    this.src = OPTIONS.src || '';
    this.volume = OPTIONS.volume || false;
    this.download = OPTIONS.download || false;
    this.embed = OPTIONS.embed || false;
    this.title = OPTIONS.title || "";
    this.artist = OPTIONS.artist || "";
    this.songTitle = OPTIONS.songTitle || "";
    this.autoPlay = OPTIONS.autoPlay || false;
    this.embedCode = OPTIONS.embedCode || "";
    this.downloadLink = OPTIONS.downloadLink || "";
    this.link = OPTIONS.link || false;
    this.volume = 1.0;

    // this.downloadPage = OPTIONS.downloadPage || true;
    // this.description = "<i> Visual at <a href='http://fractalfantasy.net' target='_blank'>Fractal Fantasy</a> </i>";

    if ( OPTIONS.description ) {

        this.description = " - " + OPTIONS.description;

    } else {

        this.description = "";

    }

    this.useTracklist = OPTIONS.useTracklist || false;

    this.playButton;
    this.playButtonState = -1; // 1: loadingbutton, 2: pause, 3: play

    this.song, this.moveplayhead, this.mouseUp, this.mouseDown;
    this.playlist;

    this.callbacks = {};

    var currentPlaylistIndex = 0;
    var that = this;

    var playNextSong = true;

    this.createCredits = function() {

        this.credits = document.createElement( "ul" );
        this.credits.id = "credits";
        this.credits.innerHTML = "<div class='left'><li><b id='playerTitle'>"+ this.title + "</b>&nbsp | &nbsp<span id='playerArtist'>" + this.artist + "</span><br><span id='timer'>0:00</span><span id='playerDescription'>" + this.description + "</span><br> <div id='d_debug' class='embedtxt'></div><div id='titleContainer'><span id='trackTitle'></span></div></li></div>";

    };

    this.createPlayhead = function() {

        this.playhead = document.createElement( "div" );
        this.playhead.id = "playhead";

    };

    this.createTimeline = function(){

        this.timeline = document.createElement( "div" );
        this.timeline.id = "timeline";

        if ( this.mode === "sc playlist" ||
            this.mode === "audio playlist" ) {

            this.timeline.className = "timelinePlaylist";

        }

        this.timeline.appendChild( this.credits );
        this.timeline.appendChild( this.playhead );
        this.audioContainer.appendChild( this.timeline );

    };

    this.createIcons = function(){

        this.icons = [];
        this.iconIds = [ "volumeContainer", "halfContainer", "muteContainer" ];

        this.iconMarkups = [
            '<img id="volume" class="volume demo-icon icon-volume-up volume-icn" src="' + this.imgRoot + 'volume-full.svg" alt="">',
            '<img id="half" class="volume demo-icon icon-half volume-icn" src="' + this.imgRoot + 'volume-half.svg" alt="">',
            '<img id="mute" class="volume demo-icon icon-mute volume-icn" src="' + this.imgRoot + 'volume-mute.svg" alt="">'
        ]

        for ( var i = 0; i < 3; i ++ ) {

            this.icons[i] = document.createElement("div");
            this.icons[i].id = this.iconIds[i];

            if ( this.embed ) {

                this.icons[i].innerHTML = '<a class="embed-button"><img class="demo-icon icon-download download download-icn" src="' + this.imgRoot + 'embed.svg" alt=""></a>';

            }

            if ( this.download ) {

                this.icons[i].innerHTML += '<a class="download-button" '+ (this.link ? '' : 'download=""') +'target="_blank" href='+ this.downloadLink +'><img class="demo-icon icon-download embed embed-icn" src="' + this.imgRoot + 'download.svg" alt=""></a>';

            }

            if ( this.volume ) {

                this.icons[i].innerHTML += '<a class="volume-button">' + this.iconMarkups[i] + '</a>';

            }

            this.iconContainer.appendChild( this.icons[i] );

        }

        this.embedIcon = document.createElement("div");
        this.embedIcon.className = "container-share-embed";
        // this.embedIcon.innerHTML = '<div class="block-embed"><form class="block-embed-form"><label for="btn-input-embed">EMBED</label><input id="btn-input-embed" type="text" value="<iframe width=&quot;80%&quot; height=&quot;61&quot; scrolling=&quot;no&quot; frameborder=&quot;0&quot; src=&quot;http://fractalfantasy.net/ffplayer.html&quot;></iframe>"><br><label for="btn-input-embed">URL</label><input id="btn-input-embed" type="text" value="http://fractalfantasy.net/#/3/mixtape"></form></div>';
        this.embedIcon.innerHTML = this.embedCode;
        this.iconContainer.appendChild( this.embedIcon );

    };

    this.createPlayer = function(){

        this.container = document.createElement("div");

        this.playButton = document.createElement("button");
        this.playButton.id = "pButton";
        this.playButton.className = "play";
        this.playButtonState = 3;

        if( this.mode === "sc playlist" ||
            this.mode === "audio playlist" ){

            this.nextButton = document.createElement("button");
            this.nextButton.id = "fwd";
            this.nextButton.className = "next";

        }

        this.audioContainer = document.createElement("div");
        this.audioContainer.id = "audioplayer";
        this.iconContainer = document.createElement("div");
        this.iconContainer.id = "icons";

        this.container.appendChild(this.playButton);

        if( this.mode === "sc playlist" ||
            this.mode === "audio playlist" ){

            this.container.appendChild(this.nextButton);

        }

        this.container.appendChild(this.audioContainer);
        this.container.appendChild(this.iconContainer);

        this.createCredits();
        this.createPlayhead();
        this.createTimeline();
        this.createIcons();

        document.body.appendChild(this.container);

    };

    this.init = function(){

        this.createPlayer();
        this.initMusic();

    };

    this.createSong = function( src ) {

        this.song = document.createElement("audio");
        //this.song = document.getElementById('music');

        this.song.preload = "auto";
        this.song.src = src;

        var alreadyPlayed = false;

        this.song.getDuration = function() {

            return this.duration;

        };

        this.song.getState = function() {

            if( ! this.paused ) {

                return "playing";

            } else if ( this.seeking ) {

                return "seeking";

                // } else if (this.loading){
                // 	return "loading";
                // } else if (this.initialize){
                // 	return "initialize";

            } else if ( this.paused ) {

                return "paused";

            }

        }

        this.song.getCurrentPosition = function() {

            return this.currentTime;

        };

        this.song.seek = function( time ) {

            this.currentTime = time;

        };

        this.song.setVolume = function( val ) {

            this.volume = val;

        };

        this.song.addEventListener( "timeupdate", function() {

            that.update();

        } );

        this.song.addEventListener( "canplaythrough", function() {

            // if(!alreadyPlayed){

            if ( OPTIONS.autoPlay ) {

                this.play();

            }

            // play();
            //alert(src+" canplaythrough");
            // }
            // alreadyPlayed = true;

        } );

        this.song.addEventListener( "ended", function() {

            if ( that.mode === "audio playlist" ) {

                skip();

                //alert(src+" ended");

            }

        } );

    };

    this.initMusic = function() {

        if ( this.mode === "audio" ) {

            document.getElementById('playerTitle').innerHTML = that.title;
            document.getElementById('playerArtist').innerHTML = that.artist;

            if ( that.songTitle && ! that.useTracklist ) {

                document.getElementById('titleContainer').innerHTML = that.songTitle;

            }

            this.createSong( this.src );

            // this.song.volume = this.volume;

        } else if ( this.mode === "sc" ) {

            SC.initialize({
                client_id: "ad877fecc7527d59d980232be493f705"
            });

            //220575924
            // SC.stream("/playlists/115049597", {

            SC.get("/tracks/" + this.src, {

                autoPlay: !isMobile && OPTIONS.autoPlay,
                useHTML5Audio: true,
                preferFlash: false

            }, function(sound){

                that.playlist = sound;

                if(that.title.length > 0){

                    document.getElementById('playerTitle').innerHTML = that.title;

                } else {

                    document.getElementById('playerTitle').innerHTML = that.playlist.title;

                }

                if(that.artist.length > 0){

                    document.getElementById('playerArtist').innerHTML = that.artist;

                } else {

                    document.getElementById('playerArtist').innerHTML = that.playlist.user.username;

                }

                SC.stream("/tracks/" + sound.id, {

                    autoPlay: !isMobile && OPTIONS.autoPlay,
                    useHTML5Audio: true,
                    preferFlash: false

                }, function( sound ) {

                    that.song = sound;
                    that.song.setVolume( that.volume )
                    that.song._player.on( "buffering", function( state ) {

                        console.log( "buffering ");
                        that.update();

                    } );

                    that.song._player.on( "positionChange", function( state ) {

                        that.update();

                    } );

                    that.playButton.style.display = "block";

                } );

            } );

        } else if ( this.mode === "audio playlist" ) {

            this.createSong( this.src[0] );

        } else if ( this.mode === "sc playlist" ) {

            SC.initialize( { client_id: "ad877fecc7527d59d980232be493f705" } );

            //220575924
            // SC.stream("/playlists/115049597", {

            SC.get("/playlists/" + this.src, {

                autoPlay: !isMobile && OPTIONS.autoPlay,
                useHTML5Audio: true,
                preferFlash: false

            }, function(sound) {

                that.playlist = sound;

                if(that.title.length > 0){

                    document.getElementById('playerTitle').innerHTML = that.title;

                } else {

                    document.getElementById('playerTitle').innerHTML = that.playlist.title;

                }

                if(that.artist.length > 0){

                    document.getElementById('playerArtist').innerHTML = that.artist;

                } else {

                    document.getElementById('playerArtist').innerHTML = that.playlist.user.username;

                }
                // that.credits.innerHTML = "<div class='left'><li><b>"+ that.title + "</b> | " + this.artist + "<br><span id='timer'>0:00</span> - " + this.description + "<br> <div id='d_debug' class='embedtxt'></div><div id='titleContainer'><span id='trackTitle'></span></div></li></div>";

                SC.stream("/tracks/" + sound.tracks[currentPlaylistIndex].id, {

                    autoPlay: !isMobile  && OPTIONS.autoPlay,
                    useHTML5Audio: true,
                    preferFlash: false

                }, function(sound) {

                    console.log(sound)

                    that.song = sound;
                    that.song.setVolume( that.volume )
                    that.song._player.on( "positionChange", function( state ) {

                        that.update();

                    } );

                    that.song._player.on( "stateChange", function( state ) {

                        if ( state === "ended" ) {

                            skip();

                        }

                    } );

                    that.playButton.style.display = "block";

                } );

            } );
        }

    }

    var playerTitle = document.getElementById('playerTitle');
    var playerArtist = document.getElementById('playerArtist');
    var playerDescription = document.getElementById('playerDescription');

    this.init();

    var renderer;
    var duration; // Duration of audio clip

    var pButton = this.playButton;
    var audioplayer = this.audioContainer;
    var playhead = this.playhead;
    var timeline = this.timeline;
    var timer = document.getElementById('timer');
    var icons = document.getElementById('icons');
    var volume = document.getElementById('volume');

    var volumeContainer = document.getElementById('volumeContainer');
    var half = document.getElementById('half');
    var mute = document.getElementById('mute');
    var volumeBar = document.getElementById('volumeBar');
    var innerVolume = document.getElementById('innerVolume');
    var download = document.getElementsByClassName('download');
    var embedButton = document.getElementsByClassName('embed-button');

    if( this.mode === "sc playlist" ||
        this.mode === "audio playlist" ) {

        var timelineWidth = window.innerWidth - (volumeContainer.offsetWidth + 90);

    } else {

        var timelineWidth = window.innerWidth - (volumeContainer.offsetWidth + 60);

    }

    var timelineHeight = 60;
    var counter = 0;
    var volumeBarHeight = 120;
    var volumeAmt = 1.0;
    var trackTitle = document.getElementById("trackTitle");
    var mix = document.getElementById("mix");
    var song;
    var updater;

    var currentDuration;
    var currentTime = 0;
    var relativePosition;
    var volumeCounter = 0;
    var currentTrack;

    var mobile = (/iphone|ipod|android|blackberry|mini|windows\sce|palm/i.test(navigator.userAgent.toLowerCase()));

    if ( mobile ) {

        // alert("MOBILE DEVICE!!");
        $('#volumeContainer').css('display', 'none'); // OR you can use $('.navWrap').hide();

    } else {

        // alert("NOT A MOBILE DEVICE!!");

    }

    if ( this.volume ) {

        volume.addEventListener( "click", function( event ) {

            $(volume).closest('#volumeContainer').css('display', 'none');
            $(half).closest('#halfContainer').css('display', 'block');
            $(mute).closest('#muteContainer').css('display', 'none');

            that.volume = 0.5;
            that.song.setVolume( that.volume );

        } );

        half.addEventListener( "click", function( event ) {

            $(volume).closest('#volumeContainer').css('display', 'none');
            $(half).closest('#halfContainer').css('display', 'none');
            $(mute).closest('#muteContainer').css('display', 'block');

            that.volume = 0.0;
            that.song.setVolume( that.volume );

        } );

        mute.addEventListener( "click", function( event ) {

            $(volume).closest('#volumeContainer').css('display', 'block');
            $(half).closest('#halfContainer').css('display', 'none');
            $(mute).closest('#muteContainer').css('display', 'none');

            that.volume = 1.0;
            that.song.setVolume( that.volume );

        } );

    }

    var embedClickCounter = 0;

    if ( this.embed ) {

        embedButton[0].addEventListener( "click", function( event ) {

            if ( embedClickCounter % 2 === 0 ) {

                that.embedIcon.className = "container-share-embed show";

            } else {

                that.embedIcon.className = "container-share-embed";

            }

            embedClickCounter ++;

        } );

        embedButton[1].addEventListener( "click", function( event ) {

            if ( embedClickCounter % 2 === 0 ) {

                that.embedIcon.className = "container-share-embed show";

            } else {

                that.embedIcon.className = "container-share-embed";

            }

            embedClickCounter ++;

        } );

        embedButton[2].addEventListener( "click", function( event ) {

            if ( embedClickCounter % 2 === 0 ) {

                that.embedIcon.className = "container-share-embed show";

            } else {

                that.embedIcon.className = "container-share-embed";

            }

            embedClickCounter ++;

        } );

    }

    var onvolume = false;

    this.playButton.addEventListener( "click", play, true );

    if ( that.mode === "sc playlist" ||
        that.mode === "audio playlist" ) {

        this.nextButton.addEventListener( "click", skip, true );

    }

    audioplayer.addEventListener( "touchstart", function(e) {

        e.preventDefault();

        that.moveplayhead(e);
        onplayhead = true;

        window.addEventListener( 'touchmove', that.moveplayhead, true );

    } );

    window.addEventListener( 'touchcancel', function() {

        window.removeEventListener( 'touchmove', that.moveplayhead, true );
        onplayhead = false;

    }, false );

    window.addEventListener( 'touchend', function() {

        window.removeEventListener( 'touchmove', that.moveplayhead, true );
        onplayhead = false;

    }, false );

    function clickPercent( e ) {

        return ( e.pageX - timeline.offsetLeft ) / timelineWidth;

    }

    function volumeClickPercent( e ) {

        return ( ( window.innerHeight - e.pageY ) - timelineHeight ) / volumeBarHeight;

    }

    var onplayhead = false;

    this.moveplayhead = function(e) {

        if(e.touches){

            var newMargLeft = e.touches[0].pageX - timeline.offsetLeft;

        } else {

            var newMargLeft = e.pageX - timeline.offsetLeft;

        }

        if (newMargLeft >= 0 && newMargLeft <= timelineWidth) {

            playhead.style.marginLeft = newMargLeft + "px";

        }

        if (newMargLeft < 0) {

            playhead.style.marginLeft = "0px";

        }

        if (newMargLeft > timelineWidth) {

            playhead.style.marginLeft = timelineWidth + "px";

        }

        var newTime = (1 - ((timelineWidth - newMargLeft)/timelineWidth))*currentDuration;
        currentTime = newTime;
        that.song.seek(currentTime);

    };

    this.mouseDown = function(event) {

        onplayhead = true;
        that.moveplayhead(event);

        window.addEventListener('mousemove', that.moveplayhead, true);
        window.addEventListener('touchmove', that.moveplayhead, true);

    };

    this.mouseUp = function(e) {

        if (onplayhead == true) {

            that.moveplayhead(e);

            window.removeEventListener('mousemove', that.moveplayhead, true);
            window.removeEventListener('touchmove', that.moveplayhead, true);

        }

        onplayhead = false;

    };

    timeline.addEventListener( 'mousedown', that.mouseDown, false );
    window.addEventListener( 'mouseup', that.mouseUp, false );

    function executeCallbacks( event ) {

        var playCallbackList = that.callbacks[ event ];

        if ( playCallbackList ) {

            for ( var i = 0, il = playCallbackList.length; i < il; i ++ ) {

                playCallbackList[ i ]();

            }

        }

    }

    // Play and Pause

    var counter = 0;

    function play() {

        if ( that.song.getState() !== "playing" ) {

            console.log( "[Player] PLAY called" );

            executeCallbacks( "play" );

            that.song.play();
            that.song.seek( currentTime );

            pButton.className = "";
            pButton.className = "pause";
            that.playButtonState = 2;

        } else {

            console.log( "[Player] PAUSE called" );

            executeCallbacks( "pause" );

            that.song.pause();

            pButton.className = "";
            pButton.className = "play";
            that.playButtonState = 3;

        }

    }

    function skip( e ) {

        //console.log( "[Player] Switching from [" + that.song.src + "]" );

        executeCallbacks( "skip" );

        if ( that.mode === "sc playlist" ) {

            currentPlaylistIndex ++;

            if ( currentPlaylistIndex >= that.playlist.tracks.length ) {

                currentPlaylistIndex = 0;

            }

            SC.initialize( { client_id: "ad877fecc7527d59d980232be493f705" } );

            SC.get( "/playlists/" + that.src , {

                autoPlay: !isMobile,
                useHTML5Audio: true,
                preferFlash: false

            }, function( sound ) {

                SC.stream( "/tracks/" + sound.tracks[ currentPlaylistIndex ].id, {

                    autoPlay: !isMobile,
                    useHTML5Audio: true,
                    preferFlash: false

                }, function( sound ) {

                    that.song.pause();

                    sound._player.on( "positionChange", function( state ) {

                        that.update();

                    });

                    sound._player.on( "stateChange", function( state ) {

                        if ( state === "ended" ) {

                            skip();

                        }

                    });

                    that.song = sound;
                    that.song.setVolume( that.volume )

                    that.playButton.style.display = "block";
                    that.playButton.className = "";
                    that.playButton.className = "play";
                    that.playButtonState = 3;

                    that.song.play();
                    that.update();

                } );

            } );

        } else if ( that.mode === "audio playlist" ) {

            currentPlaylistIndex ++;

            if ( currentPlaylistIndex >= that.src.length ) {

                currentPlaylistIndex = 0;

                executeCallbacks( "end" );

                if ( ! that.loop ) playNextSong = playNextSong && false;

            }

            if ( playNextSong ) {

                that.song.src = that.src[ currentPlaylistIndex ];
                that.song.load();
                that.song.play();
                that.song.setVolume( that.volume );

            } else {

                that.song.pause();
                that.song.src = "";

            }

            //console.log( "[Player] to [" + that.song.src + "]" );

        }

    }

    this.update = function() {

        // updater = requestAnimationFrame(update);

        currentDuration = this.song.getDuration();
        var dur = this.getDuration( currentDuration );
        var str = dur.minutes + ":" + dur.seconds;

        currentTime = this.song.getCurrentPosition();

        // currentTime = song._player._prevCurrentPosition;

        if ( this.mode === "audio" || this.mode === "audio playlist" ) currentTime *= 1000;

        var time = this.getDuration( currentTime );

        if ( time.seconds < 10 ) {

            time.seconds = "0" + time.seconds;

        }

        var str = time.minutes + ":" + time.seconds;
        timer.innerHTML = str;

        if ( this.mode === "audio" || this.mode === "audio playlist" ) currentTime /= 1000;

        relativePosition = currentTime / currentDuration;

        playhead.style.marginLeft = ( timelineWidth * relativePosition ) + "px";
        this.updateTitle();
        this.checkText();

        checkPlayPause();

    };

    this.updateTitle = function() {

        if ( this.useTracklist ) {

            for ( var i = 0; i < tracklist.length; i ++ ) {

                if ( this.mode === "audio" ||
                    this.mode === "audio playlist" ) {

                    if ( currentTime > tracklist[i].time ) {

                        currentTrack = tracklist[i];
                        trackTitle.innerHTML = tracklist[i].title;

                    }

                } else {

                    if ( currentTime > tracklist[i].time * 1000 ) {

                        currentTrack = tracklist[i];
                        trackTitle.innerHTML = tracklist[i].title;

                    }

                }

            }

        }

        // currentTrack =

        if ( this.mode === "sc playlist" ) {

            trackTitle.innerHTML = this.playlist.tracks[ currentPlaylistIndex ].title;

        } else if ( this.mode === "audio playlist" ) {

            trackTitle.innerHTML = this.songTitle[ currentPlaylistIndex ];

        }

    };

    function checkPlayPause(){

        window.requestAnimationFrame( checkPlayPause );

        switch ( that.song.getState() ) {

            case "seeking":

                if ( that.playButtonState !== 1 ) {

                    that.playButton.className = "loadingbutton";
                    that.playButtonState = 1;

                }

                break;

            // case "loading":
            // that.playButton.className = "";
            // that.playButton.className = "loading";
            // break;
            // case "initialize":
            // that.playButton.className = "";
            // that.playButton.className = "loading";
            // break;

            case "playing":

                if ( that.playButtonState !== 2 ) {

                    that.playButton.className = "pause";
                    that.playButtonState = 2;

                }

                break;

            case "paused":

                if ( that.playButtonState !== 3 ) {

                    that.playButton.className = "play";
                    that.playButtonState = 3;

                }

                break;

        }

    }

    window.addEventListener( 'resize', onWindowResize, false );

    function onWindowResize() {

        if( that.mode === "sc playlist" ||
            that.mode === "audio playlist" ) {

            timelineWidth = window.innerWidth - ( volumeContainer.offsetWidth + 90 );

        } else {

            timelineWidth = window.innerWidth - ( volumeContainer.offsetWidth + 60 );

        }

    }

    this.checkText = function() {

        var txt = $("#trackTitle");
        var delta = txt.parent().width() - txt.width();

        if ( this.useTracklist ) {

            if ( currentTrack.tooLong )	{

                txt.addClass("marquee");

            } else {

                txt.removeClass("marquee");

            }

        } else {

            txt.addClass("marquee");

        }

    };

    this.getDuration = function( millis ) {

        var dur = {};
        var units = [
            {label:"millis",    mod:1000},
            {label:"seconds",   mod:60},
            {label:"minutes",   mod:60},
            {label:"hours",     mod:24},
            {label:"days",      mod:31}
        ];

        // calculate the individual unit values...

        units.forEach(function(u){
            millis = (millis - (dur[u.label] = (millis % u.mod))) / u.mod;
        });

        // convert object to a string representation...

        dur.toString = function(){
            return units.reverse().map(function(u){
                return dur[u.label] + " " + (dur[u.label]==1?u.label.slice(0,-1):u.label);
            }).join(', ');
        };

        return dur;

    };

    this.addCallback = function ( event, callback ) {

        if ( this.callbacks[ event ] === undefined ) this.callbacks[ event ] = [];

        var callbackList = this.callbacks[ event ];
        var callbackIndex = callbackList.length;

        callbackList.push( callback );

        return callbackIndex;

    };

}




