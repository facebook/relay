/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getQueryBuilderForNodeInterface
 */

'use strict';

var RelayQuery = require('RelayQuery');

import type RelayNodeInterface from 'RelayNodeInterface';
import type {RootCallValue} from 'RelayQuery';

function getQueryBuilderForNodeInterface(
  RelayNodeInterface: RelayNodeInterface
) {
  function buildQuery(
    identifyingArgValue?: ?Array<RootCallValue> | ?RootCallValue,
    children?: ?Array<RelayQuery.Node>,
    metadata?: ?{[key: string]: mixed},
    name?: ?string
  ): RelayQuery.Root {
    return RelayQuery.Root.build(
      RelayNodeInterface.NODE,
      identifyingArgValue,
      children,
      {...metadata, identifyingArgName: RelayNodeInterface.ID},
      name
    );
  }
  return buildQuery;
}

module.exports = getQueryBuilderForNodeInterface;
