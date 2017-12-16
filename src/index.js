const Option = require('./option');
const Command = require('./option');

const Sheru = function (commands) {
  this.commands = commands;
  // TODO parse commands object and throw errors invalid config
};

Sheru.prototype = {

  addCommand(id, commandObj) {
    this.commands[id] = commandObj;
  },

  removeCommand(id) {
    delete this.commands[id];
  },

  exec(script, input, config) {
    return this.parse(script)(input, config);
  },

  parse(script, strings, subScripts) {
    if (!script) {
      return null;
    }

    const extrudedStrings = strings || [];
    script = script.replace(/(\'|\")(.*?)\1/g, (match, type, value) => {
      extrudedStrings.push(value);
      return '$' + (extrudedStrings.length - 1);
    });

    const extrudedScripts = subScripts || [];
    // BRACKETS
    var bracketsRegex = /\(([^()]*)\)/g;
    let newScript = script;
    let tempScript = script;
    do {
      tempScript = newScript;
      newScript = newScript.replace(bracketsRegex, (match, script) => {
        extrudedScripts.push(this.parse(script, extrudedStrings, extrudedScripts));
        return '$$' + (extrudedScripts.length - 1);
      });
    } while (tempScript !== newScript);

    script = newScript;

    // SEMICOLON
    let commandArray = script.split(';').filter(s => !!s.trim()); // filter out any empty scripts

    // PARSE COMMAND CHAINS;
    commandArray = commandArray.map((script) => this.parseCommandChain(script, extrudedStrings, extrudedScripts));

    if (commandArray.length === 1) {
      return async (input, config) => commandArray[0](input, config);
    }
    else {
      return async (input, config) => {
        for (let i = 0; i < commandArray.length; i++) {
          try {
            await commandArray[i](input, config);
          }
          catch (e) {
            console.error(e);
          }
        }
      }
    }
  },

  parseCommandChain(script, strings, subCommands) {

    let match = null;

    // IF ... ELSE ...
    if ((match = /^(.*?)\?(.*?)\:(.*)$/i.exec(script))) {
      let checkFunc = this.parseCommandChain(match[1], strings, subCommands);
      let trueFunc = this.parseCommandChain(match[2], strings, subCommands);
      let falseFunc = this.parseCommandChain(match[3], strings, subCommands);
      return async (input, config) => await checkFunc(null, config) ? await trueFunc(null, config) : await falseFunc(null, config);
    }

    // AND, OR
    if ((match = /^(.*?)(\&\&|\|\|)(.*)$/i.exec(script))) {
      let commandA = this.parseCommandChain(match[1], strings, subCommands);
      let commandB = this.parseCommandChain(match[3], strings, subCommands);
      if (match[2] === '||') {
        return async (input, config) => await commandA(null, config) || await commandB(null, config);
      }
      else {
        return async (input, config) => await commandA(null, config) && await commandB(null, config);
      }
    }

    // PIPE
    if ((match = /^(.*?)\|(.*)$/i.exec(script))) {
      let source = this.parseCommandChain(match[1], strings, subCommands);
      let target = this.parseCommandChain(match[2], strings, subCommands);
      return async (input, config) => await target(await source(input, config), config);
    }

    // INJECT SUB COMMANDS
    if ((match = /^\s*\$\$([^\s]+)\s*$/i.exec(script))) {
      try {
        return subCommands[parseInt(match[1])];
      } catch (e) {
        throw e;
      }
    }

    // NORMAL COMMAND HANDLING
    return this.parseCommand(script, strings);
  },

  parseCommand(script, params) {
    if (!script) {
      return null;
    }

    const extrudedStrings = params || [];
    script = script.trim().replace(/(\'|\")(.*?)\1/g, (match, type, value) => {
      extrudedStrings.push(value);
      return '$' + (extrudedStrings.length - 1);
    });

    const segments = script.split(/\s+/);
    var command = {commands: this.commands};

    var i = 0;

    while (i < segments.length && command.commands && command.commands[segments[i]]) {
      command = command.commands[segments[i]];
      i++;
    }

    if (command) {
      var data = script.replace(segments.slice(0, i).join(' '), '');
      const optRegex = /(?:\s|^)([^\s]+)/gi;

      var currentOption = null;
      var options = {};
      var paramCount = 0;
      var globalParamCount = 0;
      var dataSegment = null;

      while ((dataSegment = optRegex.exec(data))) {
        dataSegment = dataSegment[0].trim();
        var type = (dataSegment[0] === '-') + (dataSegment[1] === '-');
        if (type > 0) {
          if (currentOption && currentOption.params && paramCount < currentOption.params.length) {
            throw TypeError(`Missing ${currentOption.params.length - paramCount} of ${currentOption.params.length} parameters for option ${currentOption.long}`);
          }

          dataSegment = dataSegment.replace(/^--?/, '');
          type = type === 1 ? 'short' : 'long';

          currentOption = command.options.find(function (opt) {
            return opt && opt[type] === dataSegment;
          });

          if (!currentOption) {
            throw TypeError('Option "' + dataSegment + '" unknown.');
          }
          else {
            options[currentOption.long] = currentOption.params ? {} : true;
            paramCount = 0;
          }
        }
        else {
          dataSegment = dataSegment.replace(/\$([^\s]+)/, (match, id) => {
            try {
              id = parseInt(id);
              return extrudedStrings[id];
            } catch (e) {
              return match;
            }
          });

          if (currentOption && currentOption.params) {
            if (paramCount < currentOption.params.length) {
              let paramKey = currentOption.params[paramCount];
              options[currentOption.long][paramKey] = dataSegment;
              paramCount++;
            }
            else {
              currentOption = null;
              paramCount = 0;
            }
          }
          else {
            if (!options['']) {
              options[''] = [];
            }
            options[''][globalParamCount++] = dataSegment;
          }

        }
      }

      return (input, config) => {
        if (typeof input === 'object') {
          options = Object.assign({}, options, input);
        }
        else if (input != null) {
          options[''] = input;
        }
        return command.handler(options, config);
      };
    }
    else {
      return null;
    }
  }
};

module.exports = Sheru;