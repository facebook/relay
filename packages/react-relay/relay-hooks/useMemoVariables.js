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

import type {Variables} from 'relay-runtime';

const areEqual = require('areEqual');
const {useState} = require('react');

/**
 * Memoizes the passed in `variables` object based on `areEqual` equality.
 * This is useful when a `variables` object is used as a value in a depencency
 * array as it might often be constructed during render.
 */
hook useMemoVariables<TVariables: Variables | null>(
  variables: TVariables,
): TVariables {
  const [mirroredVariables, setMirroredVariables] = useState(variables);
  if (areEqual(variables, mirroredVariables)) {
    return mirroredVariables;
  } else {
    setMirroredVariables(variables);
    return variables;
  }
}

module.exports = useMemoVariables;
