/**
 * Copyright 2013-2015, Facebook, Inc.
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
  value: CallValue;
};
export type CallValue = mixed;

export type ClientMutationID = string;

export type DataID = string;

export type Directive = {
  name: string;
  arguments: Array<Call>;
};

export type FieldValue = mixed;

export type MutationVariables = {
  input: {[key: string]: mixed};
};

export type PrintedQuery = {
  text: string;
  variables: {[key: string]: mixed};
};

export type RelayQuerySet = {[queryName: string]: ?RelayQuery.Root};

export type UpdateOptions = {
  configs: Array<{[key: string]: mixed}>;
  isOptimisticUpdate: boolean;
};

export type RangeBehaviors = {
  [key: string]: $Enum<GraphQLMutatorConstants.RANGE_OPERATIONS>;
};
