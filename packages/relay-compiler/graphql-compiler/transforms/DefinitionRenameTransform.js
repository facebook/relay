'use strict';

const shortHash = require('short-hash');
const resolve = require('resolve');

function transform(doc, filePath) {
  return {
    ...doc,
    definitions: doc.definitions.map(def => ({
      ...def,
      metadata: {
        ...def.metadata,
        filePath,
        originalName: def.name.value,
      },
      name: {
        ...def.name,
        value: `${def.name.value}_${shortHash(filePath)}`,
      },
    })),
  };
}

module.exports = {transform};
