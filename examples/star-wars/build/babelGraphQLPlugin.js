var fs = require('fs');
var getBabelRelayPlugin = require('babel-relay-plugin');
var path = require('path');

var SCHEMA_PATH = path.resolve(__dirname, '../data/starWarsSchema.json');

var schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));

module.exports = getBabelRelayPlugin(schema.data);
