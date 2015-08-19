// TODO: sync babel config with gulpfile. There are differences (eg, we don't
// want to use the DEV plugin).

var babel = require('babel-core');
var babelPluginModules = require('fbjs/scripts/babel/rewrite-modules');
var fs = require('fs');
var getBabelRelayPlugin = require('babel-relay-plugin');
var objectAssign = require('object-assign');
var path = require('path');

var SCHEMA_PATH = path.resolve(__dirname, 'testschema.json');

var graphQLPlugin = getBabelRelayPlugin(
  JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8')).data
);

var babelOpts = {
  nonStandard: true,
  loose: [
    'es6.classes'
  ],
  stage: 1,
  plugins: [babelPluginModules, graphQLPlugin],
  retainLines: true,
  _moduleMap: objectAssign({}, require('fbjs/module-map'), {
    'React': 'react',
    'ReactUpdates': 'react/lib/ReactUpdates',
    'StaticContainer.react': 'react-static-container'
  }),
  extra: {
    debug: false, // enable to debug the relay babel transform
    documentName: 'UnknownFile'
  },
};

module.exports = {
  process: function(src, path) {
    return babel.transform(src, objectAssign({filename: path}, babelOpts)).code;
  }
};
