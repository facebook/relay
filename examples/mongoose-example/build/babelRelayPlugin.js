var getbabelRelayPlugin = require('babel-relay-plugin');
var schema = require('../data/schema.json');

module.exports = getbabelRelayPlugin(schema.data);