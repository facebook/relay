/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

import type {Fragment} from '../../util/RelayRuntimeTypes';
import type {FragmentType} from '../RelayStoreTypes';
const {readFragment} = require('../ResolverFragments');
const invariant = require('invariant');

/**
 *
 * This a High order function that returns a relay resolver that can read the data for
 * the fragment`.
 *
 * - fragment: contains fragment Reader AST with resolver's data dependencies.
 * - resolverFn: original resolver function that expects a data from the fragment
 * - (optional) fieldName: individual field that needs to be read out of the fragment.
 *
 * This will not call the `resolverFn` if the fragment data for it is null/undefined.
 * The the compiler generates calls to this function, ensuring the correct set of arguments.
 */
function fragmentDataInjector<
  TFragmentType: FragmentType,
  TData: ?{...},
  TResolverFn: ($FlowFixMe, ?$FlowFixMe) => mixed,
>(
  fragment: Fragment<TFragmentType, TData>,
  resolverFn: TResolverFn,
  fieldName?: string,
): (fragmentKey: TFragmentType, args: mixed) => mixed {
  return (fragmentKey: TFragmentType, args: mixed): mixed => {
    const data = readFragment(fragment, fragmentKey);
    if (fieldName != null) {
      if (data == null) {
        return null;
      }

      // If `fieldName` is defined, the resolver expects only
      // the data for this field.
      if (fieldName in data) {
        return resolverFn(data[fieldName], args);
      } else {
        // If both `data` and `fieldName` is available, we expect the
        // `fieldName` field in the `data` object.
        invariant(false, 'Missing field `%` in resolver response.', fieldName);
      }
    } else {
      // By default we will pass the full set of the fragment data to the resolver
      return resolverFn(data, args);
    }
  };
}

module.exports = fragmentDataInjector;
