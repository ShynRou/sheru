const Option = function (option) {
  if(!option) {
    throw TypeError('option not valid');
  }

  if (typeof option === 'object') {
    this.short = option.short;
    this.long = option.long;
    if (option.params) {
      if (typeof option.params === 'number') {
        this.params = [];
        for (var i = 0; i < option.params.length; i++) {
          this.params.push(i);
        }
      }
      else {
        this.params = option.params;
      }
    }
  }
  else {
    option = String(option);
    if (option.length > 1) {
      this.long = option;
    }
    else {
      this.short = option;
      this.long = option;
    }
  }
};

module.exports = Option;