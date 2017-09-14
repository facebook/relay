/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @providesModule RelayCompiler
 * @format
 */

'use strict';

const {Compiler} = require('./graphql-compiler/GraphQLCompilerPublic');

/**
 * For now, the `RelayCompiler` *is* the `GraphQLCompiler`, but we're creating
 * this aliasing module to provide for the possibility of divergence (as the
 * `RelayCompiler` becomes more specific, and the `GraphQLCompiler` becomes more
 * general).
 */
const RelayCompiler = Compiler;

module.exports = RelayCompiler;
