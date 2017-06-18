'use strict';
class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  plus(vector) {
    if (!(vector instanceof Vector)) {
      throw new Error('Можно прибавлять к вектору только вектор типа Vector', vector);
    }
    return new Vector(this.x + vector.x, this.y + vector.y);
  }
  times(multiplier) {
    return new Vector(this.x * (multiplier), this.y * (multiplier));
  }
}

class Actor {
  constructor(position = new Vector(0, 0), size = new Vector(1, 1), speed = new Vector()) {
    for (let argument of arguments) {
      if ((!(argument instanceof Vector)) && (argument !== undefined)) {
        throw new Error(`${argument} не является типом Vector`, argument);
      }
    }
    this.pos = position;
    this.size = size;
    this.speed = speed;
  }

  act() {}

  get left() {
    if (this.size.x >= 0) {
      let x = this.pos.x;
      return x;
    } else {
      let x = this.pos.x + this.size.x;
      return x;
    }
  }
  get bottom() {
    if (this.size.y >= 0) {
      let y = this.pos.y + this.size.y;
      return y;
    } else {
      let y = this.pos.y;
      return y;
    }
  }
  get right() {
    if (this.size.x >= 0) {
      let x = this.pos.x + this.size.x;
      return x;
    } else {
      let x = this.pos.x;
      return x;
    }
  }
  get top() {
    if (this.size.y >= 0) {
      let y = this.pos.y;
      return y;
    } else {
      let y = this.pos.y + this.size.y;
      return y;
    }

  }
  get type() {
    return 'actor';
  }

  isIntersect(actor) {
    if (!(actor instanceof Actor)) {
      throw new Error('Не является типом Actor', actor);
    }
    if (actor === this) {
      return false;
    }
    if (((actor.left <= this.left) && (actor.right > this.left)) ||
      ((actor.left > this.left) && (actor.right < this.right)) ||
      ((actor.left < this.right) && (actor.right >= this.right)) ||
      ((actor.left <= this.left) && (actor.right >= this.right))) {
      if (((actor.top <= this.top) && (actor.bottom > this.top)) ||
        ((actor.top > this.top) && (actor.bottom < this.bottom)) ||
        ((actor.top < this.bottom) && (actor.bottom >= this.bottom)) ||
        ((actor.top <= this.top) && (actor.bottom >= this.bottom))) {
        return true;
      }
    }
    return false;
  }
}
class Level {
  constructor(grid = [], actors = []) {
    this.grid = grid;
    this.actors = actors;
    this.player = actors.find(function(el) {
      return el.type === 'player';
    });
    this.height = grid.length;
    this.width = grid.reduce(function(memo, el) {
      if (el.length >= memo) {
        memo = el.length;
        return memo;
      }
    }, 0);
    this.status = null;
    this.finishDelay = 1;
  }
  isFinished() {
    if ((this.status !== null) && (this.finishDelay < 0)) {
      return true;
    }
    return false;
  }
  actorAt(actor = 0) {
    if (!(actor instanceof Actor)) {
      throw new Error('Вы не передали обьект или обьект не является типом Actor', actor);
    }
    return this.actors.reduce(function(memo, el) {
      if (el.isIntersect(actor)) {
        return el;
      }
      return memo;
    }, undefined);
  }
  obstacleAt(position, size) {
    for (let argument of arguments) {
      if (!(argument instanceof Vector)) {
        throw new Error(`${argument} не является типом Vector`, argument);
      }
    }
    let obstacle = new Actor(position, size);

    if (Math.floor(obstacle.top) < 0) {
      return 'wall';
    }
    if (Math.ceil(obstacle.bottom) > this.grid.length) {
      return 'lava';
    }
    if (Math.floor(obstacle.left) < 0) {
      return 'wall';
    }
    if (Math.ceil(obstacle.right) > this.width) {
      return 'wall';
    }
    let flagExit;
    for (let x = Math.floor(obstacle.left); x <= Math.floor(obstacle.right); x++) {
      for (let y = Math.floor(obstacle.top); y <= Math.floor(obstacle.bottom); y++) {
        if (this.grid[y][x] === 'lava') {
          return 'lava';
        }
        if (this.grid[y][x] === 'wall') {
          flagExit = 'wall';
        }
      }
    }
    if (flagExit === 'wall') {
      return 'wall';
    }
    return undefined;
  }
  removeActor(actor) {
    if (!(actor instanceof Actor)) {
      throw new Error('Обьект не является типом Actor', actor);
    }
    this.actors.shift(actor);
  }
  noMoreActors(type) {
    return this.actors.find(function(el) {
      return el.type === type;
    }) === undefined;
  }
  playerTouched(ninepins, actor = 0) {
    if (this.status === null) {
      if ((ninepins === 'lava') || (ninepins === 'fireball')) {
        this.status = 'lost';
      }
      if (ninepins === 'coin') {
        this.removeActor(actor);
        if (this.noMoreActors('coin')) {
          this.status = 'won';
        }
      }
    }
  }
}
class LevelParser {
  constructor(masSymbol = {}) {
    this.symbols = masSymbol;
  }
  actorFromSymbol(symbol = '0') {
    return this.symbols[symbol];
  }
  obstacleFromSymbol(symbol = '0') {
    switch (symbol) {
      case ('x'):
        {
          return 'wall';
        }
      case ('!'):
        {
          return 'lava';
        }
      default:
        {
          return undefined;
        }
    }
  }
  createGrid(masString) {
    let symbols = this;
    return masString.reduce(function(memo, el) {
      let mass = el.split('');
      mass = mass.map(function(el) {
        if (el === ' ') {
          return undefined;
        }
        if (el === 'x') {
          return 'wall';
        }
        if (el === '!') {
          return 'lava';
        }
        if (el in symbols) {
          return symbols[el];
        }
      });
      memo.push(mass);
      return memo;
    }, []);
  }
  createActors(massActors) {
    let symbols = this.symbols;
    return massActors.reduce(function(memo, el, y) {
      let mass = el.split('');
      mass = mass.map(function(el, x) {
        if ((el in symbols) &&
          (typeof symbols[el] === 'function') &&
          ((symbols[el].prototype instanceof Actor) || (symbols[el] === Actor))) {

          memo.push(new symbols[el](new Vector(x, y)));
        }
      });
      return memo;
    }, []);
  }
  parse(plan) {
    return new Level(this.createGrid(plan), this.createActors(plan));
  }

}
class Fireball extends Actor {
  constructor(position = new Vector(), speed = new Vector()) {
    super(position, new Vector(1, 1), speed);
  }
  get type() {
    return 'fireball';
  }
  getNextPosition(time = 1) {
    return this.pos.plus(this.speed.times(time));
  }
  handleObstacle() {
    this.speed = new Vector(-this.speed.x, -this.speed.y);
    return this.speed;
  }
  act(time = 1, grid) {
    let nextPos = this.getNextPosition(time);
    if (!grid.obstacleAt(nextPos, this.size)) {
      this.pos = nextPos;
    } else {
      this.handleObstacle();
    }
  }

}
class HorizontalFireball extends Fireball {
  constructor(position) {
    super(position, new Vector(2, 0));
  }
}
class VerticalFireball extends Fireball {
  constructor(position) {
    super(position, new Vector(0, 2));
  }
}
class FireRain extends Fireball {
  constructor(position = new Vector()) {
    super(position, new Vector(0, 3));
    this.start = position;
  }
  handleObstacle() {
    this.pos = this.start;
  }
  act(time, grid) {
    let nextPos = this.getNextPosition(time);
    if (grid.obstacleAt(nextPos, this.size) === 'lava') {
      this.handleObstacle();
    } else {
      this.pos = nextPos;
    }
  }
}
class Coin extends Actor {
  constructor(position = new Vector()) {
    super(position.plus(new Vector(0.2, 0.1)), new Vector(0.6, 0.6));
    this.springSpeed = 8;
    this.springDist = 0.07;
    this.spring = Math.random() * (Math.PI * 2);
  }
  get type() {
    return 'coin';
  }
  updateSpring(time = 1) {
    this.spring = this.spring + (this.springSpeed * time);
  }
  getSpringVector() {
    return new Vector(0, Math.sin(this.spring) * this.springDist);
  }
  getNextPosition(time = 1) {
    this.updateSpring(time);
    return this.pos.plus(this.getSpringVector());
  }
  act(time) {
    this.pos = this.getNextPosition(time);
  }

}
class Player extends Actor {
  constructor(position = new Vector()) {
    super(position.plus(new Vector(0, -0.5)), new Vector(0.8, 1.5));
  }
  get type() {
    return 'player';
  }
}
const schemas = [
  [
    '         ',
    '         ',
    '    =    ',
    '       o ',
    '     !xxx',
    ' @       ',
    'xxx!     ',
    '         '
  ],
  [
    '      v  ',
    '    v    ',
    '  v      ',
    '        o',
    '        x',
    '@   x    ',
    'x        ',
    '         '
  ]
];
const actorDict = {
  '@': Player,
  'v': FireRain,
  '=': HorizontalFireball,
  'o': Coin

}
const parser = new LevelParser(actorDict);
runGame(schemas, parser, DOMDisplay)
  .then(() => console.log('Вы выиграли приз!'));