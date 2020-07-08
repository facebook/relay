/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

const {getSelector} = require('relay-runtime');

import type {FragmentMap, Variables} from 'relay-runtime';

function getRootVariablesForFragments<TProps: {...}>(
  fragments: FragmentMap,
  props: TProps,
): Variables {
  let rootVariables = {};
  // NOTE: For extra safety, we make sure the rootVariables include the
  // variables from all owners in this fragmentSpec, even though they
  // should all point to the same owner
  Object.keys(fragments).forEach(key => {
    const fragmentNode = fragments[key];
    const fragmentRef = props[key];
    const selector = getSelector(fragmentNode, fragmentRef);
    const fragmentOwnerVariables =
      selector != null && selector.kind === 'PluralReaderSelector'
        ? selector.selectors[0]?.owner.variables ?? {}
        : selector?.owner.variables ?? {};
    rootVariables = {
      ...rootVariables,
      /* $FlowFixMe[exponential-spread] (>=0.111.0) This comment suppresses an
       * error found when Flow v0.111.0 was deployed. To see the error, delete
       * this comment and run Flow. */
      ...fragmentOwnerVariables,
    };
  });

  return rootVariables;
}

module.exports = getRootVariablesForFragments;
