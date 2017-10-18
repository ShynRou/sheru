# API

## CommandGroup 
An object where each key is the call id of an [Command](#Command)

## Command
- **text** short description about itself
- **options** array of [CommandOption](#CommandOption), these will be also available in sub-commands 
- **handler** function that is called if no sub-command is triggered defaults to `console.log(this.text )`
- **commands** object of type [CommandGroup](#CommandGroup)
