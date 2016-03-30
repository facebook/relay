// @generated
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @fullSyntaxTransform
 */

'use strict';

var _require = require('./GraphQL');

var buildClientSchema = _require.utilities_buildClientSchema.buildClientSchema;

// TODO: This is a hack since graphql does not export `buildDirective` directly.
// We should replace this with functionality exported by graphql.

function buildDirective(directive) {
  return buildClientSchema({
    __schema: {
      queryType: { name: 'Root' },
      types: [{
        "kind": "OBJECT",
        "name": "Root",
        "description": null,
        fields: [{
          "name": "dummy",
          "description": null,
          "args": [],
          "type": {
            "kind": "SCALAR",
            "name": "Boolean"
          },
          "isDeprecated": false
        }],
        "inputFields": null,
        "interfaces": [],
        "enumValues": null,
        "possibleTypes": null
      }],
      directives: [directive]
    }
  }).getDirective(directive.name);
};

module.exports = buildDirective;