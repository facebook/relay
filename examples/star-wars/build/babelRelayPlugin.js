var getBabelRelayPlugin = require('babel-relay-plugin');
var schema = require('../data/starWarsSchema.json');

module.exports = getBabelRelayPlugin(schema.data);
