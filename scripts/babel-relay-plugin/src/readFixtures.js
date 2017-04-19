'use strict';

var fs = require('fs');
var path = require('path');

var FIXTURE_PATH = path.join(__dirname, '__fixtures__');

function readFixtures() {
  var fileNames = fs.readdirSync(FIXTURE_PATH);
  var fixtures = {};
  fileNames.forEach(function(filename) {
    var match = filename.match(/^\w+\.fixture$/);
    if (match === null) {
      return;
    }
    var name = match[0];
    var data = fs.readFileSync(
      path.join(FIXTURE_PATH, filename),
      {encoding: 'utf8'}
    );
    var parts;

    // Matches a file of form:
    //   Input:
    //   <code>
    //   Output:
    //   <code>
    parts = data.match(new RegExp(
      '(?:^|\\n)' + [
        'Input:\\n([\\s\\S]*)',
        'Output:\\n([\\s\\S]*)'
      ].join('\\n') + '$'
    ));
    if (parts) {
      fixtures[name] = {
        input: parts[1].trim(),
        output: parts[2].trim(),
      };
      return;
    }

    // Matches a file of form:
    //   Input:
    //   <code>
    //   Error:
    //   <code>
    parts = data.match(new RegExp(
      '(?:^|\\n)' + [
        'Input:\\n([\\s\\S]*)',
        'Error:\\n([\\s\\S]*)'
      ].join('\\n') + '$'
    ));
    if (parts) {
      fixtures[name] = {
        input: parts[1].trim(),
        error: parts[2].trim(),
      };
      return;
    }

    throw new Error('Invalid fixture file: ' + filename);
  });

  return fixtures;
}

module.exports = readFixtures;
