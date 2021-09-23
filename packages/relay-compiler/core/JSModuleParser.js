/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

const FindGraphQLTags = require('../language/javascript/FindGraphQLTags');
const RelaySourceModuleParser = require('./RelaySourceModuleParser');
const getModuleName = require('../util/getModuleName');

import type {SourceModuleParser} from './RelaySourceModuleParser';

const JSModuleParser: SourceModuleParser = RelaySourceModuleParser(
  FindGraphQLTags.find,
  getModuleName,
);

module.exports = JSModuleParser;
