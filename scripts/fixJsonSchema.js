// This script exists to replace the root `anyOf` with `oneOf` in our JSON Schema.
// The Rust Crate `schemars` is not properly outputting `oneOf` so we'll manually edit it here

const fs = require('fs');

const schemaPath = './relay-config-schema.json';

const fileContents = fs.readFileSync(schemaPath, 'utf-8');
const parsedFileContents = JSON.parse(fileContents);

parsedFileContents.oneOf = parsedFileContents.anyOf;
delete parsedFileContents.anyOf;

const outputFileContents = JSON.stringify(parsedFileContents, null, 2);

fs.writeFileSync(schemaPath, outputFileContents);