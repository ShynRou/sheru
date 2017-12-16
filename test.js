const Sheru = require('./src/index');

const cli = new Sheru({
  move: {
    text: 'move your player',
    options: [
      {
        long: 'help',
        short: 'h',
      }
    ],
    handler: (options) => {
      if (options && options.help) {
        console.log('if you need help to move then i can\'t help you...');
      }
      else {
        console.log('use away');
      }
    },
    commands: {
      away: {
        options: [
          {
            long: 'speed',
            short: 's',
            params: ['value', 'unit']
          },
          {
            long: 'direction',
            short: 'd',
          }
        ],
        handler: (options) => {
          result = 'you move away';
          if (options && options.speed) {
            result += ' with ' + options.speed.value + options.speed.unit;
          }
          console.log(result);
        }
      }
    }
  },

  A: {
    handler: () => {
      console.log('A');
      return 'A';
    }
  },
  B: {
    handler: () => {
      console.log('B');
      return 'B';
    }
  },
  C: {
    handler: () => {
      console.log('C');
      return 'C';
    }
  },
  false: {
    handler: () => {
      console.log(false);
      return false;
    }
  },
  pass: {
    handler: (options) => {
      console.log(options);
      return options;
    }
  },
  log: {
    handler: (options) => {
      console.log(options);
      return true;
    }
  },
  logConfig: {
    handler: (options, config) => {
      console.log(config);
      return true;
    }
  }
});

async function test(script, expect) {
  try {
    await cli.exec(script, null, {config: 'none'});
    if (expect) {
      console.log('expect: ' + expect);
    }
  } catch (e) {
    console.error(`'${script}' failed!`, e);
  }
}

async function run() {
  [
    ['move'],
    ['move -h'],
    ['move --help'],
    ['move away'],
    ['move away -s -d'],
    ['move away -s "300 * 300" kmh  -d'],
    ['A; B; C', 'A B C'],
    ['false && A', 'false'],
    ['false || A', 'false A'],
    ['false || (A; false | log) ', 'false A false {"": false}'],
    ['A | log', 'A {"": "A"}'],
    ['A | log | log', 'A {"": "A"} {"": true}'],
    ['A ? B : C', 'A B'],
    ['false ? B : C', 'false C'],
    ['A; B ? ((A && B) | log) : (false) ; C', 'A B A B {"": "B"} C'],
    ['false || ((A | log) && logConfig)', 'false A {"": "A"} {"config": "none"}'],
    ['pass "help me" | log']
  ].reduce((chain, args) => chain.then(() => test(...args)), Promise.resolve());
}

run();