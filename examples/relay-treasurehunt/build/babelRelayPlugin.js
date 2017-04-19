var getBabelRelayPlugin = require('babel-relay-plugin');
var schema = require('../data/schema.json');

module.exports = getBabelRelayPlugin(schema.data);
