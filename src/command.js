const Option = require('./option');

const Command = function (command) {
  if(!command) {
    throw TypeError('command not valid');
  }

  this.text = command.text;
  if(command.options) {
    this.options = command.options.map(function (opt) {
      return new Option(opt);
    });
  }

  this.handler = command.handler || this.help;
  this.commands = command.commands;
};

Command.prototype = {
  help() {
    console.log(this.text);
  }
};

module.exports = Command;