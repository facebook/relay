/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getFragmentNameParts
 * @format
 */

'use strict';

const DEFAULT_PROP_NAME = 'data';

/**
 * Matches a GraphQL fragment name pattern, extracting the data property key
 * from the name.
 */
function getFragmentNameParts(fragmentName) {
  const match = fragmentName.match(
    /^([a-zA-Z][a-zA-Z0-9]*)(?:_([a-zA-Z][_a-zA-Z0-9]*))?$/,
  );
  if (!match) {
    throw new Error(
      'BabelPluginGraphQL: Fragments should be named ' +
        '`ModuleName_fragmentName`, got `' +
        fragmentName +
        '`.',
    );
  }
  const module = match[1];
  const propName = match[2];
  if (propName === DEFAULT_PROP_NAME) {
    throw new Error(
      'BabelPluginGraphQL: Fragment `' +
        fragmentName +
        '` should not end in ' +
        '`_data` to avoid conflict with a fragment named `' +
        module +
        '` ' +
        'which also provides resulting data via the React prop `data`. Either ' +
        'rename this fragment to `' +
        module +
        '` or choose a different ' +
        'prop name.',
    );
  }
  return [module, propName || DEFAULT_PROP_NAME];
}

module.exports = getFragmentNameParts;
