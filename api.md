# API Reference

### CommandGroup 
An object where each key is the call id of an [Command](#Command)

### Command
- **text** short description about itself
- **options** array of [Option](#Option), these will be also available in sub-commands 
- **handler** function that is called if no sub-command is triggered defaults to `console.log(this.text )`
- **commands** object of type [CommandGroup](#CommandGroup)

### Option 
eather a string or an object in the following format:
- **short** string `-s`
- **long** string `--short`
- **params** number to note how many are expected, or array of strings where the values are maped in that order to that name
