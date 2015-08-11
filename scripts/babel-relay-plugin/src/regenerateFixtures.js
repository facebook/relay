'use strict';

var fs = require('fs');
var path = require('path');

var transformGraphQL = require('./transformGraphQL');
var readFixtures = require('./readFixtures');

var FIXTURE_PATH = path.join(__dirname, '__fixtures__');
var SCHEMA_PATH = path.resolve(__dirname, '__tests__', './testschema.rfc.json');

function writeFile(basename, text) {
  fs.writeFileSync(path.join(FIXTURE_PATH, basename), text, 'utf8');
}

var transform = transformGraphQL.bind(null, SCHEMA_PATH);

function genFixtures() {
  var fixtures = readFixtures();
  Object.keys(fixtures).forEach(function (filename) {
    var fixture = fixtures[filename];
    if (fixture.output !== undefined) {
      // fixture for valid input, update the expected output
      try {
        var graphql = transform(fixture.input, filename);
        writeFile(
          filename,
          [
            'Input:',
            fixture.input,
            '', // newline
            'Output:',
            graphql
          ].join('\n')
        );
        console.log('Updated fixture `%s`.', filename);
      } catch (e) {
        console.error(
          'Failed to transform fixture `%s`: %s: %s',
          filename,
          e.message,
          e.stack
        );
      }
    } // else: fixture for invalid code, nothing to update
  });
}

genFixtures();
