/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @flow strict-local
 * @format
 */

'use strict';

const useFragment = require('../useFragment');

import {
  fragmentInput,
  keyAnotherNonNullable,
  keyAnotherNullable,
  keyNonNullable,
  keyNonNullablePlural,
  keyNullable,
  keyNullablePlural,
} from './utils';
import type {
  NonNullableData,
  NonNullablePluralData,
  NullableData,
  NullablePluralData,
} from './utils';

/* eslint-disable react-hooks/rules-of-hooks */

// Nullability of returned data type is correct
(useFragment(fragmentInput, keyNonNullable): NonNullableData);
(useFragment(fragmentInput, keyNullable): NullableData);
(useFragment(fragmentInput, keyNonNullablePlural): NonNullablePluralData);
(useFragment(fragmentInput, keyNullablePlural): NullablePluralData);

// $FlowExpectedError: can't cast nullable to non-nullable
(useFragment(fragmentInput, keyNullable): NonNullableData);
// $FlowExpectedError: can't cast nullable plural to non-nullable plural
(useFragment(fragmentInput, keyNullablePlural): NonNullablePluralData);

// $FlowExpectedError: actual type of returned data is correct
(useFragment(fragmentInput, keyAnotherNonNullable): NonNullableData);
// $FlowExpectedError
(useFragment(fragmentInput, keyAnotherNullable): NullableData);

// $FlowExpectedError: Key should be one of the generated types
(useFragment(fragmentInput, 'INVALID_KEY'): NullableData);

/* eslint-enable react-hooks/rules-of-hooks */
