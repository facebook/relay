/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

/**
 * @internal
 *
 * These are types shared across multiple files within Relay internals.
 */

import type RelayQuery from '../query/RelayQuery';
import type {DataID} from 'RelayRuntime';

type AfterConnectionArgumentMap = {
  after: string,
  first: number,
};
type BeforeConnectionArgumentMap = {
  before: string,
  last: number,
};
type HeadConnectionArgumentMap = {
  before: string,
  first: number,
};
// Maps root calls to a single data ID through an indentifying arg (or EMPTY)
// eg. username(name: "joe")   => '123'
//     username(name: "steve") => '456'
//     viewer                  => '456'
type IdentifyingArgsMap = {[identifyingArgValue: string]: DataID};
type InitialHeadConnectionArgumentMap = {
  first: number,
};
type InitialTailConnectionArgumentMap = {
  last: number,
};
type TailConnectionArgumentMap = {
  after: string,
  last: number,
};

export type Call = {
  name: string,
  type?: string,
  value: CallValue,
};
export type CallValue = ?(
  | boolean
  | number
  | string
  | {[key: string]: CallValue}
  | Array<CallValue>);
export type ClientMutationID = string;
export type ConnectionArgumentsMap =
  | AfterConnectionArgumentMap
  | BeforeConnectionArgumentMap
  | HeadConnectionArgumentMap
  | InitialHeadConnectionArgumentMap
  | InitialTailConnectionArgumentMap
  | TailConnectionArgumentMap;
export type Directive = {
  args: Array<Call>,
  name: string,
};
export type FieldValue = mixed;
export type MutationVariables = {
  input: {[key: string]: mixed},
};
// maps node IDs to the IDs of the connections that contain them
export type NodeRangeMap = {
  [dataID: DataID]: {[connectionID: DataID]: boolean},
};
export type PrintedQuery = {
  text: string,
  variables: {[key: string]: mixed},
};
export type QueryPayload = {[key: string]: mixed};
export type RelayQuerySet = {[queryName: string]: ?RelayQuery.Root};
export type RootCallMap = {[storageKey: string]: IdentifyingArgsMap};
export type UpdateOptions = {
  // $FlowFixMe(>=0.34.0)
  configs: Array<{[key: string]: mixed}>,
  isOptimisticUpdate: boolean,
};
