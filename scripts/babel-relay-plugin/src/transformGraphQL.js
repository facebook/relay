'use strict';

var babel = require('babel-core');
var fs = require('fs');
var path = require('path');
var util = require('util');

var getBabelRelayPlugin = require('./getBabelRelayPlugin');

var _schemas = {};
function getSchema(schemaPath) {
  try {
    var schema = _schemas[schemaPath];
    if (!schema) {
      schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8')).data;
      _schemas[schemaPath] = schema;
    }
    return schema;
  } catch (e) {
    throw new Error(util.format(
      'transformGraphQL(): Failed to read schema path `%s`. Error: %s, %s',
       schemaPath,
       e.message,
       e.stack
    ));
  }
}

function transformGraphQL(schemaPath, source, filename) {
  var plugin = getBabelRelayPlugin(getSchema(schemaPath));
  return babel.transform(source, {
    compact: false,
    filename: filename,
    plugins: [plugin],
    blacklist: ['strict'],
    extra: {
      providesModule: 'Fixture',
      debug: false,
    },
  }).code;
}

module.exports = transformGraphQL;
