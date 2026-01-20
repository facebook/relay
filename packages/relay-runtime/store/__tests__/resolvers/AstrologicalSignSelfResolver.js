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

import type {AstrologicalSignSelfResolver$key} from './__generated__/AstrologicalSignSelfResolver.graphql';
import type {
  AstrologicalSignID,
  ClientAstrologicalSignData,
} from './AstrologicalSignUtils';

const {getHouse, getOpposite} = require('./AstrologicalSignUtils');
const {graphql} = require('relay-runtime');
const {readFragment} = require('relay-runtime/store/ResolverFragments');

/**
 * @RelayResolver AstrologicalSign.self: RelayResolverValue
 * @rootFragment AstrologicalSignSelfResolver
 *
 * Local state knowledge of the user's astrological sign.
 */
function self(
  rootKey: AstrologicalSignSelfResolver$key,
): ClientAstrologicalSignData {
  const sign = readFragment(
    graphql`
      fragment AstrologicalSignSelfResolver on AstrologicalSign {
        id @required(action: THROW)
      }
    `,
    rootKey,
  );

  // id is ID in the schema, but `AstrologicalSignID` in the resolver
  // which actually returns it. This is a typehole we'll need to patch.
  // $FlowFixMe[unclear-type]
  const id: AstrologicalSignID = sign.id as any;
  return {
    house: getHouse(id),
    name: sign.id, // The id is actually the human readable name.
    oppositeSignId: getOpposite(id),
  };
}

module.exports = {
  self,
};
