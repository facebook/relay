/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @flow strict
 * @format
 */

'use strict';

/**
 * A unique identifier of the current actor.
 */
export opaque type ActorIdentifier = string;

const INTERNAL_ACTOR_IDENTIFIER_DO_NOT_USE: ActorIdentifier =
  'INTERNAL_ACTOR_IDENTIFIER_DO_NOT_USE';

module.exports = {
  getActorIdentifier(actorID: string): ActorIdentifier {
    return (actorID: ActorIdentifier);
  },

  getDefaultActorIdentifier(): ActorIdentifier {
    throw new Error('Not Implemented');
  },
  INTERNAL_ACTOR_IDENTIFIER_DO_NOT_USE,
};
