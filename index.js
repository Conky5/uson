'use strict';

var parser = require('./dist/parser');
var assign = require('object-assign');
var toString = Object.prototype.toString;

function toObject(values) {
  var arrcount = 0;
  var obj = {};
  values.forEach(function(item) {
    var type = toString.call(item);
    if(type === '[object Array]') {
      obj[arrcount] = item;
      arrcount = arrcount + 1;
    } else if(type === '[object Object]') {
      if(item.$$destroy === true) {
        return;
      }
      obj = assign(obj, item);
    } else {
      obj[arrcount] = item;
      arrcount = arrcount+1;
    }
  });
  return obj;
}

function TreeInterpreter(options) {
  options = options || {};
  this.expandQueue = [];
  this.objectMode = options.objectMode || false;
}

TreeInterpreter.prototype.process = function(node) {
  if(this.objectMode) {
    return toObject(this.visit(node));
  }
  return this.visit(node);
};

TreeInterpreter.prototype.visitArray = function(node) {
  var output = [];
  var self = this;
  node.forEach(function(item) {
    if(toString.call(item) === '[object Object]' &&
      item.$$destroy === true) {
        return;
    }
    output.push(self.visit(item));
  });
  return output;
};

TreeInterpreter.prototype.visitObjectAssign = function(node) {
  var out = {};
  var key = this.visit(node.value[0]);
  out[key[0].join('.')] = this.visit(node.value[1]);
  return out;
};

TreeInterpreter.prototype.visitObjectAdd = function(node, values) {
  values = values || this.visitArray(node.value);
  return toObject(values);
};

TreeInterpreter.prototype.visitArrayAdd = function(node) {
  return this.visit(node.value);
};

TreeInterpreter.prototype.visit = function(node) {

  var type = toString.call(node);
  if(type === '[object Array]') {
    return this.visitArray(node);
  }
  if (type === '[object Object]') {
    if(!node.type) {
      return node;
    }
    var visitMethod = this['visit'+node.type];
    if(visitMethod === undefined) {
      throw new Error('No visit method: '+node.type);
    }
    var out = visitMethod.call(this, node);
    return out;
  }
  return node;
};

var USON = {
  parse: function(str, objectMode) {
    var interpreter = new TreeInterpreter({ objectMode: objectMode || false });
    var tree = parser.parse(str);
    return interpreter.process(tree);
  },
  tokenize: parser.parse,
  stringify: function() { return null; }
};

module.exports = USON;
