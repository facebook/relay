/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * A unique identifier of the current actor.
 */
export type ActorIdentifier = string;

export function assertInternalActorIdentifier(actorIdentifier: ActorIdentifier): void;

export function getActorIdentifier(actorID: string): ActorIdentifier;

export function getDefaultActorIdentifier(): ActorIdentifier;
