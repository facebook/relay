/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @providesModule RelayCompiler
 * @format
 */

'use strict';

const {Compiler} = require('graphql-compiler');

/**
 * For now, the `RelayCompiler` *is* the `GraphQLCompiler`, but we're creating
 * this aliasing module to provide for the possibility of divergence (as the
 * `RelayCompiler` becomes more specific, and the `GraphQLCompiler` becomes more
 * general).
 */
const RelayCompiler = Compiler;

module.exports = RelayCompiler;
