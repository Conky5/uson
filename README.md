# μson (uson)

[![Build Status](https://travis-ci.org/burningtree/uson.svg)](https://travis-ci.org/burningtree/uson) [![Dependency Status](https://david-dm.org/burningtree/uson.svg)](https://david-dm.org/burningtree/uson) [![npm](https://img.shields.io/npm/v/uson.svg)](https://www.npmjs.com/package/uson)

A compact human-readable data serialization format especially designed for shell.

This format is certainly not intended to replace the classical JSON format, but brings different syntax, for use in environments with specific requirements.

Main advantage should be in better writability (mostly in the command line), because use less expressive syntax. Purpose is not to create a format that is as small as possible in term of byte size.

This is initial implementation written in Javascript and node.js. Grammar is written in [PEG](http://en.wikipedia.org/wiki/Parsing_expression_grammar) and parser is generated by [peg.js](http://pegjs.org/). For more info see [Gramar](#grammar).

* [μson Overview](#%CE%BCson-overview)
* [Node.js module](#nodejs-module)
* [Browser usage](#browser-usage)
* [Command-line tool (CLI)](#command-line-tool-cli)

## μson Overview

* [Introduction](#introduction)
  * [Principles](#principles)
  * [Output modes](#output-modes)
* [Example](#example)
* [Basic usage](#basic-usage)
  * [Standart types](#standart-types)
  * [Arrays](#arrays)
  * [Objects](#objects)
  * [Nested objects](#nested-objects)
  * [Type casting](#type-casting)
  * [Custom types](#custom-types)
  * [Comments](#comments)
* [Grammar](#grammar)

### Introduction

#### Principles

* Superset of JSON (every JSON is valid μson).
* Whitespace is not significant.
* String quoting `"` is optional.
* In Array or Object, comma `,` can be replaced by whitespace ` `.
* Assignation with colon `:` can be repeated to create nested objects. (see [Nested objects](#nested-objects)).
* You can use own types, casting is done by `!` character. (see [Type casting](#type-casting)).

#### Output modes

There are three output modes:
* `array` (default) - Output as array.
* `object` - Output as combined object. Suitable for use in the command line.
* `json` - Output first mixed type. 100% compatible with JSON.

### Example

```
endpoint:id:wikipedia pages:[Malta Prague "New York"]
```

Result in JSON (`array` mode):
```json
[
  {
    "endpoint": {
      "id": "wikipedia"
    }
  },
  {
    "pages": [
      "Malta",
      "Prague",
      "New York"
    ]
  }
]
```

or in YAML (`array` mode):
```yaml
- endpoint:
    id: wikipedia
- pages:
    - Malta
    - Prague
    - New York
```

and `object` mode result:
```json
{
  "endpoint": {
    "id": "wikipedia"
  },
  "pages": [
    "Malta",
    "Prague",
    "New York"
  ]
}
```

### Basic usage

```
expr1 expr2 expr3 ..
```

Supported types:
* false
* null
* true
* array
* object
* number
* string

Optional:
* regexp TODO
* function TODO

#### Standart types

```
number:12.05 text:Banana quotedText:"John Devilseed" empty:null good:true
```

Output in `object` mode:
```json
{
  "number": 12.05,
  "text": "Banana",
  "quotedText": "John Devilseed",
  "empty": null,
  "good": true
}
```

#### Arrays

```
simple:[1 2 3] texts:[Malta Budapest "New York"] objects:[{id:1}]
```

Output in `object` mode:
```json
{
  "simple": [
    1,
    2,
    3
  ],
  "texts": [
    "Malta",
    "Budapest",
    "New York"
  ],
  "objects": [
    {
      "id": 1
    }
  ]
}
```

#### Objects

```
obj:{name:John} {nested:[{id:42} value:"Nagano"]}
```

Output in `object` mode:
```json
{
  "obj": {
    "name": "John"
  },
  "nested": [
    {
      "id": 42
    },
    {
      "value": "Nagano"
    }
  ]
}
```

#### Nested objects

You can use standart colon notation for expand objects:
```
<key>:(<value>|(<key>:(<value>| .. )))
```

For example:
```
cities:eu:hu:budapest:Budapest
```

become:
```json
[
  {
    "cities": {
      "eu": {
        "hu": {
          "budapest": "Budapest"
        }
      }
    }
  }
]
```

#### Type casting

If you want return a value in specific type, you can use this syntax:
```
<type>!<expr>
```

For example, this input:
```
str!42
```

produce this output:
```
["42"]
```

You can use casting repeatedly:
```
str!int!12.42
```

output:
```
["12"]
```

This could be useful especially if you define your [own types](#custom-types).

##### Core casting types

**Scalars:**
* `str` - string
* `int` - integer
* `float` - float
* `null` - null
* `bool` - boolean
* `date` - date & time (ISO 8601 formatting)

#### Custom types

If you use library, it's easy to add support for your own types - just pass object with types as third argument to parse(). See [Defining own types](#defining-own-types).

For CLI you can create `.usonrc.js` file in your home directory `~/`, in which you can define your own types. See [Configuration](#configuration).

#### Comments

Comments beginning with `#` and terminates on end of line.

```
array:[1 2 3] # this is comment
```

Output:
```json
{
  "array": [
    1,
    2,
    3
  ]
}
```

### Grammar

Basic grammar is adopted from JSON:

```
begin_array     = ws "[" ws
begin_object    = ws "{" ws
end_array       = ws "]" ws
end_object      = ws "}" ws
name_separator  = ws ":" ws
value_separator = ws [ ,]* ws
comment_start   = "#"
ws_char         = [ \t\n\r]
```

For more info see [uson.pegjs](src/uson.pegjs) file.

[Visualization of uson grammar](http://dundalek.com/GrammKit/#https://raw.githubusercontent.com/burningtree/uson/master/src/uson.pegjs).

## Node.js module

* [Compatibility](#compatibility)
* [Installation](#installation)
* [Usage](#usage)
* [Defining own types](#defining-own-types)

### Compatibility

* node.js 0.10+
* [io.js](https://iojs.org) v1.0.4+

### Installation

```
$ npm instal uson
```

### Usage

API is almost same as JSON API:
* `USON.parse(str, mode="object", customTypes={})`
* `USON.stringify(obj, replacer=null, level=2)` - in development

```javascript
var USON = require('uson');
console.log(USON.parse('a b c'));
```
Output:
```javascript
[ 'a', 'b', 'c' ]
```

### Defining own types

```javascript
var USON = require('uson');
var types = {
  welcome: function(value) {
    return("Hello " + value + "!");
  }
};
console.log(USON.parse('welcome!john', null, types));
```
Output:
```javascript
[ 'Hello john!' ]
```

## Browser usage

```
$ bower install uson
```

### Usage

```html
  <script src="bower_components/uson/dist/uson.min.js"></script>
  <script>
    var output = USON.pack('a b c');
    console.log(output);
  </script>
```

## Command-line tool (CLI)

* [Installation](#installation-1)
* [Usage](#usage-2)
* [Example](#example-1)
* [Options](#options)
  * [Result format (optional)](#result-format-optional)
* [Streams support (pipe)](#streams-support-pipe)
* [Complete usage](#complete-usage)


### Installation

You can install node.js CLI utility via npm:
```
$ npm install -g uson
```

### Usage

```
$ uson [options] [expression]
```

### Example

```
$ uson 'user:john age:42'
```

Return:
```json
[{"user":"john"},{"age":42}]
```

### Options

For `object` mode use option `-o, --object`.

For `json` mode use option `-j, --json`.

If you want prettyfied output, use option `-p, --pretty`.

#### Result format (optional)

You can use this output formats:
- JSON (default)
- [YAML](http://yaml.org): `-y, --yaml`
- [MessagePack](http://msgpack.org/): `-m, --msgpack`

For example, this returns YAML in Object mode:
```
$ uson -yo 'endpoint:it:wikipedia'
```

Return:
```yaml
endpoint:
  id: wikipedia
```

### Configuration

#### `.usonrc.js` file

You can create `.usonrc.js` file in your home directory `~/` which may contain your configuration and which is automatically loaded when cli started. Currently it is only possible to define custom data types.

RC file is normal Javascript (Node.js) script. Output must be stored in `module.exports` variable.

##### Example `.usonrc.js`

```javascript
var chance = require('chance')();

module.exports = {
  types: {
    g: function(val) {
      var args = [];
      var cmd = null;
      if(typeof val == "object") {
        cmd = Object.keys(val)[0];
        args = val[cmd];
      } else {
        cmd = val;
      }
      return chance[cmd] ? chance[cmd](args) : null;
    },
    js: function(js) {
      return eval(js);
    },
    'hello': function(val) {
      return 'Hello '+ val;
    }
  }
}
```

With this example RC file you can generate random values (with excellent [Chance](http://chancejs.com) library), execute Javascript code or simple say hello:

```
$ uson -op 'calc:js!"36+64" name:g!name ip:g!ip welcome:hello!Mark'
```

And this is result in `object` mode:

```json
{
  "calc": 100,
  "name": "Jeffrey Mendez",
  "ip": "237.63.92.106",
  "welcome": "Hello Mark"
}
```

### Streams support (pipe)

If you dont specify any input or options then input is taken from standart stdin. This can be used for "piping" results:

```
$ echo "a b c:[a:42]" | uson | jq .[2].c[0].a
```
Result:

```json
42
```

### Complete usage

```
$ uson --h

  Usage: uson [options] [expression]

  μson (uson) is a shorthand for JSON

  Options:

    -h, --help             output usage information
    -V, --version          output the version number
    -o, --object           "object" mode
    -j, --json             "json" mode
    -i, --input <file>     Load data from file
        --output <file>    Write output to file
    -p, --pretty           Pretty print output (only JSON)
    -y, --yaml             Return output in YAML (optional)
    -m, --msgpack          Return output in msgpack (optional)
    -u, --usonrc <usonrc>  Use <usonrc> instead of any .usonrc.js
        --hex              Output in hex encoding
        --base64           Output in base64 encoding

```

## NPM package stats
[![NPM](https://nodei.co/npm/uson.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/uson/)

## Inspiration
Inspired by python CLI utility [jarg](https://github.com/jdp/jarg) by Justin Poliey ([@jdp](https://github.com/jdp)).

## Author
Jan Stránský &lt;jan.stransky@arnal.cz&gt;

## Licence
MIT

