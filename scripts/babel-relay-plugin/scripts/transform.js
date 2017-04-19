var argv = require('minimist')(process.argv.slice(2));
var fs = require('fs');
var transformGraphQL = require('../src/transformGraphQL');

function getFilePath(path) {
  return path && fs.existsSync(path) ? path : null;
}

var file = getFilePath(argv.file);
var schema = getFilePath(argv.schema);

if (!file || !schema) {
  console.warn(
    'Usage: %s: --file <file> --schema <schema>',
    process.argv[1]
  );
  process.exit(1);
}

process.stdout.write(
  transformGraphQL(schema, fs.readFileSync(file, 'utf8'), file)
);
