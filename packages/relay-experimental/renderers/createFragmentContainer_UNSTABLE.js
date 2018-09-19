/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

const React = require('React');

const createFragmentRenderer_UNSTABLE = require('./createFragmentRenderer_UNSTABLE');

import type {FragmentSpec} from './DataResourceCache_UNSTABLE';
import type {$FragmentRefs} from './createFragmentRenderer_UNSTABLE';

function createFragmentContainer_UNSTABLE<
  Props: {},
  TComponent: React.ComponentType<Props>,
>(
  Component: TComponent,
  fragmentSpec: FragmentSpec,
): React.ComponentType<$FragmentRefs<React.ElementConfig<TComponent>>> {
  const FragmentRenderer = createFragmentRenderer_UNSTABLE(fragmentSpec);
  return function FragmentContainer(props) {
    const fragmentRefs = {};
    Object.keys(props).forEach(key => {
      if (fragmentSpec.hasOwnProperty(key)) {
        fragmentRefs[key] = props[key];
      }
    });
    return (
      <FragmentRenderer {...fragmentRefs}>
        {({data}) => <Component {...props} {...data} />}
      </FragmentRenderer>
    );
  };
}

module.exports = createFragmentContainer_UNSTABLE;
