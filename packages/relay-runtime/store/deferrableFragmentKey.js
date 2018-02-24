/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule deferrableFragmentKey
 * @flow
 * @format
 */

'use strict';

import type {Variables} from '../util/RelayRuntimeTypes';

function deferrableFragmentKey(
  dataID: string,
  fragmentName: string,
  variables: Variables,
): string {
  const variablesString = Object.keys(variables).reduce(
    (acc, key) => `${acc}${acc ? ',' : ''}${key}:${variables[key]}`,
    '',
  );
  return `path:${dataID},key:${fragmentName},request:${variablesString}`;
}

module.exports = deferrableFragmentKey;
