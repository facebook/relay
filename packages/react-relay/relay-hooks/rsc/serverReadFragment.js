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

import type {Fragment, FragmentType, IEnvironment} from 'relay-runtime';

const {waitForFragmentData} = require('relay-runtime/experimental');

type HasSpread<TFragmentType> = {
  readonly $fragmentSpreads: TFragmentType,
  ...
};

async function serverReadFragment<TFragmentType extends FragmentType, TData>(
  environment: IEnvironment,
  fragment: Fragment<TFragmentType, TData>,
  fragmentRef:
    | HasSpread<TFragmentType>
    | ReadonlyArray<HasSpread<TFragmentType>>,
): Promise<TData> {
  return waitForFragmentData(environment, fragment, fragmentRef);
}

module.exports = serverReadFragment;
