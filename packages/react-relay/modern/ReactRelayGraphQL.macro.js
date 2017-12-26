// This module is named the way it is because babel-plugin-macros requires 
// the source string to match the regex /[./]macro(\.js)?$/, and 
// this module is imported in the test suite.

module.exports = require('../../babel-plugin-relay/BabelPluginRelayMacro');