# μson (uson) 
[![Build Status](https://travis-ci.org/burningtree/uson.svg)](https://travis-ci.org/burningtree/uson) [![Dependency Status](https://david-dm.org/burningtree/uson.svg)](https://david-dm.org/burningtree/uson) [![npm](https://img.shields.io/npm/v/uson.svg)](https://www.npmjs.com/package/uson)

A compact human-readable data serialization format especially designed for shell.

This is initial implementation written in Javascript and node.js. Grammar is written in [PEG](http://en.wikipedia.org/wiki/Parsing_expression_grammar) and parser is generated by [peg.js](http://pegjs.org/). For more info see [Gramar](#grammar).

* [μson Overview](#%CE%BCson-overview)
* [Node.js module](#nodejs-module)
* [Browser usage](#browser-usage)
* [CLI (command-line) tool](#cli-command-line-tool)
* [Inspiration](#inspiration)
* [Author](#author)

## μson Overview

* [Introduction](#introduction)
  * [Principles](#principles)
  * [Output modes](#output-modes)
* [Example](#example)
* [Basic usage](#basic-usage)
  * [Standart types](#standart-types)
  * [Arrays](#arrays)
  * [Objects](#objects)
  * [Nested objects (expanding)](#nested-objects-expanding)
  * [Comments](#comments)
* [Grammar](#grammar)

### Introduction

#### Principles
* Whitespace is not significant.
* String quoting is optional.
* In Array or Object, comma `,` can be replaced by whitespace ` `.

#### Output modes
There are two output modes:
* `array` (default) - Output as array.
* `object` - Output as combined object. Suitable for use in the command line.

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

Supported types (JSON):
* string
* number
* array
* object
* true
* false
* null

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
}⏎  
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
}⏎
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

#### Nested objects (expanding)

You can use standart colon notation for expand objects, for example:

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

#### Comments
Comments beginning with `#` and terminates on end of line.

```
array:[1 2 3] # this is comment
```

Output:
```json
[1,2,3]
```


### Grammar
See [uson.pegjs](uson.pegjs) file.

* [Visualization of uson grammar](http://dundalek.com/GrammKit/#https://raw.githubusercontent.com/burningtree/uson/master/uson.pegjs).

## Node.js module

### Compatibility
* node.js 0.10+
* [io.js](https://iojs.org) v1.0.4+

### Installation
```
$ npm instal uson
```

### Usage

API is almost same as JSON API:
* `USON.parse(str, objectMode=false)`
* `USON.stringify(obj, replacer=null, level=2)` - in development

```javascript
var USON = require('uson');
console.log(USON.parse('a b c'));
```
Output:
```
[ 'a', 'b', 'c' ]
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

## CLI (command-line) tool

### Installation
You can install node.js CLI utility via npm:
```
$ npm install -g uson
```

### Usage
Usage is simple:

```
$ uson 'user:john age:42'
```
Return:
```
[{"user":"john"},{"age":42}]⏎
```

For `object` mode use option `-o` or `--object`.

If you want prettyfied output, use option `-p` or `--pretty`.

You can use YAML as output format by option `-y` or `--yaml`:
```
$ uson -y -o 'endpoint:id:wikipedia pages:[Malta Prague "New York"]'
```
Return:
```
endpoint:
  id: wikipedia
pages:
  - Malta
  - Prague
  - New York
```

Complete usage:
```
$ uson --h

  Usage: uson [options] [input]

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
    -p, --pretty   Pretty print output (only JSON)
    -y, --yaml     Use YAML dialect instead of JSON
    -o, --object   Object mode
```

### Streams support

If you dont specify any input or options then input is taken from standart stdin. This can be used for "piping" results:

```
$ echo "a b c:[a:42]" | uson | jq .[2].c[0].a
```
Result:

```
42
```

## Inspiration
Inspired by python CLI utility [jarg](https://github.com/jdp/jarg) by Justin Poliey ([@jdp](https://github.com/jdp)).

## Author
Jan Stránský &lt;jan.stransky@arnal.cz&gt;

## Licence
MIT

