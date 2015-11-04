/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ConcreteQuery
 * @flow
 * @typechecks
 */

'use strict';

/**
 * @internal
 *
 * Types representing the transformed output of Relay.QL queries.
 */

export type Selection = Field | Fragment;

export type Value =
  BatchCallVariable |
  CallValue |
  CallVariable |
  Array<CallValue>;

export type BatchCallVariable = {
  jsonPath: string;
  kind: 'BatchCallVariable';
  sourceQueryID: string;
};

export type Call = {
  kind: 'Call';
  metadata: {
    type: ?string;
  };
  name: string;
  value: ?Value;
};

export type CallValue = {
  callValue: mixed;
  kind: 'CallValue';
}

export type CallVariable = {
  callVariableName: string;
  kind: 'CallVariable';
};

export type Directive = {
  arguments: ?Array<{
    name: string;
    value: mixed;
  }>;
  kind: 'Directive';
  name: string;
};

export type Field = {
  alias: ?string;
  calls: Array<Call>;
  children: Array<?Selection>;
  condition: ?string; // ?????
  directives: Array<Directive>;
  fieldName: string;
  kind: 'Field';
  metadata: {
    inferredRootCallName: ?string;
    inferredPrimaryKey: ?string;
    isConnection: boolean;
    isFindable: boolean;
    isGenerated: boolean;
    isPlural: boolean;
    isRequisite: boolean;
    isUnionOrInterface: boolean;
    parentType: ?string;
  };
};

export type Fragment = {
  children: Array<?Selection>;
  directives: Array<Directive>;
  isPlural: boolean;
  kind: 'Fragment';
  metadata: {
    plural: boolean;
  };
  name: string;
  type: string;
};

export type Mutation = {
  calls: Array<Call>;
  children: Array<?Selection>;
  directives: Array<Directive>;
  kind: 'Mutation';
  metadata: {
    inputType: ?string;
  };
  name: string;
  responseType: string;
};

export type Query = {
  calls: Array<Call>;
  children: Array<?Selection>;
  directives: Array<Directive>;
  fieldName: string;
  isDeferred: boolean;
  kind: 'Query';
  metadata: {
    identifyingArgName: ?string;
    identifyingArgType: ?string;
  };
  name: string;
};

export type Subscription = {
  calls: Array<Call>;
  children: Array<?Selection>;
  directives: Array<Directive>;
  kind: 'Subscription';
  name: string;
  responseType: string;
  metadata: {
    inputType: string;
  };
};
