/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
'use strict';

/* eslint-disable no-unused-vars, no-eval */

const GraphQL = require('graphql');
var GraphQLRelay = require('graphql-relay');

import {transform} from 'babel-core';

export default function(source) {
  // Make these modules available to the schema author through a require shim.
  function require(path) {
    switch (path) {
      case 'graphql': return GraphQL;
      case 'graphql-relay': return GraphQLRelay;

      default: throw new Error(`Cannot find module "${path}"`);
    }
  }
  const {code} = transform(source, {ast: false, code: true});
  return eval(code);
}
