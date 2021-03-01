(function() {
  var GAME, Game, HEXCOLORTABLE, MARGIN, Marble, SIZE, Tile, Wall, Way, drawField, drawMarbles, process,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  HEXCOLORTABLE = ['#000000', '#8b4900', '#ff0000', '#ffb726', '#ffff00', '#00d200', '#0000d2', '#d900db'];

  SIZE = 40;

  MARGIN = SIZE / 2;

  GAME = null;

  Tile = (function() {
    Tile.prototype.type = '.';

    Tile.prototype.size = SIZE;

    Tile.prototype.margin = MARGIN;

    function Tile(position1) {
      this.position = position1;
    }

    Tile.prototype.isMoveable = function() {
      return [false, false, false, false];
    };

    return Tile;

  })();

  Way = (function(superClass) {
    extend(Way, superClass);

    function Way() {
      return Way.__super__.constructor.apply(this, arguments);
    }

    Way.prototype.type = '+';

    Way.prototype.constuctor = function() {
      return Way.__super__.constuctor.apply(this, arguments);
    };

    return Way;

  })(Tile);

  Wall = (function(superClass) {
    extend(Wall, superClass);

    function Wall() {
      return Wall.__super__.constructor.apply(this, arguments);
    }

    Wall.prototype.type = '#';

    Wall.prototype.costructor = function() {
      return Wall.__super__.costructor.apply(this, arguments);
    };

    return Wall;

  })(Tile);

  Marble = (function(superClass) {
    extend(Marble, superClass);

    function Marble(name, position) {
      this.name = name;
      Marble.__super__.constructor.call(this, position);
      this.type = this.name;
      this.color = HEXCOLORTABLE[parseInt(this.name)];
    }

    Marble.prototype.move = function(pos) {
      var found;
      switch (GAME.tiles[pos].constructor.name) {
        case 'Way':
          found = $.grep(GAME.marbles, function(value) {
            return value.position === pos;
          });
          if (found.length < 1) {
            return true;
          } else {
            return false;
          }
          break;
        default:
          return false;
      }
    };

    Marble.prototype.moveTop = function() {
      return this.move(this.position - 10);
    };

    Marble.prototype.moveRight = function() {
      return this.move(this.position + 1);
    };

    Marble.prototype.moveBottom = function() {
      return this.move(this.position + 10);
    };

    Marble.prototype.moveLeft = function() {
      return this.move(this.position - 1);
    };

    return Marble;

  })(Tile);

  Game = (function() {
    Game.prototype.tiles = [];

    Game.prototype.marbles = [];

    Game.prototype.select = null;

    Game.prototype.points = 0;

    function Game(level, field1, solution, moves) {
      this.level = level;
      this.field = field1;
      this.solution = solution;
      this.moves = 0;
      this.createField(this.field, this.tiles);
      this.createMarbles(this.field, this.marbles);
    }

    Game.prototype.createMarbles = function(field, layers) {
      return $.each(field, function(index, value) {
        switch (value) {
          case '1':
          case '2':
          case '3':
          case '4':
          case '5':
          case '6':
          case '7':
          case '8':
          case '9':
            return layers.push(new Marble(value, index));
        }
      });
    };

    Game.prototype.createField = function(field, layers) {
      return $.each(field, function(index, value) {
        switch (value) {
          case '#':
            return layers.push(new Wall(index));
          case '+':
          case '1':
          case '2':
          case '3':
          case '4':
          case '5':
          case '6':
          case '7':
          case '8':
          case '9':
            return layers.push(new Way(index));
          case '.':
            return layers.push(new Tile(index));
        }
      });
    };

    Game.prototype.analyseField = function() {
      var marbles = this.marbles;

      var solved = this.solution.filter(function(v) {
        return marbles.reduce(function(acc, val) {
          if (v.marble === parseInt(val.name) && v.position === val.position) return true;
          return acc;
        }, false);
      });
      
      $('#points').text(Math.pow(solved.length, 2));

      if (solved.length > 0) {
        let form = new FormData();
        form.append('level', this.level);
        form.append('name', document.querySelector('input[name=name]').value);
        form.append('team', document.querySelector('input[name=team]').value);
        form.append('csrf_token', document.querySelector('input[name=csrf_token]').value);
        form.append('moves', document.getElementById('moves').innerText);
        form.append('points', document.getElementById('points').innerText);
        form.append('status', (this.solution.length === solved.length) ? 1 : 0);
      window.submit_formular(form);
      }

      return this.solution.length === solved.length;
    };

    return Game;

  })();

  $(document).ready(function() {
    var back, game, hash, level, next, prefix;
    game = null;
    next = null;
    back = null;
    hash = '' + window.location;
    prefix = '//' + window.location.host + window.location.pathname.replace("index.html", "");
    level = hash.split('#')[1];
    if (level === void 0) {
      level = 'l001';
    }
    $.getJSON(prefix + '/static/levels/' + level + '.json', function(data) {
      GAME = new Game(level, data['field'], data['solution'], parseInt(data['moves']));
      document.querySelector('input[name=level]').value = level;
      next = data['next'];
      back = data['back'];
      $('#moves').text(GAME.moves);
      $('#points').text(0);
      drawField();
      return drawMarbles();
    });
    $('#back').click(function() {
      window.location = '#' + back;
      return location.reload();
    });
    $('#restart').click(function() {
      window.location = '#' + level;
      return location.reload();
    });
    $('#reset').click(function() {
      window.location = '#l001';
      return location.reload();
    });
    $('#next').click(function() {
      window.location = '#' + next;
      return location.reload();
    });
    $('#leftarrow').click(function() {
      return process(37);
    });
    $('#toparrow').click(function() {
      return process(38);
    });
    $('#rightarrow').click(function() {
      return process(39);
    });
    $('#bottomarrow').click(function() {
      return process(40);
    });
    return $(this).keydown(function(e) {
      //e.preventDefault();
      return process(e.which);
    });
  });

  process = function(key) {
    var active, ary;
    if (GAME.select === null) {
      return;
    }
    ary = $.grep(GAME.marbles, function(value) {
      return parseInt(GAME.select.name) === parseInt(value.type);
    });
    active = ary[0];
    switch (key) {
      case 37:
      case 65:
      case 72:
        while (active.moveLeft()) {
          active.position -= 1;
        }
        break;
      case 38:
      case 87:
      case 75:
        while (active.moveTop()) {
          active.position -= 10;
        }
        break;
      case 39:
      case 68:
      case 76:
        while (active.moveRight()) {
          active.position += 1;
        }
        break;
      case 40:
      case 83:
      case 74:
        while (active.moveBottom()) {
          active.position += 10;
        }
    }
    $('#marbles').animateLayer(GAME.select, {
      x: active.margin + (active.position % 10) * SIZE,
      y: active.margin + parseInt(active.position / 10) * SIZE,
      strokeStyle: '#222',
      strokeWidth: 2
    });
    
    $('#moves').text(GAME.moves += 1);
    
    if (GAME.analyseField()) {
      // console.log("You win!");
      let dialog = document.getElementById('win_dialog');
      dialog.style.display = 'block';
    } else if (GAME.moves <= 0) {
      // console.log('GAME over!');
    }
    return GAME.select = null;
  };

  drawField = function() {
    $.each(GAME.solution, function(index, value) {
      return $("#marbles").drawArc({
        layer: true,
        fillStyle: HEXCOLORTABLE[value.marble],
        strokeWidth: 0,
        opacity: .4,
        x: MARGIN + (value.position % 10) * SIZE,
        y: MARGIN + parseInt(value.position / 10) * SIZE,
        radius: SIZE / 2 - 2
      });
    });
    return $.each(GAME.tiles, function(index, value) {
      switch (value.type) {
        case '#':
          return $('#marbles').drawRect({
            layer: true,
            strokeStyle: '#222',
            strokeWidth: 4,
            fillStyle: '#444',
            x: value.margin + (value.position % 10) * value.size,
            y: value.margin + parseInt(value.position / 10) * value.size,
            width: value.size - 5,
            height: value.size - 5
          });
      }
    });
  };

  drawMarbles = function() {
    return $.each(GAME.marbles, function(index, value) {
      switch (value.type) {
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          return $("#marbles").drawArc({
            name: "" + value.name,
            layer: true,
            fillStyle: value.color,
            strokeStyle: '#222',
            strokeWidth: 2,
            x: value.margin + (value.position % 10) * value.size,
            y: value.margin + parseInt(value.position / 10) * value.size,
            radius: value.size / 2 - 2,
            click: function(layer) {
              if (GAME.select !== null) {
                $('#marbles').setLayer(GAME.select, {
                  strokeStyle: '#222',
                  strokeWidth: 2
                });
              }
              $("#marbles").setLayer(layer, {
                strokeStyle: '#fff',
                strokeWidth: 3
              });
              $("#marbles").drawLayers();
              return GAME.select = layer;
            }
          });
      }
    });
  };
}).call(this);
