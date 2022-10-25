/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall relay
 */

'use strict';

import type {Query__example_client_object$normalization as ReturnType} from './__generated__/Query__example_client_object$normalization.graphql';

/**
 * @RelayResolver
 * @fieldName example_client_object
 * @onType Query
 * @outputType ClientObject
 */
function example_client_object(): ReturnType {
  return {
    description: 'Hello world',
  };
}

module.exports = {
  example_client_object,
};
