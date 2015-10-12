/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

/* eslint-disable no-unused-vars, no-eval */

import babel from 'babel-core/browser';

var GraphQL = require('graphql');
var GraphQLRelay = require('graphql-relay');

export default function(source) {
  // Make these modules available to the schema author through a require shim.
  function require(path) {
    switch (path) {
      case 'graphql': return GraphQL;
      case 'graphql-relay': return GraphQLRelay;

      default: throw new Error(`Cannot find module "${path}"`);
    }
  }
  var {code} = babel.transform(source, {code: true, ast: false});
  return eval(code);
}
