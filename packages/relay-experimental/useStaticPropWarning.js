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

const warning = require('warning');

const {useRef} = require('react');

function useStaticPropWarning(prop: mixed, context: string): void {
  if (__DEV__) {
    // This is calling `useRef` conditionally, but based on the environment
    // __DEV__ setting which shouldn't change. This allows us to only pay the
    // cost of `useRef` in development mode to produce the warning.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const initialPropRef = useRef(prop);
    warning(
      initialPropRef.current === prop,
      'Relay: The %s has to remain the same over the lifetime of a component. ' +
        'Changing it is not supported and will result in unexpected behavior.',
      context,
    );
  }
}

module.exports = useStaticPropWarning;
