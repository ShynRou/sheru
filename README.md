# sheru
JS function wrapper for shell syntaxed scripts


```
const sheru = new Sheru({
  move: {
    text: "move your player",
    options: [
      {
        short: 'f',
        long: 'fast'
      },
      'slow', // automaticly uses 's' as short variant
      {
        short: 'd',
        long: 'direction'
        params: 1 
      },
    ],
    handler: () => {
      console.log('please use "move away [options]"');
    },
    commands: {
      away: {
        text: "away from your current selected enemy"
        hander: (options) => {
          console.log(`You move away ${options.slowly ? 'slowly' : (options.fast ? 'as fast as you can' : '')}`);
        }
      }
    }
  }
});

sheru.exec('move away -s && move away --fast; move away -d 270deg --slow');
```
