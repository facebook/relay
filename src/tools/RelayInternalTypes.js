/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayInternalTypes
 * @flow
 * @typechecks
 */

'use strict';

/**
 * @internal
 *
 * These are types shared across multiple files within Relay internals.
 */

import typeof GraphQLMutatorConstants from 'GraphQLMutatorConstants';
import type RelayQuery from 'RelayQuery';

export type Call = {
  name: string;
  type?: string;
  value: CallValue;
};
export type CallValue = ?(
  boolean |
  number |
  string |
  {[key: string]: CallValue} |
  Array<CallValue>
);

export type ClientMutationID = string;

export type DataID = string;

export type Directive = {
  args: Array<Call>;
  name: string;
};

export type FieldValue = mixed;

export type MutationVariables = {
  input: {[key: string]: mixed};
};

export type PrintedQuery = {
  text: string;
  variables: {[key: string]: mixed};
};

// Maps root calls to a single data ID through an indentifying arg (or EMPTY)
// eg. username(name: "joe")   => '123'
//     username(name: "steve") => '456'
//     viewer                  => '456'
type IdentifyingArgsMap = {[identifyingArgValue: string]: DataID};
export type RootCallMap = {[storageKey: string]: IdentifyingArgsMap};

// maps node IDs to the IDs of the connections that contain them
export type NodeRangeMap = {
  [dataID: DataID]: {[connectionID: DataID]: boolean}
};

export type RelayQuerySet = {[queryName: string]: ?RelayQuery.Root};

export type QueryPayload = {[key: string]: mixed};

export type UpdateOptions = {
  configs: Array<{[key: string]: mixed}>;
  isOptimisticUpdate: boolean;
};

export type RangeBehaviors = {
  [key: string]: $Keys<GraphQLMutatorConstants.RANGE_OPERATIONS>;
};
