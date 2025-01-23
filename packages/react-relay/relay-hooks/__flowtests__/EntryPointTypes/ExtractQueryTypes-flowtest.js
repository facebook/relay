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

import type {
  EnvironmentProviderOptions,
  ExtractQueryTypes,
  PreloadedQuery,
} from '../../EntryPointTypes.flow';

type Query = {
  +variables: {foo: string, bar: number},
  +response: mixed,
  +rawResponse?: {...},
};

const _good: ExtractQueryTypes<
  EnvironmentProviderOptions,
  {root: PreloadedQuery<Query>},
>['root']['variables'] = {
  foo: 'bar',
  bar: 3,
};

const _bad: ExtractQueryTypes<
  EnvironmentProviderOptions,
  {root: PreloadedQuery<Query>},
  // $FlowExpectedError[prop-missing]
>['root']['variables'] = {
  memebers_are_checked: true,
  // $FlowExpectedError[incompatible-type]
  foo: 1,
  bar: 3,
};
