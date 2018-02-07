(function () { 'use strict';
  window.addEventListener('load', function () {
    var Analyser = this.Analyser = function (context, fft, smoothing) {
      var AudioContext = window.AudioContext || window.webkitAudioContext;
      this.context = context || new AudioContext();
      this.analyser = this.context.createAnalyser();
      this.analyser.fftSize = fft || 2048;
      this.analyser.smoothingTimeConstant = smoothing || 0;
      this.analyser.connect(this.context.destination);
      this.wave = new Uint8Array(this.analyser.frequencyBinCount * 2);
      this.freq = new Uint8Array(this.analyser.frequencyBinCount);
    }

    Analyser.prototype.audio = function (audio) {
      if(this.source) this.source.disconnect();
      this._audio = audio || new Audio();
      this.source = this.context.createMediaElementSource(this._audio);
      this.source.connect(this.analyser);
      return this;
    };

    Analyser.prototype.stream = function (stream) {
      if(this.source) this.source.disconnect();
      this._stream = stream;
      this.source = this.context.createMediaStreamSource(this._stream);
      this.source.connect(this.analyser);
      return this;
    };

    Analyser.prototype.update = function () {
      this.analyser.getByteFrequencyData(this.freq);
      this.analyser.getByteTimeDomainData(this.wave);
      return this;
    };

    Analyser.prototype.amplitude = function (hz) {
      var l = hz/this.context.sampleRate * this.freq.length | 0;
      for(var sum = 0, i = 0; i < l;) sum += this.freq[i++];
      return sum / l / 255;
    };

    var C = util.tag('canvas', null, document.body);
    var $ = C.getContext('2d'), W, H;

    (window.onresize = function () {
      W = C.width  = C.clientWidth;
      H = C.height = C.clientHeight;
    })();

    var audio = util.tag('audio', {
      crossOrigin: true,
      controls: true,
      autoplay: true,
      loop: true,
      src: location.hash ? location.hash.slice(1) :
        'https://hot.friezy.ru/?radio=di&station=drumandbass&bitrate=320'
    }, document.body);

    var analyser = new Analyser(null, 2048, 0.5).audio(audio);

    var colors = [[
      [0/1, [0.2, 0.5, 1.0]],
      [1/1, [1.0, 0.2, 1.0]]
    ], [
      [0/4, [0.0, 0.0, 0.0]],
      [1/4, [0.0, 0.0, 1.0]],
      [2/4, [1.0, 0.0, 0.0]],
      [3/4, [1.0, 1.0, 0.0]],
      [4/4, [1.0, 1.0, 1.0]]
    ]];

    util.loop(function (f, t, dt) {
      analyser.update();

      var amp = analyser._audio.duration
        ? Math.min(1, Math.pow(1.25 * analyser.amplitude(10e3), 2))
        : 0.5 - 0.25 * Math.cos(t / 1000);

      var s = 1.01 + 0.09 * amp;
      $.setTransform(s, 0, 0, s, W/2, H/2);
      $.drawImage(C, -W/2, -H/2);
      $.fillStyle = util.color.rgba(0, 0, 0, 0.05);
      $.fillRect(-W/2, -H/2, W, H);

      $.setTransform(1, 0, 0, 1, W/2, H/2);
      $.beginPath();
      for(var a, r, i = 0, j = analyser.wave.length; i < j; i++) {
        a = i/j * 2 * Math.PI;
        r = amp * 256 * (0.5 + analyser.wave[i]/255);
        $.lineTo(r * Math.sin(a), r * Math.cos(a));
      }

      var c = util.gradient(colors[0], amp);
      $.fillStyle   = util.color.rgba(c[0], c[1], c[2], amp / 2);
      $.strokeStyle = util.color.rgba(c[0], c[1], c[2], amp);
      $.lineWidth   = 4 * amp;
      $.fill(); $.stroke();
    });

    window.addEventListener('dragover', function (e) {
      e.preventDefault(); e.stopPropagation();
    });

    window.addEventListener('drop', function (e) {
      e.preventDefault(); e.stopPropagation();
      var file = e.dataTransfer.files[0];
      if(file) {
        URL.revokeObjectURL(analyser._audio.src);
        analyser._audio.src = URL.createObjectURL(file);
      }
    });
    // window.addEventListener('click', function (e) {
    //   analyser._audio.src = 'https://pub1.diforfree.org:8000/di_liquidtrap_hi';
    // });
    var selectionid = document.getElementById("selection");
    selectionid.addEventListener('change', function (e) {
      analyser._audio.src = selectionid.value;
    });
    var playing = true;
    var pause = document.getElementById("pause_btn");
    var play = document.getElementById("play_btn");
    pause.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
        pause.style.display = "none";
        analyser._audio.pause();
        playing = false;
        play.style.display = "block";
    });
    play.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      play.style.display = "none";
      analyser._audio.play();
      playing = true;
      pause.style.display = "block";
    });

    var vol = document.getElementById("vol");
    vol.addEventListener('input', function (e) {
      e.preventDefault(); e.stopPropagation();
      analyser._audio.volume = vol.value;
    });

    document.body.onkeydown = function(e){
      if(e.keyCode == 32){
          if(playing) {
            analyser._audio.pause();
            playing = false;
          } else {
            analyser._audio.play();
            playing = true;
          }
      }
    }

  }, false);
}).call(this);

var playlist;
  
// Fetch the playlist file, using xhr for example
var xhr = new XMLHttpRequest();
xhr.open("GET", "https://raw.githubusercontent.com/f4rr3ll1990/f4rr3ll_difm/master/DI.m3u");
xhr.overrideMimeType("audio/x-mpegurl"); // Needed, see below.
xhr.onload = parse;
xhr.send();

// Parse it
function parse () {
    var playlist = M3U.parse(this.response);
    console.log(playlist)
    var options = document.getElementById("selection");
    for (var i = 0; i < playlist.length; i++){
        var option = document.createElement("option");
        option.text = playlist[i].title;
        option.value = playlist[i].file;
        option.setAttribute("data-icon", "glyphicon-music");
        options.add(option);
    }
    $('.selectpicker').selectpicker('refresh');
};


