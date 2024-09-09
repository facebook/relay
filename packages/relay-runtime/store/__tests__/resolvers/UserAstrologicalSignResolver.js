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

import type {UserAstrologicalSignResolver$key} from './__generated__/UserAstrologicalSignResolver.graphql';
import type {AstrologicalSignID} from './AstrologicalSignUtils';
import type {ConcreteClientEdgeResolverReturnType} from 'relay-runtime';

const {findSign} = require('./AstrologicalSignUtils');
const {graphql} = require('relay-runtime');
const {readFragment} = require('relay-runtime/store/ResolverFragments');

/**
 * @RelayResolver User.astrological_sign: AstrologicalSign
 * @rootFragment UserAstrologicalSignResolver
 *
 * A Client Edge that points to a client-defined representation of the user's
 * star sign.
 */
function astrological_sign(
  rootKey: UserAstrologicalSignResolver$key,
): ConcreteClientEdgeResolverReturnType<AstrologicalSignID> {
  const user = readFragment(
    graphql`
      fragment UserAstrologicalSignResolver on User {
        birthdate @required(action: THROW) {
          month @required(action: THROW)
          day @required(action: THROW)
        }
      }
    `,
    rootKey,
  );
  return {id: findSign(user.birthdate.month, user.birthdate.day)};
}

module.exports = {
  astrological_sign,
};
