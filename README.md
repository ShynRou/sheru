# sheru
JS function wrapper for shell syntaxed scripts

### [API Reference](https://github.com/ShynRou/sheru/blob/master/api.md)
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
        long: 'speed'
        params: ['value','unit']
      },
    ],
    handler: () => {
      console.log('please use "move away [options]"');
    },
    commands: {
      away: {
        text: "away from your current selected enemy"
        hander: (options) => {
          var result = 'You move away';
          if(options.slowly) {
            result += ' slowly';
          }
          if(options.fast) {
            result += ' as fast as you can';
          }
          if(options.speed) {
            result += ` with ${options.speed.value}${options.speed.unit}`;
          }          
          console.log(result);
        }
      }
    }
  }
});

sheru.exec('move away -s && move away --fast; move away -d 270deg --speed 4 m/s');
```
